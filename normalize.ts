import "dotenv/config";
import { db, stmts } from "./lib/db.js";
import type { JobFilament } from "./lib/types.js";
import { computeSessionOrder } from "./lib/normalize-session-order.js";
import { deriveJobStatus, detectSessions, type RawTask } from "./lib/session-detection.js";
import { invalidateAllPriceCaches } from "./lib/price-cache.js";
import { logInfo } from "./lib/logger.js";

// ── normalize.ts ──────────────────────────────────────────────────────────────
//
// Reads raw_json from print_tasks and populates:
//   - Extracted scalar columns on print_tasks (session_id, instanceId, etc.)
//   - jobs table (one row per print SESSION, not per design)
//   - job_filaments table (one row per AMS slot per task)
//
// Safe to re-run — all writes are idempotent upserts.

const DB_PATH = process.env["BAMBU_DB"] ?? "./bambu_print_history.sqlite";

interface SessionAccumulator {
  provider: string;
  provider_session_id: string;
  provider_printer_id: string | null;
  printer_id: number | null;
  session_id: string;
  instanceId: number | null;
  print_run: number;
  designId: string | null;
  designTitle: string | null;
  modelId: string | null;
  deviceId: string | null;
  deviceModel: string | null;
  startTimes: string[];
  endTimes: string[];
  total_weight_g: number;
  total_time_s: number;
  plate_count: number;
  statuses: string[];
}

type TaskPayload = Record<string, unknown>;

const selectAllTasks = db.prepare<[], RawTask>(
  `SELECT
    id, provider, provider_task_id, provider_printer_id, printer_id,
    status, startTime, endTime, instanceId, plateIndex, deviceId, deviceModel,
    title, failedType, bedType, weight, costTime, raw_json
  FROM print_tasks`,
);

const updateTaskScalars = db.prepare<{
  id: string;
  session_id: string;
  instanceId: number | null;
  plateIndex: number | null;
  deviceModel: string | null;
  title: string | null;
  failedType: number | null;
  bedType: string | null;
}>(`
  UPDATE print_tasks SET
    session_id  = @session_id,
    instanceId  = @instanceId,
    plateIndex  = @plateIndex,
    deviceModel = @deviceModel,
    title       = @title,
    failedType  = @failedType,
    bedType     = @bedType
  WHERE id = @id
`);

function asNumber(v: unknown): number | null {
  return typeof v === "number" ? v : null;
}

function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function createAccumulator(
  sessionId: string,
  task: RawTask,
  payload: TaskPayload,
  instanceId: number | null,
  printRun: number,
): SessionAccumulator {
  const provider = task.provider ?? "bambu";
  return {
    provider,
    provider_session_id: provider === "bambu" ? sessionId : (task.provider_task_id ?? sessionId),
    provider_printer_id: task.provider_printer_id ?? task.deviceId,
    printer_id: task.printer_id ?? null,
    session_id: sessionId,
    instanceId,
    print_run: printRun,
    designId: payload["designId"] != null ? String(payload["designId"]) : null,
    designTitle: asString(payload["designTitle"]) ?? task.title ?? null,
    modelId: asString(payload["modelId"]),
    deviceId: asString(payload["deviceId"]) ?? task.deviceId,
    deviceModel: asString(payload["deviceModel"]) ?? task.deviceModel ?? null,
    startTimes: [],
    endTimes: [],
    total_weight_g: 0,
    total_time_s: 0,
    plate_count: 0,
    statuses: [],
  };
}

function getAmsMapping(payload: TaskPayload): Record<string, unknown>[] {
  const amsMappingRaw = payload["amsDetailMapping"];
  if (!Array.isArray(amsMappingRaw)) return [];

  return amsMappingRaw.filter(
    (slot): slot is Record<string, unknown> => !!slot && typeof slot === "object",
  );
}

const MATERIAL_USAGE_CONFIDENCES = new Set(["actual", "slicer_estimate", "manual", "unknown"]);

function materialUsageConfidence(slot: Record<string, unknown>, provider: string): string {
  const confidence = asString(slot["usageConfidence"]);
  if (confidence && MATERIAL_USAGE_CONFIDENCES.has(confidence)) return confidence;
  return provider === "bambu" ? "actual" : "unknown";
}

function buildFilamentRow(
  taskId: string,
  instanceId: number | null,
  provider: string,
  slot: Record<string, unknown>,
): Omit<JobFilament, "id"> {
  return {
    task_id: taskId,
    instanceId,
    filament_type: asString(slot["filamentType"]),
    filament_id: asString(slot["filamentId"]),
    color: asString(slot["targetColor"]),
    weight_g: asNumber(slot["weight"]),
    ams_id: asNumber(slot["amsId"]),
    slot_id: asNumber(slot["slotId"]),
    material_usage_confidence: materialUsageConfidence(slot, provider),
  };
}

function insertFilaments(
  taskId: string,
  instanceId: number | null,
  provider: string,
  payload: TaskPayload,
): void {
  stmts.deleteJobFilaments.run(taskId);

  for (const slot of getAmsMapping(payload)) {
    stmts.insertFilament.run(buildFilamentRow(taskId, instanceId, provider, slot));
  }
}

function parseTaskPayload(rawJson: string): TaskPayload {
  try {
    const parsed = JSON.parse(rawJson) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as TaskPayload)
      : {};
  } catch {
    return {};
  }
}

function updateAccumulator(
  acc: SessionAccumulator,
  task: RawTask,
  payload: TaskPayload,
  status: string | null,
): void {
  const startTime = asString(payload["startTime"]) ?? task.startTime;
  const endTime = asString(payload["endTime"]) ?? task.endTime;
  if (startTime) acc.startTimes.push(startTime);
  if (endTime) acc.endTimes.push(endTime);

  if (status === "finish") {
    acc.total_weight_g += asNumber(payload["weight"]) ?? task.weight ?? 0;
    acc.total_time_s += asNumber(payload["costTime"]) ?? task.costTime ?? 0;
  }

  acc.plate_count += 1;
  if (status) acc.statuses.push(status);
}

function backfillTasksAndBuildSessions(
  allTasks: RawTask[],
  taskToSession: Map<string, string>,
  sessionOrder: Map<string, number>,
): Map<string, SessionAccumulator> {
  const sessionAccumulators = new Map<string, SessionAccumulator>();

  db.transaction(() => {
    for (const task of allTasks) {
      const { id, status, raw_json } = task;
      const payload = parseTaskPayload(raw_json);
      const instanceId = asNumber(payload["instanceId"]) ?? task.instanceId;
      const sessionId = taskToSession.get(id);
      if (!sessionId) continue;

      updateTaskScalars.run({
        id,
        session_id: sessionId,
        instanceId,
        plateIndex: asNumber(payload["plateIndex"]),
        deviceModel: asString(payload["deviceModel"]) ?? task.deviceModel ?? null,
        title: asString(payload["title"]) ?? task.title ?? null,
        failedType: asNumber(payload["failedType"]) ?? task.failedType ?? null,
        bedType: asString(payload["bedType"]) ?? task.bedType ?? null,
      });

      const existing = sessionAccumulators.get(sessionId);
      const acc =
        existing ??
        createAccumulator(sessionId, task, payload, instanceId, sessionOrder.get(sessionId) ?? 1);
      if (!existing) sessionAccumulators.set(sessionId, acc);

      updateAccumulator(acc, task, payload, status);
      insertFilaments(id, instanceId, task.provider ?? "bambu", payload);
    }
  })();

  return sessionAccumulators;
}

function upsertJobs(sessionAccumulators: Map<string, SessionAccumulator>): number {
  let jobsDone = 0;

  db.transaction(() => {
    for (const acc of sessionAccumulators.values()) {
      stmts.upsertJob.run({
        provider: acc.provider,
        provider_session_id: acc.provider_session_id,
        provider_printer_id: acc.provider_printer_id,
        printer_id: acc.printer_id,
        session_id: acc.session_id,
        instanceId: acc.instanceId,
        print_run: acc.print_run,
        designId: acc.designId,
        designTitle: acc.designTitle,
        modelId: acc.modelId,
        deviceId: acc.deviceId,
        deviceModel: acc.deviceModel,
        startTime: acc.startTimes.length ? ([...acc.startTimes].sort()[0] ?? null) : null,
        endTime: acc.endTimes.length ? ([...acc.endTimes].sort().at(-1) ?? null) : null,
        total_weight_g: Math.round(acc.total_weight_g * 100) / 100,
        total_time_s: acc.total_time_s,
        plate_count: acc.plate_count,
        status: deriveJobStatus(acc.statuses),
      });
      jobsDone += 1;
    }
  })();

  return jobsDone;
}

// ── Core (importable) ─────────────────────────────────────────────────────────

export function runNormalize(): void {
  const allTasks = selectAllTasks.all();
  logInfo(`  Processing ${allTasks.length} tasks...`);

  const taskToSession = detectSessions(allTasks);
  const sessionOrder = computeSessionOrder(allTasks, taskToSession);
  const sessionAccumulators = backfillTasksAndBuildSessions(allTasks, taskToSession, sessionOrder);

  logInfo(`  Backfilled ${allTasks.length} tasks into ${sessionAccumulators.size} sessions.`);

  const jobsDone = upsertJobs(sessionAccumulators);
  logInfo(`  Upserted ${jobsDone} jobs.`);

  invalidateAllPriceCaches();
  logInfo("  Invalidated job/project price caches.");
  logInfo("");
  logInfo("Done.");
}

// ── Standalone entry point ────────────────────────────────────────────────────

if (process.argv[1]?.endsWith("normalize.ts") || process.argv[1]?.endsWith("normalize.js")) {
  logInfo("=== bambu-normalize ===");
  logInfo(`  DB: ${DB_PATH}`);
  logInfo("");
  runNormalize();
  db.close();
}
