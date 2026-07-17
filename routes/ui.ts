import { readFileSync, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Hono, type Context } from "hono";
import { ensureLocalCoverCached } from "../lib/covers.js";
import { db } from "../lib/db.js";
import { listUiJobs } from "../models/ui.js";

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
const PRINTER_PHOTO_CANDIDATES = new Map<string, string[]>([
  [
    "a1-mini",
    [
      path.resolve(process.cwd(), "a1_mini.webp"),
      path.resolve(process.cwd(), "frontend/public/printers/a1-mini.webp"),
      path.resolve(process.cwd(), "dist/frontend/public/printers/a1-mini.webp"),
    ],
  ],
  [
    "p1s",
    [
      path.resolve(process.cwd(), "bambu-lab-P1S.webp"),
      path.resolve(process.cwd(), "frontend/public/printers/p1s.webp"),
      path.resolve(process.cwd(), "dist/frontend/public/printers/p1s.webp"),
    ],
  ],
]);

const isProd = process.env["NODE_ENV"] === "production";
const fileCache = new Map<string, string>();
const SAFE_ASSET_FILE_RE = /^[\w.-]+$/;
const SAFE_FONT_FILE_RE = /^[\w,.-]+\.(woff2|ttf)$/;
const IMAGE_CONTENT_TYPES = new Map<string, string>([
  [".gif", "image/gif"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);

function assertInsideDirectory(root: string, candidate: string): string {
  const resolvedRoot = path.resolve(root);
  const resolvedCandidate = path.resolve(candidate);
  if (
    resolvedCandidate !== resolvedRoot &&
    !resolvedCandidate.startsWith(resolvedRoot + path.sep)
  ) {
    throw new Error(`Refusing to serve file outside ${resolvedRoot}: ${resolvedCandidate}`);
  }
  return resolvedCandidate;
}

function resolveStaticFile(root: string, file: string): string {
  return assertInsideDirectory(root, path.join(root, file));
}

function readTextFile(filePath: string): string {
  if (!isProd) return readFileSync(filePath, "utf8");

  const cached = fileCache.get(filePath);
  if (cached !== undefined) return cached;

  const content = readFileSync(filePath, "utf8");
  fileCache.set(filePath, content);
  return content;
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

function resolvePrinterPhotoPath(slug: string): string | null {
  const candidates = PRINTER_PHOTO_CANDIDATES.get(slug) ?? [];
  for (const filePath of candidates) {
    if (existsSync(filePath)) return filePath;
  }
  return null;
}

function serveOptionalTextFile(c: Context, filePath: string, contentType: string): Response {
  if (!existsSync(filePath)) return notFound(c);
  return textResponse(readTextFile(filePath), contentType);
}

function getCssPath(): string {
  return existsSync(DIST_APP_CSS_PATH) ? DIST_APP_CSS_PATH : SOURCE_APP_CSS_PATH;
}

function serveDistJavaScriptBundle(): Response {
  if (!existsSync(DIST_APP_JS_PATH)) {
    return new Response("UI bundle missing. Run npm run build:ui.", { status: 500 });
  }
  return textResponse(readTextFile(DIST_APP_JS_PATH), "application/javascript");
}

function serveAssetFile(c: Context): Response {
  const file = c.req.param("file");
  if (!file || !SAFE_ASSET_FILE_RE.test(file)) return notFound(c);

  const filePath = resolveStaticFile(DIST_ASSETS_PATH, file);
  if (file.endsWith(".css")) return serveOptionalTextFile(c, filePath, "text/css");
  if (file.endsWith(".js")) return serveOptionalTextFile(c, filePath, "application/javascript");
  if (!existsSync(filePath)) return notFound(c);
  return binaryResponse(readFileSync(filePath), "application/octet-stream");
}

function serveChunkFile(c: Context): Response {
  const file = c.req.param("file");
  if (!file || !SAFE_ASSET_FILE_RE.test(file)) return notFound(c);
  const filePath = resolveStaticFile(DIST_CHUNKS_PATH, file);
  return serveOptionalTextFile(c, filePath, "application/javascript");
}

function serveFontFile(c: Context): Response {
  const file = c.req.param("file");
  if (!file || !SAFE_FONT_FILE_RE.test(file)) return notFound(c);
  const content = FONT_CONTENTS.get(file);
  if (!content) return notFound(c);
  const contentType = file.endsWith(".woff2") ? "font/woff2" : "font/ttf";
  return binaryResponse(new Uint8Array(content), contentType);
}

async function serveCoverFile(c: Context): Promise<Response> {
  const taskId = c.req.param("taskId");
  if (!taskId || !/^\d+$/.test(taskId)) return c.json({ error: "Invalid" }, 400);

  const cover = await ensureLocalCoverCached(taskId);
  if (!cover.path) return notFound(c);

  return binaryResponse(
    readFileSync(cover.path),
    "image/png",
    "public, max-age=31536000, immutable",
  );
}

function resolveProductPhotoPath(photoId: number): string | null {
  const row = db
    .prepare<[number], { path: string | null }>(
      `SELECT COALESCE(pp.path, cf.path) AS path
       FROM product_photos pp
       LEFT JOIN catalog_files cf ON cf.id = pp.file_id
       WHERE pp.id = ?`,
    )
    .get(photoId);
  return row?.path ?? null;
}

function serveProductPhotoFile(c: Context): Response {
  const photoId = Number(c.req.param("photoId"));
  if (!Number.isInteger(photoId) || photoId <= 0) return c.json({ error: "Invalid" }, 400);

  const filePath = resolveProductPhotoPath(photoId);
  if (!filePath || !path.isAbsolute(filePath) || !existsSync(filePath)) return notFound(c);

  const contentType = IMAGE_CONTENT_TYPES.get(path.extname(filePath).toLowerCase());
  if (!contentType || !statSync(filePath).isFile()) return notFound(c);

  return binaryResponse(readFileSync(filePath), contentType, "public, max-age=86400");
}

function servePrinterPhotoFile(c: Context): Response {
  const slug = c.req.param("slug");
  if (!slug) return notFound(c);
  const filePath = resolvePrinterPhotoPath(slug);
  if (!filePath) return notFound(c);
  return binaryResponse(readFileSync(filePath), "image/webp", "public, max-age=86400");
}

const FONT_CONTENTS = new Map<string, Buffer>([
  ["Inter-VariableFont_slnt,wght.woff2", readFileSync(INTER_FONT_PATH)],
  ["JetBrainsMono-VariableFont_wght.ttf", readFileSync(JETBRAINS_FONT_PATH)],
]);

function serveShell(c: Context): Response {
  const htmlPath = existsSync(DIST_INDEX_HTML_PATH) ? DIST_INDEX_HTML_PATH : SOURCE_INDEX_HTML_PATH;
  return c.html(readTextFile(htmlPath));
}

function registerStaticRoutes(ui: Hono): void {
  ui.get("/", (c) => serveShell(c));
  ui.get("", (c) => serveShell(c));

  ui.get("/app.js", () => serveDistJavaScriptBundle());

  ui.get("/app.css", () => textResponse(readTextFile(getCssPath()), "text/css"));

  ui.get("/assets/:file", (c) => serveAssetFile(c));

  ui.get("/chunks/:file", (c) => serveChunkFile(c));

  ui.get("/fonts/:file", (c) => serveFontFile(c));

  ui.get("/covers/:taskId", async (c) => serveCoverFile(c));

  ui.get("/product-photos/:photoId", (c) => serveProductPhotoFile(c));

  ui.get("/printers/:slug", (c) => servePrinterPhotoFile(c));
}

function registerDataRoutes(ui: Hono): void {
  ui.get("/data", (c) => c.json({ jobs: listUiJobs() }));
}

export function createUiApp(): Hono {
  const ui = new Hono();

  registerStaticRoutes(ui);
  registerDataRoutes(ui);

  ui.get("/*", (c) => serveShell(c));

  return ui;
}
