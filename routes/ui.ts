import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Hono, type Context } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import { localCoverPath, localCoverExists } from "../lib/covers.js";
import { listUiJobs } from "../models/ui.js";
import { SESSION_COOKIE_MAX_AGE } from "../lib/constants.js";

const SOURCE_INDEX_HTML_PATH = fileURLToPath(new URL("../frontend/index.html", import.meta.url));
const DIST_INDEX_HTML_PATH = fileURLToPath(new URL("../frontend/dist/index.html", import.meta.url));
const DIST_APP_JS_PATH = fileURLToPath(new URL("../frontend/dist/app.js", import.meta.url));
const DIST_APP_CSS_PATH = fileURLToPath(new URL("../frontend/dist/app.css", import.meta.url));
const SOURCE_APP_CSS_PATH = fileURLToPath(new URL("../frontend/app.css", import.meta.url));
const DIST_ASSETS_PATH = fileURLToPath(new URL("../frontend/dist/assets", import.meta.url));
const DIST_CHUNKS_PATH = fileURLToPath(new URL("../frontend/dist/chunks", import.meta.url));
const INTER_FONT_PATH = fileURLToPath(
  new URL("../frontend/fonts/Inter-VariableFont_slnt,wght.woff2", import.meta.url),
);
const JETBRAINS_FONT_PATH = fileURLToPath(
  new URL("../frontend/fonts/JetBrainsMono-VariableFont_wght.ttf", import.meta.url),
);

const DEBUG_LOADING = process.env["DEBUG_LOADING"] === "1";

// In production, static text assets are cached in memory on first read.
// In dev, files are read fresh each request so edits are live without restart.
const isProd = process.env["NODE_ENV"] === "production";
const fileCache = new Map<string, string>();

function readTextFile(filePath: string): string {
  if (isProd) {
    if (!fileCache.has(filePath)) fileCache.set(filePath, readFileSync(filePath, "utf8"));
    return fileCache.get(filePath)!;
  }
  return readFileSync(filePath, "utf8");
}

function textResponse(content: string, contentType: string): Response {
  return new Response(content, { headers: { "Content-Type": contentType } });
}

function binaryResponse(
  content: Uint8Array,
  contentType: string,
  cacheControl = "public, max-age=31536000",
): Response {
  return new Response(new Blob([new Uint8Array(content)]), {
    headers: { "Content-Type": contentType, "Cache-Control": cacheControl },
  });
}

function notFound(c: Context): Response {
  return c.json({ error: "Not found" }, 404);
}

const FONT_CONTENTS = new Map<string, Buffer>([
  ["Inter-VariableFont_slnt,wght.woff2", readFileSync(INTER_FONT_PATH)],
  ["JetBrainsMono-VariableFont_wght.ttf", readFileSync(JETBRAINS_FONT_PATH)],
]);

const LOGIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Sign in — Bambu Print History</title>
  <style>
    @font-face { font-family: "Inter"; src: url("/ui/fonts/Inter-VariableFont_slnt,wght.woff2") format("woff2"); font-display: swap; }
    @font-face { font-family: "JetBrains Mono"; src: url("/ui/fonts/JetBrainsMono-VariableFont_wght.ttf") format("truetype"); font-display: swap; }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { display: flex; align-items: center; justify-content: center;
           min-height: 100svh; background: #0a0a0a; color: #fff; font-family: "Inter", system-ui, sans-serif; }
    form { display: flex; flex-direction: column; gap: 12px; width: min(320px, calc(100vw - 48px)); }
    h1 { display: flex; align-items: center; justify-content: center; gap: 10px;
         color: #fff; font-family: "JetBrains Mono", monospace; font-size: 17px; font-weight: 500;
         text-transform: lowercase; margin-bottom: 8px; }
    h1::before { content: ""; width: 8px; height: 28px; border-radius: 1.5px; background: #3aafa9; }
    input { padding: 10px 12px; border-radius: 8px; border: 1px solid #1a1a1a;
            background: #111; color: #fff; font-size: 1rem; outline: none; }
    input:focus { border-color: #3aafa9; }
    button { padding: 10px; border-radius: 8px; border: none; background: #3aafa9;
             color: #0a0a0a; font-size: 1rem; font-weight: 600; cursor: pointer; }
    button:hover { filter: brightness(1.08); }
    .error { color: #ff6b6b; font-size: 0.85rem; text-align: center; }
  </style>
</head>
<body>
  <form method="POST" action="/ui/login">
    <h1>bambu history</h1>
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
    const page = LOGIN_HTML.replace(
      "__ERROR__",
      error ? '<p class="error">Incorrect key.</p>' : "",
    );
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

  const serveShell = (c: Context) => {
    const htmlPath = existsSync(DIST_INDEX_HTML_PATH)
      ? DIST_INDEX_HTML_PATH
      : SOURCE_INDEX_HTML_PATH;
    const content = readTextFile(htmlPath);
    return c.html(content);
  };
  ui.get("/", (c) => serveShell(c));
  ui.get("", (c) => serveShell(c));

  // Static assets — served without auth (no sensitive data).
  ui.get("/app.js", (_c) => {
    if (!existsSync(DIST_APP_JS_PATH)) {
      return new Response("UI bundle missing. Run npm run build:ui.", { status: 500 });
    }
    return textResponse(readTextFile(DIST_APP_JS_PATH), "application/javascript");
  });

  ui.get("/app.css", (_c) => {
    const cssPath = existsSync(DIST_APP_CSS_PATH) ? DIST_APP_CSS_PATH : SOURCE_APP_CSS_PATH;
    return textResponse(readTextFile(cssPath), "text/css");
  });

  ui.get("/assets/:file", (c) => {
    const file = c.req.param("file");
    if (!/^[\w.-]+$/.test(file)) return notFound(c);
    const filePath = path.join(DIST_ASSETS_PATH, file);
    if (!existsSync(filePath)) return notFound(c);
    if (file.endsWith(".css")) return textResponse(readTextFile(filePath), "text/css");
    if (file.endsWith(".js")) return textResponse(readTextFile(filePath), "application/javascript");
    return binaryResponse(readFileSync(filePath), "application/octet-stream");
  });

  ui.get("/chunks/:file", (c) => {
    const file = c.req.param("file");
    if (!/^[\w.-]+$/.test(file)) return notFound(c);
    const filePath = path.join(DIST_CHUNKS_PATH, file);
    if (!existsSync(filePath)) return notFound(c);
    return textResponse(readTextFile(filePath), "application/javascript");
  });

  ui.get("/fonts/:file", (c) => {
    const file = c.req.param("file");
    if (!/^[\w,.-]+\.(woff2|ttf)$/.test(file)) return notFound(c);
    const content = FONT_CONTENTS.get(file);
    if (!content) return notFound(c);
    const contentType = file.endsWith(".woff2") ? "font/woff2" : "font/ttf";
    return binaryResponse(new Uint8Array(content), contentType);
  });

  // Locally cached cover images — no auth (non-sensitive thumbnails).
  ui.get("/covers/:taskId", (c) => {
    const taskId = c.req.param("taskId");
    if (!/^\d+$/.test(taskId)) return c.json({ error: "Invalid" }, 400);
    if (!localCoverExists(taskId)) return notFound(c);
    return binaryResponse(
      readFileSync(localCoverPath(taskId)),
      "image/png",
      "public, max-age=31536000, immutable",
    );
  });

  // Job data — protected by app-level auth middleware.
  ui.get("/data", (c) => {
    const started = Date.now();
    const jobs = listUiJobs();
    const finished = Date.now();

    if (DEBUG_LOADING) {
      console.log(`[debug-loading] /ui/data jobs=${jobs.length} totalMs=${finished - started}`);
    }

    return c.json({ jobs });
  });

  // SPA catch-all — must be last so static assets and API routes match first
  ui.get("/*", (c) => serveShell(c));

  return ui;
}
