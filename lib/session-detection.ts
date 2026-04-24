import { SESSION_GAP_S } from "./constants.js";

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
