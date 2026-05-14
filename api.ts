import "dotenv/config";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { timingSafeEqual } from "node:crypto";
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

const PUBLIC_PATHS = new Set(["/health", "/ui/login", "/ui/app.js", "/ui/app.css"]);
const PUBLIC_FONT_RE = /^\/ui\/fonts\/[\w,.-]+\.(?:woff2|ttf)$/;

const app = new Hono();

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.has(pathname) || PUBLIC_FONT_RE.test(pathname);
}

function isAuthorized(
  pathname: string,
  authorizationHeader: string | undefined,
  session: string,
): boolean {
  if (isPublicPath(pathname)) return true;
  if (safeEqual(authorizationHeader ?? "", `Bearer ${API_KEY}`)) return true;
  if (safeEqual(session, API_KEY)) return true;
  return false;
}

function mountMiddleware(): void {
  app.use("/*", async (c, next) => {
    if (!LOG_REQUESTS) {
      await next();
      return;
    }

    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(
      `  ${methodColor(c.req.method)} ${c.req.path} ${dim("→")} ${statusColor(c.res.status)} ${dim(`${ms}ms`)}`,
    );
  });

  app.use("/*", async (c, next): Promise<void | Response> => {
    const p = c.req.path;
    if (isAuthorized(p, c.req.header("Authorization"), getCookie(c, "session") ?? "")) {
      await next();
      return;
    }
    if (p.startsWith("/ui")) return c.redirect("/ui/login");
    return c.json({ error: "Unauthorized" }, 401);
  });
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
