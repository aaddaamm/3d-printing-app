import type { RawTask } from "./session-detection.js";

type SessionInfo = {
  sessionId: string;
  startTime: string | null;
};

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

export function computeSessionOrder(
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
