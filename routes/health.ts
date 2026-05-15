import { Hono } from "hono";
import { db, stmts } from "../lib/db.js";

export function createHealthRoutes(dbPath: string): Hono {
  const health = new Hono();

  health.get("/", (c) => {
    let ok = true;
    try {
      db.prepare("SELECT 1").get();
    } catch {
      ok = false;
    }
    return c.json({ ok, db: dbPath, last_sync: stmts.getLastSync.get() ?? null });
  });

  health.get("/data-range", (c) => {
    const taskCount = (db.prepare("SELECT COUNT(*) AS n FROM print_tasks").get() as { n: number })
      .n;
    const range = db
      .prepare<
        [],
        { min_start: string | null; max_start: string | null }
      >("SELECT MIN(startTime) AS min_start, MAX(startTime) AS max_start FROM print_tasks")
      .get();

    return c.json({
      task_count: taskCount,
      min_start: range?.min_start ?? null,
      max_start: range?.max_start ?? null,
    });
  });

  return health;
}
