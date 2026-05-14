import "dotenv/config";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { db, stmts } from "./lib/db.js";
import { tasks } from "./routes/tasks.js";
import { jobs } from "./routes/jobs.js";
import { summary } from "./routes/summary.js";
import { rates } from "./routes/rates.js";
import { projects } from "./routes/projects.js";
import { createUiApp } from "./routes/ui.js";
import { bold, dim, red, cyan } from "./lib/colors.js";
import { createAuthMiddleware, createRequestLogger } from "./lib/server/middleware.js";

function getRequiredApiKey(): string {
  const key = process.env["API_KEY"];
  if (key) return key;
  console.error("API_KEY env var is required");
  throw new Error("API_KEY env var is required");
}

const API_KEY = getRequiredApiKey();

const PORT = Number(process.env["PORT"] ?? 3000);
const DB_PATH = process.env["BAMBU_DB"] ?? "./bambu_print_history.sqlite";
const SYNC_INTERVAL_HOURS = Number(process.env["SYNC_INTERVAL_HOURS"] ?? 0);
const LOG_REQUESTS = process.env["LOG_REQUESTS"] === "1";

const app = new Hono();

function mountMiddleware(): void {
  app.use("/*", createRequestLogger(LOG_REQUESTS));
  app.use("/*", createAuthMiddleware(API_KEY));
}

function mountRoutes(): void {
  app.route("/ui", createUiApp(API_KEY));

  app.get("/health", (c) => {
    let ok = true;
    try {
      db.prepare("SELECT 1").get();
    } catch {
      ok = false;
    }
    return c.json({ ok, db: DB_PATH, last_sync: stmts.getLastSync.get() ?? null });
  });

  app.route("/tasks", tasks);
  app.route("/jobs", jobs);
  app.route("/projects", projects);
  app.route("/summary", summary);
  app.route("/rates", rates);
}

type SyncCommand = { cmd: string; args: string[] };

function buildSyncCommand(): SyncCommand {
  const filename = fileURLToPath(import.meta.url);
  const isCompiled = filename.endsWith(".js");

  if (isCompiled) {
    return {
      cmd: process.execPath,
      args: [fileURLToPath(new URL("./dump-bambu-history.js", import.meta.url))],
    };
  }

  return {
    cmd: "tsx",
    args: [fileURLToPath(new URL("./dump-bambu-history.ts", import.meta.url))],
  };
}

function spawnSync(): Promise<void> {
  const { cmd, args } = buildSyncCommand();
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", env: process.env });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`sync exited with code ${code}`));
    });
    child.on("error", reject);
  });
}

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
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(`${red("Sync error:")} ${error.message}`);
    throw error;
  } finally {
    syncInProgress = false;
  }
}

function startSyncScheduler(): void {
  if (SYNC_INTERVAL_HOURS <= 0) return;

  console.log(`  ${dim("Sync:")} every ${SYNC_INTERVAL_HOURS}h`);
  const intervalMs = SYNC_INTERVAL_HOURS * 3_600_000;
  setTimeout(() => {
    runScheduledSync().catch(() => {
      // already logged in runScheduledSync
    });
  }, 10_000);
  setInterval(() => {
    runScheduledSync().catch(() => {
      // already logged in runScheduledSync
    });
  }, intervalMs);
}

function startServer(): void {
  serve({ fetch: app.fetch, port: PORT }, (info) => {
    console.log(bold(cyan("=== bambu-api ===")));
    console.log(`  Listening on ${cyan(`http://localhost:${info.port}`)}`);
    console.log(`  UI:          ${cyan(`http://localhost:${info.port}/ui`)}`);
    console.log(`  DB: ${dim(DB_PATH)}`);
    startSyncScheduler();
  });
}

mountMiddleware();
mountRoutes();
startServer();
