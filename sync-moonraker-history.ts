import "dotenv/config";
import { db, stmts } from "./lib/db.js";
import { green, red, cyan, bold, dim } from "./lib/colors.js";
import { logError, logInfo } from "./lib/logger.js";
import { MoonrakerHistoryProvider } from "./lib/providers/moonraker/history.js";
import { storeProviderHistory } from "./lib/providers/sync.js";
import {
  defaultDbPath,
  insertSyncLog,
  runPostSyncMaintenance,
  updateSyncLog,
} from "./lib/sync-workflow.js";

const DB_PATH = defaultDbPath();
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

  const syncId = insertSyncLog(db, {
    provider: "moonraker",
    providerPrinterId: PRINTER_ID ?? null,
  });
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

    updateSyncLog(db, syncId, { inserted, updated });
    logInfo(
      `  ${green("Stored history.")} ${bold(String(inserted))} new, ${bold(String(updated))} updated.`,
    );
    logInfo("");

    runPostSyncMaintenance();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    updateSyncLog(db, syncId, { inserted, updated }, message);
    throw error;
  }
}

main()
  .catch((error: unknown) => {
    logError(`\n${red("Error:")} ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  })
  .finally(() => db.close());
