import type Database from "better-sqlite3";
import type { SyncLog } from "../types.js";

export function createSyncStatements(db: Database.Database) {
  return {
    getLastSync: db.prepare<[], SyncLog>("SELECT * FROM sync_log ORDER BY id DESC LIMIT 1"),
    insertSyncLog: db.prepare<{ started_at: string }>(
      "INSERT INTO sync_log (started_at) VALUES (@started_at)",
    ),
    updateSyncLog: db.prepare<{
      id: number;
      ended_at: string;
      inserted: number;
      updated: number;
      error: string | null;
    }>(`
      UPDATE sync_log SET ended_at=@ended_at, inserted=@inserted, updated=@updated, error=@error
      WHERE id=@id
    `),
  };
}
