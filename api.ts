import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { tasks } from "./routes/tasks.js";
import { jobs } from "./routes/jobs.js";
import { summary } from "./routes/summary.js";
import { rates } from "./routes/rates.js";
import { projects } from "./routes/projects.js";
import { createUiApp } from "./routes/ui.js";
import { createHealthRoutes } from "./routes/health.js";
import { bold, dim, cyan } from "./lib/colors.js";
import { createAuthMiddleware, createRequestLogger } from "./lib/server/middleware.js";
import { startSyncScheduler } from "./lib/server/sync-scheduler.js";

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

  app.route("/health", createHealthRoutes(DB_PATH));

  app.route("/tasks", tasks);
  app.route("/jobs", jobs);
  app.route("/projects", projects);
  app.route("/summary", summary);
  app.route("/rates", rates);
}

function startServer(): void {
  serve({ fetch: app.fetch, port: PORT }, (info) => {
    console.log(bold(cyan("=== bambu-api ===")));
    console.log(`  Listening on ${cyan(`http://localhost:${info.port}`)}`);
    console.log(`  UI:          ${cyan(`http://localhost:${info.port}/ui`)}`);
    console.log(`  DB: ${dim(DB_PATH)}`);
    startSyncScheduler({ syncIntervalHours: SYNC_INTERVAL_HOURS, appEntryUrl: import.meta.url });
  });
}

mountMiddleware();
mountRoutes();
startServer();
