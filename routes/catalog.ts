import { Hono } from "hono";
import {
  addCatalogScanRoot,
  deactivateCatalogScanRoot,
  listCatalogScanRoots,
  runCatalogScan,
} from "../models/catalog.js";
import { jsonError, parseId, parseJsonBody } from "../lib/util.js";

export const catalog = new Hono();

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
