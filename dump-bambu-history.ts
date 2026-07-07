import "dotenv/config";
import fs from "node:fs";
import os from "node:os";
import { db, insertBatch } from "./lib/db.js";
import { BambuCloudProvider } from "./lib/providers/bambu/cloud.js";
import { downloadCovers, COVERS_DIR } from "./lib/covers.js";
import { API_PAGE_LIMIT } from "./lib/constants.js";
import {
  defaultDbPath,
  insertSyncLog,
  runPostSyncMaintenance,
  updateSyncLog,
} from "./lib/sync-workflow.js";
import { bold, dim, red, green, yellow, cyan } from "./lib/colors.js";
import { logError, logInfo, logWarn } from "./lib/logger.js";

// ── Config ────────────────────────────────────────────────────────────────────

const BASE_URL = process.env["BAMBU_BASE_URL"] ?? "https://api.bambulab.com";
if (!BASE_URL.startsWith("https://")) {
  logError("BAMBU_BASE_URL must use https://");
  process.exit(1);
}

function resolveTokenPath(): string {
  const home = os.homedir();
  if (!home) throw new Error("Unable to resolve home directory");
  return `${home}/.bambu_token`;
}

const TOKEN_PATH = resolveTokenPath();
const DEVICE_ID = process.env["BAMBU_DEVICE_ID"];
const LIMIT = Number(process.env["BAMBU_LIMIT"] ?? API_PAGE_LIMIT);
const DB_PATH = defaultDbPath();

type FetchSummary = {
  total: number;
  inserted: number;
  updated: number;
  apiTotal: number | string;
};

function readToken(raw: string): string {
  const s = raw.trim();
  try {
    const parsed = JSON.parse(s) as unknown;
    const isObject = parsed !== null && typeof parsed === "object";
    const hasToken = isObject && "token" in parsed;
    const tokenValue = hasToken ? (parsed as { token: unknown }).token : null;
    const hasStringToken = typeof tokenValue === "string";
    if (hasStringToken) {
      return tokenValue.trim();
    }
  } catch {
    // not JSON — treat as raw token string
  }
  return s;
}

function resolveToken(): string {
  if (process.env["BAMBU_TOKEN"]) {
    return readToken(process.env["BAMBU_TOKEN"]);
  }

  if (!fs.existsSync(TOKEN_PATH)) {
    return "";
  }

  const stat = fs.lstatSync(TOKEN_PATH);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error(`BAMBU_TOKEN_PATH must point to a regular file: ${TOKEN_PATH}`);
  }

  return readToken(fs.readFileSync(TOKEN_PATH, "utf8"));
}

function validateConfig(token: string): void {
  if (!token) {
    logError(`No token found. Set BAMBU_TOKEN or ensure token exists at ${TOKEN_PATH}`);
    process.exit(1);
  }

  if (!Number.isFinite(LIMIT) || LIMIT <= 0) {
    logError("BAMBU_LIMIT must be a positive number");
    process.exit(1);
  }

  if (!process.env["BAMBU_TOKEN"] && fs.existsSync(TOKEN_PATH)) {
    const mode = fs.statSync(TOKEN_PATH).mode;
    if (mode & 0o044) {
      logWarn(
        `Warning: ${TOKEN_PATH} is readable by group/others (mode ${(mode & 0o777).toString(8)}). Run: chmod 600 ${TOKEN_PATH}`,
      );
    }
  }
}

function printHeader(): void {
  const tokenSource = process.env["BAMBU_TOKEN"] ? "BAMBU_TOKEN env var" : TOKEN_PATH;
  logInfo(bold(cyan("=== bambu-cloud-sync ===")));
  logInfo(`  ${dim("Token :")} ${tokenSource}`);
  logInfo(`  ${dim("API   :")} ${cyan(BASE_URL)}`);
  logInfo(`  ${dim("DB    :")} ${dim(DB_PATH)}`);
  if (DEVICE_ID) logInfo(`  ${dim("Device:")} ${DEVICE_ID}`);
  logInfo("");
}

async function fetchAndStoreTasks(
  provider: BambuCloudProvider,
  syncId: number,
): Promise<FetchSummary> {
  let total = 0;
  let inserted = 0;
  let updated = 0;
  let offset = 0;
  let apiTotal: number | string | undefined;

  try {
    while (true) {
      process.stdout.write(`\r  Fetching tasks: offset ${offset}...   `);
      const page = await provider.fetchTaskPage(offset);

      const tasks = page.tasks;
      apiTotal = page.apiTotal;
      if (tasks.length === 0) break;

      const counts = insertBatch(page.printTasks);
      total += tasks.length;
      inserted += counts.inserted;
      updated += counts.updated;

      process.stdout.write(
        `\r  Fetching tasks: ${bold(String(total))}/${apiTotal} (${green(`${inserted} new`)}, ${yellow(`${updated} updated`)})   `,
      );

      const numericApiTotal = typeof apiTotal === "number" ? apiTotal : Number.POSITIVE_INFINITY;
      offset += tasks.length;
      if (offset >= numericApiTotal) break;
    }

    process.stdout.write("\n");
    logInfo(
      `  ${green("Done.")} ${bold(String(total))} tasks from API ${dim(`(${apiTotal} lifetime total)`)}.`,
    );

    updateSyncLog(db, syncId, { inserted, updated });
  } catch (e) {
    process.stdout.write("\n");
    const msg = e instanceof Error ? e.message : String(e);
    updateSyncLog(db, syncId, { inserted, updated }, msg);
    throw e;
  }

  return { total, inserted, updated, apiTotal };
}

function colorStatusLabel(status: string): string {
  if (status === "finish") return green(status);
  if (status === "failed" || status === "cancel") return red(status);
  if (status === "running") return cyan(status);
  if (status === "pause") return yellow(status);
  return dim(status);
}

async function runCoverSyncAndSummary(): Promise<void> {
  logInfo(bold(cyan("=== cover images ===")));
  logInfo(`  ${dim("Cache:")} ${dim(COVERS_DIR)}`);
  await downloadCovers();
  logInfo("");

  const statusSummary = db
    .prepare<
      [],
      { status: string | null; n: number }
    >("SELECT status, COUNT(*) AS n FROM print_tasks GROUP BY status ORDER BY n DESC")
    .all();

  logInfo(bold("By status:"));
  for (const row of statusSummary) {
    const s = row.status ?? "(null)";
    const label = colorStatusLabel(s);
    logInfo(`  ${label}: ${bold(String(row.n))}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const token = resolveToken();
  validateConfig(token);
  printHeader();

  const startedAt = Date.now();
  const syncId = insertSyncLog(db, { provider: "bambu", providerPrinterId: DEVICE_ID ?? null });

  process.on("SIGINT", () => {
    logInfo(`\n\n${yellow("Interrupted.")} Exiting safely.`);
    db.close();
    process.exit(0);
  });

  const provider = new BambuCloudProvider({
    baseUrl: BASE_URL,
    token,
    limit: LIMIT,
    deviceId: DEVICE_ID,
  });

  await fetchAndStoreTasks(provider, syncId);
  runPostSyncMaintenance({ elapsedFrom: startedAt, dbPath: DB_PATH });
  await runCoverSyncAndSummary();

  db.close();
}

main().catch((e: unknown) => {
  logError(`\n${red("Error:")} ${e instanceof Error ? e.message : String(e)}`);
  db.close();
  process.exit(1);
});
