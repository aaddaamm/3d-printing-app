import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Hono, type Context } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import { db } from "../lib/db.js";
import { localCoverPath, localCoverExists } from "../lib/covers.js";
import { SESSION_COOKIE_MAX_AGE } from "../lib/constants.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "..", "public");

interface JobRow {
  id: number;
  session_id: string;
  instanceId: number | null;
  print_run: number;
  designTitle: string | null;
  deviceModel: string | null;
  startTime: string | null;
  endTime: string | null;
  total_weight_g: number | null;
  total_time_s: number | null;
  plate_count: number;
  status: string | null;          // effective status: status_override ?? API status
  status_override: string | null; // null = following API
  customer: string | null;
  notes: string | null;
  price_override: number | null;
  extra_labor_minutes: number | null;
  project_id: number | null;
  cover_url: string | null;
  filament_colors: string[];
}

const LOGIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Sign in — Bambu Print History</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { display: flex; align-items: center; justify-content: center;
           min-height: 100svh; background: #0f0f0f; font-family: system-ui, sans-serif; }
    form { display: flex; flex-direction: column; gap: 12px; width: 320px; }
    h1 { color: #e0e0e0; font-size: 1.1rem; font-weight: 600; text-align: center; margin-bottom: 4px; }
    input { padding: 10px 12px; border-radius: 6px; border: 1px solid #333;
            background: #1a1a1a; color: #e0e0e0; font-size: 1rem; outline: none; }
    input:focus { border-color: #555; }
    button { padding: 10px; border-radius: 6px; border: none; background: #2563eb;
             color: #fff; font-size: 1rem; font-weight: 600; cursor: pointer; }
    button:hover { background: #1d4ed8; }
    .error { color: #f87171; font-size: 0.85rem; text-align: center; }
  </style>
</head>
<body>
  <form method="POST" action="/ui/login">
    <h1>Bambu Print History</h1>
    __ERROR__
    <input type="password" name="key" placeholder="API key" autofocus autocomplete="current-password">
    <button type="submit">Sign in</button>
  </form>
</body>
</html>`;

export function createUiApp(apiKey: string): Hono {
  const ui = new Hono();

  ui.get("/login", (c) => {
    const error = c.req.query("error");
    const page = LOGIN_HTML.replace("__ERROR__", error ? '<p class="error">Incorrect key.</p>' : "");
    return c.html(page);
  });

  ui.post("/login", async (c) => {
    const body = await c.req.parseBody();
    if (body["key"] !== apiKey) return c.redirect("/ui/login?error=1");
    setCookie(c, "session", apiKey, {
      httpOnly: true,
      path: "/",
      sameSite: "Lax",
      secure: process.env["NODE_ENV"] === "production",
      maxAge: SESSION_COOKIE_MAX_AGE,
    });
    return c.redirect("/ui");
  });

  ui.get("/logout", (c) => {
    deleteCookie(c, "session", { path: "/" });
    return c.redirect("/ui/login");
  });

  // HTML shell — re-read from disk on each request so edits are live without restart.
  const serveShell = (c: Context) => {
    const content = fs.readFileSync(path.join(PUBLIC_DIR, "index.html"), "utf8");
    return c.html(content);
  };
  ui.get("/", (c) => serveShell(c));
  ui.get("", (c) => serveShell(c));

  // Static assets — served without auth (no sensitive data).
  ui.get("/app.js", (c) => {
    const js = fs.readFileSync(path.join(PUBLIC_DIR, "app.js"), "utf8");
    return new Response(js, { headers: { "Content-Type": "application/javascript" } });
  });

  ui.get("/app.css", (c) => {
    const css = fs.readFileSync(path.join(PUBLIC_DIR, "app.css"), "utf8");
    return new Response(css, { headers: { "Content-Type": "text/css" } });
  });

  // Component JS modules — served without auth (no sensitive data, imported by app.js).
  ui.get("/components/:file", (c) => {
    const file = c.req.param("file");
    if (!/^[\w-]+\.js$/.test(file)) return c.json({ error: "Not found" }, 404);
    const filePath = path.join(PUBLIC_DIR, "components", file);
    if (!fs.existsSync(filePath)) return c.json({ error: "Not found" }, 404);
    const js = fs.readFileSync(filePath, "utf8");
    return new Response(js, { headers: { "Content-Type": "application/javascript" } });
  });

  // Locally cached cover images — no auth (non-sensitive thumbnails).
  ui.get("/covers/:taskId", (c) => {
    const taskId = c.req.param("taskId");
    if (!/^\d+$/.test(taskId)) return c.json({ error: "Invalid" }, 400);
    if (!localCoverExists(taskId)) return c.json({ error: "Not found" }, 404);
    const data = fs.readFileSync(localCoverPath(taskId));
    return new Response(data, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  });

  // Job data — protected by app-level auth middleware.
  ui.get("/data", (c) => {
    const rows = db
      .prepare<[], Omit<JobRow, "cover_url" | "filament_colors"> & { first_task_id: string; filament_colors_json: string | null }>(
        `SELECT
          j.id, j.session_id, j.instanceId, j.print_run,
          j.designTitle, j.deviceModel,
          j.startTime, j.endTime,
          j.total_weight_g, j.total_time_s, j.plate_count,
          COALESCE(j.status_override, j.status) AS status, j.status_override,
          j.customer, j.notes, j.price_override, j.extra_labor_minutes, j.project_id,
          pt_first.id AS first_task_id,
          (SELECT json_group_array(color) FROM (
            SELECT DISTINCT jf.color
            FROM job_filaments jf
            JOIN print_tasks pt ON jf.task_id = pt.id
            WHERE pt.session_id = j.session_id AND jf.color IS NOT NULL
            ORDER BY jf.ams_id, jf.slot_id
          )) AS filament_colors_json
        FROM jobs j
        LEFT JOIN (
          SELECT id, session_id,
            ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY plateIndex) AS rn
          FROM print_tasks
        ) pt_first ON pt_first.session_id = j.session_id AND pt_first.rn = 1
        ORDER BY j.startTime DESC`,
      )
      .all();
    const jobs: JobRow[] = rows.map(({ first_task_id, filament_colors_json, ...row }) => ({
      ...row,
      cover_url:
        first_task_id && localCoverExists(first_task_id)
          ? `/ui/covers/${first_task_id}`
          : null,
      filament_colors: filament_colors_json
        ? (JSON.parse(filament_colors_json) as string[])
        : [],
    }));
    return c.json({ jobs });
  });

  // SPA catch-all — must be last so static assets and API routes match first
  ui.get("/*", (c) => serveShell(c));

  return ui;
}
