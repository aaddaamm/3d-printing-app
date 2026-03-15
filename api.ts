import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { db, stmts } from "./lib/db.js";
import { tasks } from "./routes/tasks.js";
import { jobs } from "./routes/jobs.js";
import { summary } from "./routes/summary.js";
import { rates } from "./routes/rates.js";
import { projects } from "./routes/projects.js";
import { createUiApp } from "./routes/ui.js";

// ── Colors ────────────────────────────────────────────────────────────────────

const tty = process.stdout.isTTY;
const c = (code: number) => (s: string | number) => tty ? `\x1b[${code}m${s}\x1b[0m` : String(s);
const bold = c(1);
const dim = c(2);
const red = c(31);
const green = c(32);
const yellow = c(33);
const cyan = c(36);

function methodColor(method: string): string {
  switch (method) {
    case "GET":    return cyan(method.padEnd(6));
    case "POST":   return green(method.padEnd(6));
    case "PUT":
    case "PATCH":  return yellow(method.padEnd(6));
    case "DELETE": return red(method.padEnd(6));
    default:       return method.padEnd(6);
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
  console.log(`  ${methodColor(c.req.method)} ${c.req.path} ${dim("→")} ${statusColor(c.res.status)} ${dim(`${ms}ms`)}`);
});

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
  console.log(bold(cyan("=== bambu-api ===")));
  console.log(`  Listening on ${cyan(`http://localhost:${info.port}`)}`);
  console.log(`  UI:          ${cyan(`http://localhost:${info.port}/ui`)}`);
  console.log(`  DB: ${dim(DB_PATH)}`);
});
