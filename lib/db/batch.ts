import type Database from "better-sqlite3";
import type { PrintTask } from "../types.js";

export function createInsertBatch(
  db: Database.Database,
  upsertTask: { run: (row: PrintTask) => unknown },
): (rows: PrintTask[]) => { inserted: number; updated: number } {
  const countTasks = db.prepare<[], { n: number }>("SELECT COUNT(*) AS n FROM print_tasks");

  return db.transaction((rows: PrintTask[]): { inserted: number; updated: number } => {
    const before = countTasks.get()!.n;
    for (const row of rows) upsertTask.run(row);
    const inserted = countTasks.get()!.n - before;
    return { inserted, updated: rows.length - inserted };
  });
}
