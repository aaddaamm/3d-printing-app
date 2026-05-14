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

  return health;
}
