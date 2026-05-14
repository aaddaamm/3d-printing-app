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

type CanonicalStatus = keyof typeof STATUS_PRIORITY;

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
  status: string | null;
  startTime: string | null;
  endTime: string | null;
  instanceId: number | null;
  plateIndex: number | null;
  deviceId: string | null;
  raw_json: string;
}

// ── Session detection ─────────────────────────────────────────────────────────
//
// Groups tasks into sessions by (instanceId, deviceId).
// A new session starts when the gap from the previous task's endTime exceeds
// SESSION_GAP_S, or when the task has no usable instanceId (treated as solo).
//
// Returns a Map<taskId, sessionId> covering every task.

function isSoloTask(task: RawTask): boolean {
  return task.instanceId == null || task.instanceId === 0;
}

function groupTasks(tasks: RawTask[]): Map<string, RawTask[]> {
  const groups = new Map<string, RawTask[]>();

  for (const task of tasks) {
    const key = isSoloTask(task) ? `solo:${task.id}` : `${task.instanceId}:${task.deviceId ?? ""}`;
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
    return a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0;
  });
}

function shouldStartNewSession(
  task: RawTask,
  prevEnd: string | null,
  sessionPlateIndexes: Set<number>,
): boolean {
  const repeatsPlate = task.plateIndex != null && sessionPlateIndexes.has(task.plateIndex);
  if (repeatsPlate) return true;

  if (!task.startTime || !prevEnd) return false;

  const gapS = (Date.parse(task.startTime) - Date.parse(prevEnd)) / 1000;
  return gapS > SESSION_GAP_S;
}

function assignGroupSessions(group: RawTask[], taskToSession: Map<string, string>): void {
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
    if (shouldStartNewSession(task, prevEnd, sessionPlateIndexes)) {
      sessionStart = task;
      sessionPlateIndexes = new Set<number>();
    }

    taskToSession.set(task.id, sessionStart.id);
    if (task.plateIndex != null) sessionPlateIndexes.add(task.plateIndex);
    if (task.endTime && (!prevEnd || task.endTime > prevEnd)) prevEnd = task.endTime;
  }
}

export function detectSessions(tasks: RawTask[]): Map<string, string> {
  const taskToSession = new Map<string, string>();
  for (const group of groupTasks(tasks).values()) assignGroupSessions(group, taskToSession);
  return taskToSession;
}
