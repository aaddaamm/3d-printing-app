import "dotenv/config"; // pi-lens-ignore: ast-grep:find-import-file-without-extension, find-import-file-without-extension, high-import-coupling
import { Hono } from "hono";
import { serve } from "@hono/node-server"; // pi-lens-ignore: ast-grep:find-import-file-without-extension, find-import-file-without-extension
import { tasks } from "./routes/tasks.js";
import { jobs } from "./routes/jobs.js";
import { summary } from "./routes/summary.js";
import { rates } from "./routes/rates.js";
import { projects } from "./routes/projects.js";
import { printers } from "./routes/printers.js";
import { catalog } from "./routes/catalog.js";
import { createUiApp } from "./routes/ui.js";
import { createHealthRoutes } from "./routes/health.js";
import { bold, dim, cyan } from "./lib/colors.js";
import { createRequestLogger } from "./lib/server/middleware.js";
import { parseSyncSchedules, startSyncScheduler } from "./lib/server/sync-scheduler.js";
import { resolveServerHost } from "./lib/server/host.js";
import { logInfo } from "./lib/logger.js";

const PORT = Number(process.env["PORT"] ?? 3000);
const HOST = resolveServerHost();
const DB_PATH = process.env["BAMBU_DB"] ?? "./bambu_print_history.sqlite";
const SYNC_SCHEDULES = parseSyncSchedules();
const LOG_REQUESTS = process.env["LOG_REQUESTS"] === "1";

const app = new Hono();

function mountMiddleware(): void {
  app.use("/*", createRequestLogger(LOG_REQUESTS));
}

function mountRoutes(): void {
  app.route("/ui", createUiApp());

  app.route("/health", createHealthRoutes(DB_PATH));

  app.route("/tasks", tasks);
  app.route("/jobs", jobs);
  app.route("/projects", projects);
  app.route("/printers", printers);
  app.route("/summary", summary);
  app.route("/rates", rates);
  app.route("/catalog", catalog);
}

function startServer(): void {
  serve({ fetch: app.fetch, port: PORT, hostname: HOST }, (info) => {
    const origin = `http://${HOST}:${info.port}`;
    logInfo(bold(cyan("=== printworks-api ===")));
    logInfo(`  Listening on ${cyan(origin)}`);
    logInfo(`  UI:          ${cyan(`${origin}/ui`)}`);
    logInfo(`  DB: ${dim(DB_PATH)}`);
    startSyncScheduler({ schedules: SYNC_SCHEDULES, appEntryUrl: import.meta.url });
  });
}

mountMiddleware();
mountRoutes();
startServer();
