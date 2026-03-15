import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Hono } from "hono";
import { db } from "../lib/db.js";
import { localCoverPath, localCoverExists } from "../lib/covers.js";

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
  status: string | null;         // effective status: status_override ?? API status
  status_override: string | null; // null = following API
  customer: string | null;
  notes: string | null;
  price_override: number | null;
  project_id: number | null;
  cover_url: string | null;
}

export function createUiApp(apiKey: string): Hono {
  const ui = new Hono();

  // HTML shell — injects API key as a global so app.js can auth its requests.
  // Re-read from disk on each request so edits to index.html are live without restart.
  ui.get("/", (c) => {
    const html = fs.readFileSync(path.join(PUBLIC_DIR, "index.html"), "utf8");
    const page = html.replace(
      "</body>",
      `<script>window.API_KEY=${JSON.stringify(apiKey)}</script></body>`,
    );
    return c.html(page);
  });

  // Static assets — served without auth (no sensitive data).
  ui.get("/app.js", (c) => {
    const js = fs.readFileSync(path.join(PUBLIC_DIR, "app.js"), "utf8");
    return new Response(js, { headers: { "Content-Type": "application/javascript" } });
  });

  ui.get("/app.css", (c) => {
    const css = fs.readFileSync(path.join(PUBLIC_DIR, "app.css"), "utf8");
    return new Response(css, { headers: { "Content-Type": "text/css" } });
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
      .prepare<[], JobRow & { first_task_id: string }>(
        `SELECT
          j.id, j.session_id, j.instanceId, j.print_run,
          j.designTitle, j.deviceModel,
          j.startTime, j.endTime,
          j.total_weight_g, j.total_time_s, j.plate_count,
          COALESCE(j.status_override, j.status) AS status, j.status_override,
          j.customer, j.notes, j.price_override, j.project_id,
          (SELECT pt.id FROM print_tasks pt
           WHERE pt.session_id = j.session_id
           ORDER BY pt.plateIndex LIMIT 1) AS first_task_id
        FROM jobs j
        ORDER BY j.startTime DESC`,
      )
      .all();
    const jobs: JobRow[] = rows.map(({ first_task_id, ...row }) => ({
      ...row,
      cover_url:
        first_task_id && localCoverExists(first_task_id)
          ? `/ui/covers/${first_task_id}`
          : null,
    }));
    return c.json({ jobs });
  });

  return ui;
}
