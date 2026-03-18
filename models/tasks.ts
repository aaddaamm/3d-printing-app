import { db, stmts } from "../lib/db.js";
import type { PrintTask } from "../lib/types.js";

export interface ListTasksFilter {
  status?: string | undefined;
  device?: string | undefined;
  from?: string | undefined;
  to?: string | undefined;
}

export function listTasks({ status, device, from, to }: ListTasksFilter = {}): PrintTask[] {
  const conds: Array<[string, string]> = [];
  if (status) conds.push(["status = ?",       status]);
  if (device) conds.push(["deviceId = ?",      device]);
  if (from)   conds.push(["startTime >= ?",    from]);
  if (to)     conds.push(["startTime <= ?",    to]);
  const where = conds.length ? `WHERE ${conds.map(([sql]) => sql).join(" AND ")}` : "";
  return db
    .prepare<string[], PrintTask>(`SELECT * FROM print_tasks ${where} ORDER BY startTime DESC`)
    .all(...conds.map(([, v]) => v));
}

export function getTaskById(id: string): PrintTask | undefined {
  return stmts.getTaskById.get(id);
}
