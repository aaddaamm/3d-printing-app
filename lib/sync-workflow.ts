import type Database from "better-sqlite3";
import { autoGroupProjects } from "./auto-group.js";
import { dim, green } from "./colors.js";
import { logInfo } from "./logger.js";
import { invalidateAllPriceCaches } from "./price-cache.js";
import { getAllJobPrices } from "../models/jobs.js";
import { getAllProjectPrices } from "../models/projects.js";
import { runNormalize } from "../normalize.js";

export type SyncLogInput = {
  provider?: string | null;
  providerPrinterId?: string | null;
};

export type SyncCounts = {
  inserted: number;
  updated: number;
};

export function defaultDbPath(env: NodeJS.ProcessEnv = process.env): string {
  return env["BAMBU_DB"] ?? "./bambu_print_history.sqlite";
}

export function insertSyncLog(database: Database.Database, input: SyncLogInput = {}): number {
  const { lastInsertRowid } = database
    .prepare(
      `INSERT INTO sync_log (provider, provider_printer_id, started_at)
       VALUES (?, ?, ?)`,
    )
    .run(input.provider ?? null, input.providerPrinterId ?? null, new Date().toISOString());
  return Number(lastInsertRowid);
}

export function updateSyncLog(
  database: Database.Database,
  id: number,
  counts: SyncCounts,
  error: string | null = null,
): void {
  database
    .prepare(
      `UPDATE sync_log
       SET ended_at = ?, inserted = ?, updated = ?, error = ?
       WHERE id = ?`,
    )
    .run(new Date().toISOString(), counts.inserted, counts.updated, error, id);
}

export function runPostSyncMaintenance(
  options: { elapsedFrom?: number; dbPath?: string } = {},
): void {
  if (options.elapsedFrom != null) {
    const elapsed = ((Date.now() - options.elapsedFrom) / 1000).toFixed(1);
    logInfo(`  ${dim("Elapsed:")} ${elapsed}s`);
    logInfo("");
  }

  if (options.dbPath) logInfo(`Saved to: ${dim(options.dbPath)}`);

  logInfo("");
  runNormalize();

  const { created, assigned } = autoGroupProjects();
  if (created > 0 || assigned > 0) {
    logInfo(
      `  Auto-grouped: ${green(String(assigned))} job(s) into projects ${dim(`(${created} new project(s) created)`)}.`,
    );
  }

  invalidateAllPriceCaches();
  const jobPrices = getAllJobPrices();
  const projectPrices = getAllProjectPrices();
  logInfo(
    `  Warmed price cache: ${green(String(Object.keys(jobPrices).length))} jobs, ${green(String(Object.keys(projectPrices).length))} projects.`,
  );
  logInfo("");
}
