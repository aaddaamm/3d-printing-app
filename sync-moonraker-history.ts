import "dotenv/config";
import { db, stmts } from "./lib/db.js";
import { autoGroupProjects } from "./lib/auto-group.js";
import { green, red, cyan, bold, dim } from "./lib/colors.js";
import { logError, logInfo } from "./lib/logger.js";
import { MoonrakerHistoryProvider } from "./lib/providers/moonraker/history.js";
import { storeProviderHistory } from "./lib/providers/sync.js";
import { invalidateAllPriceCaches } from "./lib/price-cache.js";
import { getAllJobPrices } from "./models/jobs.js";
import { getAllProjectPrices } from "./models/projects.js";
import { runNormalize } from "./normalize.js";

const DB_PATH = process.env["BAMBU_DB"] ?? "./bambu_print_history.sqlite";
const BASE_URL = process.env["MOONRAKER_BASE_URL"];
const API_KEY = process.env["MOONRAKER_API_KEY"];
const PRINTER_ID = process.env["MOONRAKER_PRINTER_ID"];
const PRINTER_NAME = process.env["MOONRAKER_PRINTER_NAME"] ?? "Snapmaker U1";
const PRINTER_MODEL = process.env["MOONRAKER_PRINTER_MODEL"] ?? "Snapmaker U1";
const LIMIT = Number(process.env["MOONRAKER_LIMIT"] ?? 50);

function validateConfig(): void {
  if (!BASE_URL) {
    logError("MOONRAKER_BASE_URL is required, for example http://snapmaker-u1.local");
    process.exit(1);
  }

  if (!BASE_URL.startsWith("http://") && !BASE_URL.startsWith("https://")) {
    logError("MOONRAKER_BASE_URL must start with http:// or https://");
    process.exit(1);
  }

  if (!Number.isFinite(LIMIT) || LIMIT <= 0) {
    logError("MOONRAKER_LIMIT must be a positive number");
    process.exit(1);
  }
}

function printHeader(): void {
  logInfo(bold(cyan("=== moonraker-history-sync ===")));
  logInfo(`  ${dim("API     :")} ${cyan(BASE_URL ?? "")}`);
  logInfo(`  ${dim("Printer :")} ${PRINTER_NAME} ${dim(`(${PRINTER_MODEL})`)}`);
  logInfo(`  ${dim("DB      :")} ${dim(DB_PATH)}`);
  logInfo("");
}

function insertSyncLog(): number {
  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO sync_log (provider, provider_printer_id, started_at)
       VALUES (?, ?, ?)`,
    )
    .run("moonraker", PRINTER_ID ?? null, new Date().toISOString());
  return Number(lastInsertRowid);
}

function updateSyncLog(
  id: number,
  inserted: number,
  updated: number,
  error: string | null = null,
): void {
  db.prepare(
    `UPDATE sync_log
     SET ended_at = ?, inserted = ?, updated = ?, error = ?
     WHERE id = ?`,
  ).run(new Date().toISOString(), inserted, updated, error, id);
}

async function main(): Promise<void> {
  validateConfig();
  printHeader();

  const provider = new MoonrakerHistoryProvider({
    baseUrl: BASE_URL!,
    apiKey: API_KEY,
    printerId: PRINTER_ID,
    printerName: PRINTER_NAME,
    printerModel: PRINTER_MODEL,
    limit: LIMIT,
  });

  const syncId = insertSyncLog();
  let inserted = 0;
  let updated = 0;

  try {
    const result = await provider.fetchHistory();
    if (result.errors.length > 0) {
      throw new Error(result.errors.map((error) => error.message).join("; "));
    }

    const stored = storeProviderHistory(db, stmts.upsertTask, provider, result);
    inserted = stored.inserted;
    updated = stored.updated;

    updateSyncLog(syncId, inserted, updated);
    logInfo(
      `  ${green("Stored history.")} ${bold(String(inserted))} new, ${bold(String(updated))} updated.`,
    );
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
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    updateSyncLog(syncId, inserted, updated, message);
    throw error;
  }
}

main()
  .catch((error: unknown) => {
    logError(`\n${red("Error:")} ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  })
  .finally(() => db.close());
