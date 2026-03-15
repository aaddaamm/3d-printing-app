import { db, stmts } from "../lib/db.js";
import type { PrintTask } from "../lib/types.js";

export interface ListTasksFilter {
  status?: string | undefined;
  device?: string | undefined;
  from?: string | undefined;
  to?: string | undefined;
}

export function listTasks({ status, device, from, to }: ListTasksFilter = {}): PrintTask[] {
  const conditions: string[] = [];
  const params: string[] = [];
  if (status) {
    conditions.push("status = ?");
    params.push(status);
  }
  if (device) {
    conditions.push("deviceId = ?");
    params.push(device);
  }
  if (from) {
    conditions.push("startTime >= ?");
    params.push(from);
  }
  if (to) {
    conditions.push("startTime <= ?");
    params.push(to);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return db
    .prepare<string[], PrintTask>(`SELECT * FROM print_tasks ${where} ORDER BY startTime DESC`)
    .all(...params);
}

export function getTaskById(id: string): PrintTask | undefined {
  return stmts.getTaskById.get(id);
}
