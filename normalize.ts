import { db, stmts } from "./lib/db.js";
import type { JobFilament } from "./lib/types.js";
import { SESSION_GAP_S } from "./lib/constants.js";

// ── normalize.ts ──────────────────────────────────────────────────────────────
//
// Reads raw_json from print_tasks and populates:
//   - Extracted scalar columns on print_tasks (session_id, instanceId, etc.)
//   - jobs table (one row per print SESSION, not per design)
//   - job_filaments table (one row per AMS slot per task)
//
// Safe to re-run — all writes are idempotent upserts.

const DB_PATH = process.env["BAMBU_DB"] ?? "./bambu_print_history.sqlite";

// Status priority for deriving a job-level status from its plates.
// Higher = worse outcome wins (a failed plate makes the job failed).
const STATUS_PRIORITY: Record<string, number> = {
  finish: 0,
  running: 1,
  pause: 2,
  cancel: 3,
  failed: 4,
};

export function deriveJobStatus(statuses: string[]): string {
  return statuses.reduce((worst, s) => {
    return (STATUS_PRIORITY[s] ?? 1) > (STATUS_PRIORITY[worst] ?? 1) ? s : worst;
  }, "finish");
}

export interface RawTask {
  id: string;
  status: string | null;
  startTime: string | null;
  endTime: string | null;
  instanceId: number | null;
  deviceId: string | null;
  raw_json: string;
}

interface SessionAccumulator {
  session_id: string;        // first task id in the session
  instanceId: number | null;
  print_run: number;
  designId: string | null;
  designTitle: string | null;
  deviceId: string | null;
  deviceModel: string | null;
  startTimes: string[];
  endTimes: string[];
  total_weight_g: number;
  total_time_s: number;
  plate_count: number;
  statuses: string[];
}

// ── Session detection ─────────────────────────────────────────────────────────
//
// Groups tasks into sessions by (instanceId, deviceId).
// A new session starts when the gap from the previous task's endTime exceeds
// SESSION_GAP_S, or when the task has no usable instanceId (treated as solo).
//
// Returns a Map<taskId, sessionId> covering every task.

export function detectSessions(tasks: RawTask[]): Map<string, string> {
  const taskToSession = new Map<string, string>();

  // Group by (instanceId, deviceId). Tasks with instanceId null/0 are solo.
  const groups = new Map<string, RawTask[]>();
  for (const task of tasks) {
    const iid = task.instanceId;
    if (iid == null || iid === 0) {
      // Each solo task is its own session keyed by its own id
      groups.set(`solo:${task.id}`, [task]);
    } else {
      const key = `${iid}:${task.deviceId ?? ""}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(task);
    }
  }

  for (const group of groups.values()) {
    // Sort by startTime; tasks with no startTime sort to the end
    group.sort((a, b) => {
      if (!a.startTime) return 1;
      if (!b.startTime) return -1;
      return a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0;
    });

    let sessionStart = group[0]!;
    let prevEnd: string | null = sessionStart.endTime;

    for (const task of group) {
      if (task === sessionStart) {
        taskToSession.set(task.id, sessionStart.id);
        continue;
      }

      // Calculate gap in seconds between prev endTime and this startTime
      let newSession = false;
      if (task.startTime && prevEnd) {
        const gapS = (Date.parse(task.startTime) - Date.parse(prevEnd)) / 1000;
        if (gapS > SESSION_GAP_S) newSession = true;
      } else if (!task.startTime) {
        // No startTime — can't place it; attach to current session
        newSession = false;
      }

      if (newSession) {
        sessionStart = task;
      }

      taskToSession.set(task.id, sessionStart.id);
      // Advance prevEnd to whichever is later
      if (task.endTime && (!prevEnd || task.endTime > prevEnd)) {
        prevEnd = task.endTime;
      }
    }
  }

  return taskToSession;
}

// ── Core (importable) ─────────────────────────────────────────────────────────

export function runNormalize(): void {
  const allTasks = db
    .prepare<[], RawTask>(
      "SELECT id, status, startTime, endTime, instanceId, deviceId, raw_json FROM print_tasks",
    )
    .all();
  console.log(`  Processing ${allTasks.length} tasks...`);

  // ── Pass 1: detect sessions ────────────────────────────────────────────────
  const taskToSession = detectSessions(allTasks);

  // Compute print_run per (instanceId, deviceId, sessionId) in startTime order.
  // We want: first session = run 1, second = run 2, etc.
  const sessionOrder = new Map<string, number>(); // sessionId → print_run
  {
    type SessionInfo = { sessionId: string; instanceId: number | null; deviceId: string | null; startTime: string | null };
    const seen = new Map<string, SessionInfo[]>(); // groupKey → sessions in order

    for (const task of allTasks) {
      const sessionId = taskToSession.get(task.id)!;
      if (sessionOrder.has(sessionId)) continue; // already registered
      const key = task.instanceId && task.instanceId !== 0
        ? `${task.instanceId}:${task.deviceId ?? ""}`
        : `solo:${task.id}`;
      if (!seen.has(key)) seen.set(key, []);
      seen.get(key)!.push({ sessionId, instanceId: task.instanceId, deviceId: task.deviceId, startTime: task.startTime });
    }

    for (const sessions of seen.values()) {
      sessions.sort((a, b) => {
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return a.startTime < b.startTime ? -1 : 1;
      });
      // Deduplicate (multiple tasks in same session map to same sessionId)
      const unique = [...new Map(sessions.map((s) => [s.sessionId, s])).values()];
      unique.forEach((s, i) => sessionOrder.set(s.sessionId, i + 1));
    }
  }

  // ── Pass 2: backfill task scalars + build session accumulators ─────────────
  const sessionAccumulators = new Map<string, SessionAccumulator>();

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

  const normalizeAll = db.transaction(() => {
    for (const { id, status, raw_json } of allTasks) {
      const t = JSON.parse(raw_json) as Record<string, unknown>;
      const instanceId = typeof t["instanceId"] === "number" ? t["instanceId"] : null;
      const sessionId = taskToSession.get(id)!;

      updateTaskScalars.run({
        id,
        session_id: sessionId,
        instanceId,
        plateIndex: typeof t["plateIndex"] === "number" ? t["plateIndex"] : null,
        deviceModel: typeof t["deviceModel"] === "string" ? t["deviceModel"] : null,
        title: typeof t["title"] === "string" ? t["title"] : null,
        failedType: typeof t["failedType"] === "number" ? t["failedType"] : null,
        bedType: typeof t["bedType"] === "string" ? t["bedType"] : null,
      });

      // Accumulate into the session's job record
      if (!sessionAccumulators.has(sessionId)) {
        sessionAccumulators.set(sessionId, {
          session_id: sessionId,
          instanceId,
          print_run: sessionOrder.get(sessionId) ?? 1,
          designId: t["designId"] != null ? String(t["designId"]) : null,
          designTitle: typeof t["designTitle"] === "string" ? t["designTitle"] : null,
          deviceId: typeof t["deviceId"] === "string" ? t["deviceId"] : null,
          deviceModel: typeof t["deviceModel"] === "string" ? t["deviceModel"] : null,
          startTimes: [],
          endTimes: [],
          total_weight_g: 0,
          total_time_s: 0,
          plate_count: 0,
          statuses: [],
        });
      }
      const acc = sessionAccumulators.get(sessionId)!;
      if (typeof t["startTime"] === "string") acc.startTimes.push(t["startTime"]);
      if (typeof t["endTime"] === "string") acc.endTimes.push(t["endTime"]);
      acc.total_weight_g += typeof t["weight"] === "number" ? t["weight"] : 0;
      acc.total_time_s += typeof t["costTime"] === "number" ? t["costTime"] : 0;
      acc.plate_count += 1;
      if (status) acc.statuses.push(status);

      stmts.deleteJobFilaments.run(id);
      const amsMapping = Array.isArray(t["amsDetailMapping"])
        ? (t["amsDetailMapping"] as Record<string, unknown>[])
        : [];
      for (const slot of amsMapping) {
        stmts.insertFilament.run({
          task_id: id,
          instanceId,
          filament_type: typeof slot["filamentType"] === "string" ? slot["filamentType"] : null,
          filament_id: typeof slot["filamentId"] === "string" ? slot["filamentId"] : null,
          color: typeof slot["targetColor"] === "string" ? slot["targetColor"] : null,
          weight_g: typeof slot["weight"] === "number" ? slot["weight"] : null,
          ams_id: typeof slot["amsId"] === "number" ? slot["amsId"] : null,
          slot_id: typeof slot["slotId"] === "number" ? slot["slotId"] : null,
        } as Omit<JobFilament, "id">);
      }
    }
  });

  normalizeAll();
  console.log(`  Backfilled ${allTasks.length} tasks into ${sessionAccumulators.size} sessions.`);

  // ── Pass 3: upsert jobs ────────────────────────────────────────────────────
  let jobsDone = 0;
  const upsertJobs = db.transaction(() => {
    for (const acc of sessionAccumulators.values()) {
      stmts.upsertJob.run({
        session_id: acc.session_id,
        instanceId: acc.instanceId,
        print_run: acc.print_run,
        designId: acc.designId,
        designTitle: acc.designTitle,
        deviceId: acc.deviceId,
        deviceModel: acc.deviceModel,
        startTime: acc.startTimes.length ? acc.startTimes.sort()[0]! : null,
        endTime: acc.endTimes.length ? acc.endTimes.sort().at(-1)! : null,
        total_weight_g: Math.round(acc.total_weight_g * 100) / 100,
        total_time_s: acc.total_time_s,
        plate_count: acc.plate_count,
        status: deriveJobStatus(acc.statuses),
      });
      jobsDone++;
    }
  });

  upsertJobs();
  console.log(`  Upserted ${jobsDone} jobs.`);
  console.log("");
  console.log("Done.");
}

// ── Standalone entry point ────────────────────────────────────────────────────

if (process.argv[1]?.endsWith("normalize.ts") || process.argv[1]?.endsWith("normalize.js")) {
  console.log("=== bambu-normalize ===");
  console.log(`  DB: ${DB_PATH}`);
  console.log("");
  runNormalize();
  db.close();
}
