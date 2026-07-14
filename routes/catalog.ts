import { Hono } from "hono";
import {
  CatalogValidationError,
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

catalog.get("/files", (c) => {
  return c.json({ files: listCatalogFiles() });
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
    if (error instanceof CatalogValidationError) return jsonError(c, error.message, 404);
    throw error;
  }
});

catalog.get("/duplicates", (c) => {
  return c.json({ groups: listCatalogDuplicateGroups() });
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
  const summary = await runCatalogScan();
  return c.json({ summary });
});
