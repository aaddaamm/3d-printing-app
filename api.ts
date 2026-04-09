import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { timingSafeEqual } from "node:crypto";
import path from "node:path";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { db, stmts } from "./lib/db.js";
import { tasks } from "./routes/tasks.js";
import { jobs } from "./routes/jobs.js";
import { summary } from "./routes/summary.js";
import { rates } from "./routes/rates.js";
import { projects } from "./routes/projects.js";
import { createUiApp } from "./routes/ui.js";
import { getCookie } from "hono/cookie";
import { bold, dim, red, green, yellow, cyan } from "./lib/colors.js";

// ── Colors ────────────────────────────────────────────────────────────────────

function methodColor(method: string): string {
  switch (method) {
    case "GET":
      return cyan(method.padEnd(6));
    case "POST":
      return green(method.padEnd(6));
    case "PUT":
    case "PATCH":
      return yellow(method.padEnd(6));
    case "DELETE":
      return red(method.padEnd(6));
    default:
      return method.padEnd(6);
  }
}

function statusColor(status: number): string {
  if (status < 300) return green(status);
  if (status < 400) return cyan(status);
  if (status < 500) return yellow(status);
  return red(status);
}

const API_KEY = process.env["API_KEY"];
if (!API_KEY) {
  console.error("API_KEY env var is required");
  process.exit(1);
}

const PORT = Number(process.env["PORT"] ?? 3000);
const DB_PATH = process.env["BAMBU_DB"] ?? "./bambu_print_history.sqlite";

const app = new Hono();

// ── Request logger ────────────────────────────────────────────────────────────

app.use("/*", async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(
    `  ${methodColor(c.req.method)} ${c.req.path} ${dim("→")} ${statusColor(c.res.status)} ${dim(`${ms}ms`)}`,
  );
});

// ── Auth ──────────────────────────────────────────────────────────────────────
// Public:    /health, /ui/login, static assets (no sensitive data)
// Protected: everything else — Bearer token (API clients) or session cookie (browser)

const PUBLIC_PATHS = new Set(["/health", "/ui/login", "/ui/app.js", "/ui/app.css"]);
// Matches the same set as the /components/:file handler (^[\w-]+\.js$)
const PUBLIC_COMPONENT_RE = /^\/ui\/components\/[\w-]+\.js$/;

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

app.use("/*", async (c, next) => {
  const p = c.req.path;
  if (PUBLIC_PATHS.has(p) || PUBLIC_COMPONENT_RE.test(p)) return next();
  if (safeEqual(c.req.header("Authorization") ?? "", `Bearer ${API_KEY}`)) return next();
  if (safeEqual(getCookie(c, "session") ?? "", API_KEY)) return next();
  if (p.startsWith("/ui")) return c.redirect("/ui/login");
  return c.json({ error: "Unauthorized" }, 401);
});

// ── UI ────────────────────────────────────────────────────────────────────────

app.route("/ui", createUiApp(API_KEY));

// ── Health ────────────────────────────────────────────────────────────────────

app.get("/health", (c) => {
  let ok = true;
  try {
    db.prepare("SELECT 1").get();
  } catch {
    ok = false;
  }
  return c.json({ ok, db: DB_PATH, last_sync: stmts.getLastSync.get() ?? null });
});

// ── Routes ────────────────────────────────────────────────────────────────────

app.route("/tasks", tasks);
app.route("/jobs", jobs);
app.route("/projects", projects);
app.route("/summary", summary);
app.route("/rates", rates);

// ── Sync scheduler ────────────────────────────────────────────────────────────
//
// Set SYNC_INTERVAL_HOURS to run the sync script on a recurring schedule.
// The sync runs as a child process so it opens/closes its own DB connection
// independently — WAL mode allows concurrent reads from the API while it writes.

const SYNC_INTERVAL_HOURS = Number(process.env["SYNC_INTERVAL_HOURS"] ?? 0);

let syncInProgress = false;

async function runScheduledSync(): Promise<void> {
  if (syncInProgress) {
    console.log(dim("  Sync skipped — previous run still in progress"));
    return;
  }
  syncInProgress = true;
  try {
    await spawnSync();
  } catch (e: unknown) {
    console.error(`${red("Sync error:")} ${(e as Error).message}`);
  } finally {
    syncInProgress = false;
  }
}

function spawnSync(): Promise<void> {
  // Detect compiled (production) vs source (tsx dev) by file extension.
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const isCompiled = __filename.endsWith(".js");

  const [cmd, args]: [string, string[]] = isCompiled
    ? [process.execPath, [path.join(__dirname, "dump-bambu-history.js")]]
    : [
        path.join(__dirname, "node_modules", ".bin", "tsx"),
        [path.join(__dirname, "dump-bambu-history.ts")],
      ];

  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", env: process.env });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`sync exited with code ${code}`));
    });
    child.on("error", reject);
  });
}

// ── Start ─────────────────────────────────────────────────────────────────────

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(bold(cyan("=== bambu-api ===")));
  console.log(`  Listening on ${cyan(`http://localhost:${info.port}`)}`);
  console.log(`  UI:          ${cyan(`http://localhost:${info.port}/ui`)}`);
  console.log(`  DB: ${dim(DB_PATH)}`);
  if (SYNC_INTERVAL_HOURS > 0) {
    console.log(`  ${dim("Sync:")} every ${SYNC_INTERVAL_HOURS}h`);
    const intervalMs = SYNC_INTERVAL_HOURS * 3_600_000;
    // First sync 10s after startup, then on the interval
    setTimeout(() => void runScheduledSync(), 10_000);
    setInterval(() => void runScheduledSync(), intervalMs);
  }
});
