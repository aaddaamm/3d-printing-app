import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { db, stmts, insertBatch } from "./lib/db.js";
import { fetchTasks } from "./lib/fetch.js";
import { normalizeTask } from "./lib/normalize.js";
import { runNormalize } from "./normalize.js";
import { downloadCovers, COVERS_DIR } from "./lib/covers.js";

// ── Config ────────────────────────────────────────────────────────────────────

const BASE_URL = process.env["BAMBU_BASE_URL"] ?? "https://api.bambulab.com";
if (!BASE_URL.startsWith("https://")) {
  console.error("BAMBU_BASE_URL must use https://");
  process.exit(1);
}

const TOKEN_PATH = process.env["BAMBU_TOKEN_PATH"] ?? path.join(os.homedir(), ".bambu_token");

function readToken(raw: string): string {
  const s = raw.trim();
  try {
    const parsed = JSON.parse(s) as unknown;
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      "token" in parsed &&
      typeof (parsed as { token: unknown }).token === "string"
    ) {
      return (parsed as { token: string }).token.trim();
    }
  } catch {
    // not JSON — treat as raw token string
  }
  return s;
}

const TOKEN = readToken(
  process.env["BAMBU_TOKEN"] ??
    (fs.existsSync(TOKEN_PATH) ? fs.readFileSync(TOKEN_PATH, "utf8") : ""),
);

if (!TOKEN) {
  console.error(`No token found. Set BAMBU_TOKEN or ensure token exists at ${TOKEN_PATH}`);
  process.exit(1);
}

if (!process.env["BAMBU_TOKEN"] && fs.existsSync(TOKEN_PATH)) {
  const mode = fs.statSync(TOKEN_PATH).mode;
  if (mode & 0o044) {
    console.warn(
      `Warning: ${TOKEN_PATH} is readable by group/others (mode ${(mode & 0o777).toString(8)}). Run: chmod 600 ${TOKEN_PATH}`,
    );
  }
}

const DEVICE_ID = process.env["BAMBU_DEVICE_ID"]; // optional
const LIMIT = Number(process.env["BAMBU_LIMIT"] ?? 1000);
if (!Number.isFinite(LIMIT) || LIMIT <= 0) {
  console.error("BAMBU_LIMIT must be a positive number");
  process.exit(1);
}
const DB_PATH = process.env["BAMBU_DB"] ?? "./bambu_print_history.sqlite"; // for display only

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const tokenSource = process.env["BAMBU_TOKEN"] ? "BAMBU_TOKEN env var" : TOKEN_PATH;
  console.log("=== bambu-history-dump ===");
  console.log(`  Token : ${tokenSource}`);
  console.log(`  API   : ${BASE_URL}`);
  console.log(`  DB    : ${DB_PATH}`);
  if (DEVICE_ID) console.log(`  Device: ${DEVICE_ID}`);
  console.log("");

  let total = 0;
  let inserted = 0;
  let updated = 0;
  const startedAt = Date.now();

  const { lastInsertRowid: syncId } = stmts.insertSyncLog.run({
    started_at: new Date().toISOString(),
  });

  process.on("SIGINT", () => {
    console.log(`\n\nInterrupted. Saved ${total} tasks before exit.`);
    db.close();
    process.exit(0);
  });

  try {
    let offset = 0;
    let apiTotal: number | string = "?";

    while (true) {
      process.stdout.write(`\r  Fetching tasks: offset ${offset}...   `);
      const page = await fetchTasks({
        baseUrl: BASE_URL,
        token: TOKEN,
        limit: LIMIT,
        offset,
        deviceId: DEVICE_ID,
      });
      const tasks = page.hits ?? [];
      apiTotal = page.total ?? "?";

      if (tasks.length === 0) break;

      const counts = insertBatch(tasks.map(normalizeTask));
      total += tasks.length;
      inserted += counts.inserted;
      updated += counts.updated;

      process.stdout.write(`\r  Fetching tasks: ${total}/${apiTotal} (${inserted} new, ${updated} updated)   `);

      if (tasks.length < LIMIT) break;  // last page
      offset += LIMIT;
    }

    process.stdout.write("\n");
    console.log(`  Done. ${total} tasks from API (${apiTotal} lifetime total).`);

    stmts.updateSyncLog.run({
      id: Number(syncId),
      ended_at: new Date().toISOString(),
      inserted,
      updated,
      error: null,
    });
  } catch (e) {
    process.stdout.write("\n");
    const msg = e instanceof Error ? e.message : String(e);
    stmts.updateSyncLog.run({
      id: Number(syncId),
      ended_at: new Date().toISOString(),
      inserted,
      updated,
      error: msg,
    });
    throw e;
  }

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(`  Elapsed: ${elapsed}s`);
  console.log("");
  console.log(`Saved to: ${DB_PATH}`);

  console.log("");
  runNormalize();
  console.log("");

  console.log(`=== cover images ===`);
  console.log(`  Cache: ${COVERS_DIR}`);
  await downloadCovers();
  console.log("");

  const statusSummary = db
    .prepare<
      [],
      { status: string | null; n: number }
    >("SELECT status, COUNT(*) AS n FROM print_tasks GROUP BY status ORDER BY n DESC")
    .all();
  console.log("By status:");
  for (const row of statusSummary) {
    console.log(`  ${row.status ?? "(null)"}: ${row.n}`);
  }

  db.close();
}

main().catch((e: unknown) => {
  console.error(`\nError: ${e instanceof Error ? e.message : String(e)}`);
  db.close();
  process.exit(1);
});
