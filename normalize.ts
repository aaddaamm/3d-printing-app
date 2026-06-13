import "dotenv/config";
import { db, stmts } from "./lib/db.js";
import type { JobFilament } from "./lib/types.js";
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

type SessionInfo = {
  sessionId: string;
  startTime: string | null;
};

const selectAllTasks = db.prepare<[], RawTask>(
  "SELECT id, status, startTime, endTime, instanceId, plateIndex, deviceId, raw_json FROM print_tasks",
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

function getSessionGroupKey(task: RawTask): string {
  return task.instanceId && task.instanceId !== 0
    ? `${task.instanceId}:${task.deviceId ?? ""}`
    : `solo:${task.id}`;
}

function compareSessionStart(a: SessionInfo, b: SessionInfo): number {
  if (!a.startTime) return 1;
  if (!b.startTime) return -1;
  return a.startTime < b.startTime ? -1 : 1;
}

function dedupeSessionsById(sessions: SessionInfo[]): SessionInfo[] {
  return [...new Map(sessions.map((s) => [s.sessionId, s])).values()];
}

function computeSessionOrder(
  allTasks: RawTask[],
  taskToSession: Map<string, string>,
): Map<string, number> {
  const grouped = new Map<string, SessionInfo[]>();

  for (const task of allTasks) {
    const sessionId = taskToSession.get(task.id);
    if (!sessionId) continue;

    const groupKey = getSessionGroupKey(task);
    const sessions = grouped.get(groupKey);
    const info: SessionInfo = { sessionId, startTime: task.startTime };

    if (sessions) {
      sessions.push(info);
    } else {
      grouped.set(groupKey, [info]);
    }
  }

  const sessionOrder = new Map<string, number>();
  for (const sessions of grouped.values()) {
    const orderedSessions = dedupeSessionsById(sessions.sort(compareSessionStart));
    orderedSessions.forEach((session, i) => sessionOrder.set(session.sessionId, i + 1));
  }

  return sessionOrder;
}

function createAccumulator(
  sessionId: string,
  payload: TaskPayload,
  instanceId: number | null,
  printRun: number,
): SessionAccumulator {
  return {
    session_id: sessionId,
    instanceId,
    print_run: printRun,
    designId: payload["designId"] != null ? String(payload["designId"]) : null,
    designTitle: asString(payload["designTitle"]),
    modelId: asString(payload["modelId"]),
    deviceId: asString(payload["deviceId"]),
    deviceModel: asString(payload["deviceModel"]),
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

function buildFilamentRow(
  taskId: string,
  instanceId: number | null,
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
  };
}

function insertFilaments(taskId: string, instanceId: number | null, payload: TaskPayload): void {
  stmts.deleteJobFilaments.run(taskId);

  for (const slot of getAmsMapping(payload)) {
    stmts.insertFilament.run(buildFilamentRow(taskId, instanceId, slot));
  }
}

function updateAccumulator(
  acc: SessionAccumulator,
  payload: TaskPayload,
  status: string | null,
): void {
  const startTime = asString(payload["startTime"]);
  const endTime = asString(payload["endTime"]);
  if (startTime) acc.startTimes.push(startTime);
  if (endTime) acc.endTimes.push(endTime);

  if (status === "finish") {
    acc.total_weight_g += asNumber(payload["weight"]) ?? 0;
    acc.total_time_s += asNumber(payload["costTime"]) ?? 0;
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
    for (const { id, status, raw_json } of allTasks) {
      const payload = JSON.parse(raw_json) as TaskPayload;
      const instanceId = asNumber(payload["instanceId"]);
      const sessionId = taskToSession.get(id);
      if (!sessionId) continue;

      updateTaskScalars.run({
        id,
        session_id: sessionId,
        instanceId,
        plateIndex: asNumber(payload["plateIndex"]),
        deviceModel: asString(payload["deviceModel"]),
        title: asString(payload["title"]),
        failedType: asNumber(payload["failedType"]),
        bedType: asString(payload["bedType"]),
      });

      const existing = sessionAccumulators.get(sessionId);
      const acc =
        existing ??
        createAccumulator(sessionId, payload, instanceId, sessionOrder.get(sessionId) ?? 1);
      if (!existing) sessionAccumulators.set(sessionId, acc);

      updateAccumulator(acc, payload, status);
      insertFilaments(id, instanceId, payload);
    }
  })();

  return sessionAccumulators;
}

function upsertJobs(sessionAccumulators: Map<string, SessionAccumulator>): number {
  let jobsDone = 0;

  db.transaction(() => {
    for (const acc of sessionAccumulators.values()) {
      stmts.upsertJob.run({
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
