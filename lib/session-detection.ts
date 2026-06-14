import { SESSION_GAP_S } from "./constants.js";

// Status priority for deriving a job-level status from its plates.
// Higher = worse outcome wins (a failed plate makes the job failed).
const STATUS_PRIORITY = {
  finish: 0,
  running: 1,
  pause: 2,
  cancel: 3,
  failed: 4,
} as const;

const BAMBU_PROVIDER = "bambu";

type CanonicalStatus = keyof typeof STATUS_PRIORITY;
type SessionStrategy = "bambu" | "one-record-per-session";

// Normalize upstream status strings into the canonical set used by the app.
// Unknown/new statuses are treated as "running" so we never leak arbitrary
// values into jobs.status (which drives UI filters and badge styling).
function canonicalStatus(status: string): CanonicalStatus {
  const s = status.toLowerCase();
  if (s === "created") return "running";
  if (Object.prototype.hasOwnProperty.call(STATUS_PRIORITY, s)) return s as CanonicalStatus;
  return "running";
}

export function deriveJobStatus(statuses: string[]): string {
  return statuses.reduce<CanonicalStatus>((worst, s) => {
    const next = canonicalStatus(s);
    return STATUS_PRIORITY[next] > STATUS_PRIORITY[worst] ? next : worst;
  }, "finish");
}

export interface RawTask {
  id: string;
  provider?: string | null;
  provider_task_id?: string | null;
  provider_printer_id?: string | null;
  printer_id?: number | null;
  status: string | null;
  startTime: string | null;
  endTime: string | null;
  instanceId: number | null;
  plateIndex: number | null;
  deviceId: string | null;
  deviceModel?: string | null;
  title?: string | null;
  failedType?: number | null;
  bedType?: string | null;
  weight?: number | null;
  costTime?: number | null;
  raw_json: string;
}

// ── Session detection ─────────────────────────────────────────────────────────
//
// Bambu keeps the legacy plate-grouping behavior: tasks are grouped by
// (instanceId, deviceId), split on large time gaps, and split on repeated plate
// indexes. Generic providers default to one provider history record = one app
// session/job, because providers like Moonraker usually expose completed jobs
// rather than Bambu-style plates.
//
// Returns a Map<taskId, sessionId> covering every task.

function getSessionStrategy(task: RawTask): SessionStrategy {
  return !task.provider || task.provider === BAMBU_PROVIDER ? "bambu" : "one-record-per-session";
}

function getProviderRecordSessionId(task: RawTask): string {
  return task.provider_task_id || task.id;
}

function isSoloBambuTask(task: RawTask): boolean {
  const missingInstanceId = task.instanceId == null;
  const zeroInstanceId = task.instanceId === 0;
  return missingInstanceId || zeroInstanceId;
}

function groupBambuTasks(tasks: RawTask[]): Map<string, RawTask[]> {
  const groups = new Map<string, RawTask[]>();

  for (const task of tasks) {
    const key = isSoloBambuTask(task)
      ? `solo:${task.id}`
      : `${task.instanceId}:${task.deviceId ?? ""}`;
    const group = groups.get(key);
    if (group) {
      group.push(task);
    } else {
      groups.set(key, [task]);
    }
  }

  return groups;
}

function sortByStartTime(tasks: RawTask[]): void {
  tasks.sort((a, b) => {
    if (!a.startTime) return 1;
    if (!b.startTime) return -1;
    if (a.startTime < b.startTime) return -1;
    if (a.startTime > b.startTime) return 1;
    return 0;
  });
}

function shouldStartNewBambuSession(
  task: RawTask,
  prevEnd: string | null,
  sessionPlateIndexes: Set<number>,
): boolean {
  const plateIndex = task.plateIndex;
  const repeatsPlate = plateIndex != null && sessionPlateIndexes.has(plateIndex);
  if (repeatsPlate) return true;

  const startTime = task.startTime;
  if (!startTime || !prevEnd) return false;

  const gapS = (Date.parse(startTime) - Date.parse(prevEnd)) / 1000;
  return gapS > SESSION_GAP_S;
}

function assignBambuGroupSessions(group: RawTask[], taskToSession: Map<string, string>): void {
  if (group.length === 0) return;

  sortByStartTime(group);

  const first = group[0];
  if (!first) return;

  let sessionStart = first;
  let prevEnd: string | null = first.endTime;
  let sessionPlateIndexes = new Set<number>();

  if (first.plateIndex != null) sessionPlateIndexes.add(first.plateIndex);
  taskToSession.set(first.id, first.id);

  for (const task of group.slice(1)) {
    if (shouldStartNewBambuSession(task, prevEnd, sessionPlateIndexes)) {
      sessionStart = task;
      sessionPlateIndexes = new Set<number>();
    }

    taskToSession.set(task.id, sessionStart.id);
    if (task.plateIndex != null) sessionPlateIndexes.add(task.plateIndex);
    const endTime = task.endTime;
    const shouldAdvancePrevEnd = !!endTime && (!prevEnd || endTime > prevEnd);
    if (shouldAdvancePrevEnd) prevEnd = endTime;
  }
}

export function detectSessions(tasks: RawTask[]): Map<string, string> {
  const taskToSession = new Map<string, string>();
  const bambuTasks: RawTask[] = [];

  for (const task of tasks) {
    const strategy = getSessionStrategy(task);
    if (strategy === "one-record-per-session") {
      taskToSession.set(task.id, getProviderRecordSessionId(task));
    } else {
      bambuTasks.push(task);
    }
  }

  for (const group of groupBambuTasks(bambuTasks).values()) {
    assignBambuGroupSessions(group, taskToSession);
  }

  return taskToSession;
}
