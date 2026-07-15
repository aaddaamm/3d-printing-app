import { Hono } from "hono";
import {
  CatalogConflictError,
  CatalogValidationError,
  CatalogScanInProgressError,
  addCatalogScanRoot,
  adoptCatalogFile,
  deactivateCatalogScanRoot,
  ignoreCatalogFile,
  listCatalogDuplicateGroups,
  listCatalogFiles,
  listCatalogInboxFiles,
  listCatalogScanRoots,
  readCatalogPreview,
  returnCatalogFileToInbox,
  runCatalogScan,
} from "../models/catalog.js";
import { jsonError, parseId, parseJsonBody } from "../lib/util.js";

export const catalog = new Hono();

const CATALOG_SCAN_STATUSES = new Set(["present", "missing"]);
const CATALOG_REVIEW_STATUSES = new Set(["indexed", "inbox", "referenced", "ignored"]);

function positiveInteger(value: string | undefined, fallback: number): number | null {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

catalog.get("/files", (c) => {
  const page = positiveInteger(c.req.query("page"), 1);
  const pageSize = positiveInteger(c.req.query("pageSize"), 48);
  if (page === null) return jsonError(c, "page must be a positive integer", 400);
  if (pageSize === null || pageSize > 100) {
    return jsonError(c, "pageSize must be an integer between 1 and 100", 400);
  }

  const query = c.req.query("q")?.trim();
  if (query && query.length > 200) return jsonError(c, "q must be 200 characters or fewer", 400);
  const scanStatus = c.req.query("scanStatus");
  if (scanStatus && !CATALOG_SCAN_STATUSES.has(scanStatus)) {
    return jsonError(c, "Invalid scanStatus", 400);
  }
  const reviewStatus = c.req.query("reviewStatus");
  if (reviewStatus && !CATALOG_REVIEW_STATUSES.has(reviewStatus)) {
    return jsonError(c, "Invalid reviewStatus", 400);
  }

  return c.json(
    listCatalogFiles({
      page,
      pageSize,
      ...(query ? { query } : {}),
      ...(scanStatus ? { scanStatus: scanStatus as "present" | "missing" } : {}),
      ...(reviewStatus
        ? { reviewStatus: reviewStatus as "indexed" | "inbox" | "referenced" | "ignored" }
        : {}),
    }),
  );
});

catalog.get("/inbox", (c) => {
  return c.json({ files: listCatalogInboxFiles() });
});

catalog.post("/files/:id/adopt", async (c) => {
  const id = parseId(c);
  if (id === null) return jsonError(c, "Invalid id", 400);
  const body = await parseJsonBody(c);
  if (!body) return jsonError(c, "Invalid JSON", 400);

  const productId = body["productId"];
  const productName = body["productName"];
  if (productId !== undefined && typeof productId !== "number") {
    return jsonError(c, "productId must be a number", 400);
  }
  if (productName !== undefined && typeof productName !== "string") {
    return jsonError(c, "productName must be a string", 400);
  }

  try {
    return c.json({
      adoption: adoptCatalogFile(id, {
        ...(productId === undefined ? {} : { productId }),
        ...(productName === undefined ? {} : { productName }),
      }),
    });
  } catch (error: unknown) {
    if (error instanceof CatalogValidationError) return jsonError(c, error.message, 400);
    throw error;
  }
});

catalog.post("/files/:id/ignore", (c) => {
  const id = parseId(c);
  if (id === null) return jsonError(c, "Invalid id", 400);
  try {
    return c.json({ file: ignoreCatalogFile(id) });
  } catch (error: unknown) {
    if (error instanceof CatalogConflictError) return jsonError(c, error.message, 409);
    if (error instanceof CatalogValidationError) return jsonError(c, error.message, 404);
    throw error;
  }
});

catalog.post("/files/:id/inbox", (c) => {
  const id = parseId(c);
  if (id === null) return jsonError(c, "Invalid id", 400);
  try {
    return c.json({ file: returnCatalogFileToInbox(id) });
  } catch (error: unknown) {
    if (error instanceof CatalogConflictError) return jsonError(c, error.message, 409);
    if (error instanceof CatalogValidationError) return jsonError(c, error.message, 404);
    throw error;
  }
});

catalog.get("/duplicates", (c) => {
  const page = positiveInteger(c.req.query("page"), 1);
  const pageSize = positiveInteger(c.req.query("pageSize"), 25);
  if (page === null) return jsonError(c, "page must be a positive integer", 400);
  if (pageSize === null || pageSize > 50) {
    return jsonError(c, "pageSize must be an integer between 1 and 50", 400);
  }
  return c.json(listCatalogDuplicateGroups(page, pageSize));
});

catalog.get("/previews/:file", (c) => {
  const preview = readCatalogPreview(c.req.param("file"));
  if (!preview) return jsonError(c, "Not found", 404);
  return new Response(new Uint8Array(preview.content), {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": preview.contentType,
    },
  });
});

catalog.get("/roots", (c) => {
  return c.json({ roots: listCatalogScanRoots() });
});

catalog.post("/roots", async (c) => {
  const body = await parseJsonBody(c);
  if (!body) return jsonError(c, "Invalid JSON", 400);

  const { rootPath, name } = body;
  if (typeof rootPath !== "string" || rootPath.trim() === "") {
    return jsonError(c, "rootPath is required", 400);
  }
  if (name !== undefined && typeof name !== "string") {
    return jsonError(c, "name must be a string", 400);
  }

  try {
    const root = addCatalogScanRoot(name === undefined ? { rootPath } : { rootPath, name });
    return c.json({ root });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to add scan root";
    return jsonError(c, message, 400);
  }
});

catalog.delete("/roots/:id", (c) => {
  const id = parseId(c);
  if (id === null) return jsonError(c, "Invalid id", 400);

  try {
    const root = deactivateCatalogScanRoot(id);
    return c.json({ root });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to deactivate scan root";
    return jsonError(c, message, 404);
  }
});

catalog.post("/scan", async (c) => {
  try {
    const summary = await runCatalogScan();
    return c.json({ summary });
  } catch (error: unknown) {
    if (error instanceof CatalogScanInProgressError) return jsonError(c, error.message, 409);
    throw error;
  }
});
