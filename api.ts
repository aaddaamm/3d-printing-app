import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { db, stmts } from "./lib/db.js";
import { tasks } from "./routes/tasks.js";
import { jobs } from "./routes/jobs.js";
import { summary } from "./routes/summary.js";
import { rates } from "./routes/rates.js";
import { projects } from "./routes/projects.js";
import { createUiApp } from "./routes/ui.js";

const API_KEY = process.env["API_KEY"];
if (!API_KEY) {
  console.error("API_KEY env var is required");
  process.exit(1);
}

const PORT = Number(process.env["PORT"] ?? 3000);
const DB_PATH = process.env["BAMBU_DB"] ?? "./bambu_print_history.sqlite";

const app = new Hono();

// ── Auth ──────────────────────────────────────────────────────────────────────
// Public: UI shell + static assets + cached cover images
// Protected: everything else (including /ui/data)

const PUBLIC_UI_PATHS = new Set(["/ui", "/ui/", "/ui/app.js", "/ui/app.css"]);

app.use("/*", async (c, next) => {
  const p = c.req.path;
  if (PUBLIC_UI_PATHS.has(p)) return next();
  if (p.startsWith("/ui/covers/")) return next();
  if (c.req.header("Authorization") === `Bearer ${API_KEY}`) return next();
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

// ── Start ─────────────────────────────────────────────────────────────────────

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log("=== bambu-api ===");
  console.log(`  Listening on http://localhost:${info.port}`);
  console.log(`  UI:          http://localhost:${info.port}/ui`);
  console.log(`  DB: ${DB_PATH}`);
});
