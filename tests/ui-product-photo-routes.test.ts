import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Hono } from "hono";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type DbModule = typeof import("../lib/db.js");
type ProductsModule = typeof import("../models/products.js");
type UiModule = typeof import("../routes/ui.js");

let tempDir = "";
let dbPath = "";
let dbModule: DbModule | null = null;
let productsModule: ProductsModule | null = null;
let uiModule: UiModule | null = null;
let productId = 0;

function cleanupSqliteFiles(basePath: string): void {
  for (const suffix of ["", "-wal", "-shm"]) {
    const target = `${basePath}${suffix}`;
    if (fs.existsSync(target)) fs.rmSync(target, { force: true });
  }
}

async function loadFreshModules(): Promise<void> {
  vi.resetModules();
  process.env.BAMBU_DB = dbPath;
  dbModule = await import("../lib/db.js");
  productsModule = await import("../models/products.js");
  uiModule = await import("../routes/ui.js");
  productId = productsModule.createProduct({ name: "Photo Route Product" }).id;
}

function insertPhoto(storedPath: string, contentType: string | null = "image/png"): number {
  return Number(
    dbModule!.db
      .prepare(
        `INSERT INTO product_photos (product_id, path, role, content_type)
         VALUES (?, ?, 'gallery', ?) RETURNING id`,
      )
      .pluck()
      .get(productId, storedPath, contentType),
  );
}

function app(): Hono {
  return new Hono().route("/ui", uiModule!.createUiApp());
}

describe.sequential("product photo UI routes", () => {
  beforeEach(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ui-product-photo-routes-"));
    dbPath = path.join(tempDir, "test.sqlite");
    await loadFreshModules();
  });

  afterEach(() => {
    dbModule?.db.close();
    cleanupSqliteFiles(dbPath);
    if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    delete process.env.BAMBU_DB;
    dbModule = null;
    productsModule = null;
    uiModule = null;
    productId = 0;
  });

  it("serves relative and absolute regular files with their recorded safe content types", async () => {
    const relativeFile = path.join(tempDir, "relative-photo.data");
    const absoluteFile = path.join(tempDir, "absolute-photo.data");
    fs.writeFileSync(relativeFile, "relative bytes");
    fs.writeFileSync(absoluteFile, "absolute bytes");
    const relativeId = insertPhoto(path.relative(process.cwd(), relativeFile), "image/jpeg");
    const absoluteId = insertPhoto(absoluteFile, "image/webp");

    const relativeRes = await app().request(`/ui/product-photos/${relativeId}`);
    expect(relativeRes.status).toBe(200);
    expect(relativeRes.headers.get("content-type")).toBe("image/jpeg");
    expect(await relativeRes.text()).toBe("relative bytes");

    const absoluteRes = await app().request(`/ui/product-photos/${absoluteId}`);
    expect(absoluteRes.status).toBe(200);
    expect(absoluteRes.headers.get("content-type")).toBe("image/webp");
    expect(await absoluteRes.text()).toBe("absolute bytes");
  });

  it("returns 404 for missing, unsupported, and non-regular local paths", async () => {
    const missingId = insertPhoto(path.relative(process.cwd(), path.join(tempDir, "missing.png")));
    const directoryPath = path.join(tempDir, "directory.png");
    const fifoPath = path.join(tempDir, "fifo.png");
    const targetPath = path.join(tempDir, "target.webp");
    const symlinkPath = path.join(tempDir, "symlink.webp");
    const unsupportedPath = path.join(tempDir, "photo.png");
    fs.mkdirSync(directoryPath);
    execFileSync("mkfifo", [fifoPath]);
    fs.writeFileSync(targetPath, "target bytes");
    fs.symlinkSync(targetPath, symlinkPath);
    fs.writeFileSync(unsupportedPath, "not an image");
    const ids = [
      missingId,
      insertPhoto(directoryPath),
      insertPhoto(fifoPath),
      insertPhoto(symlinkPath),
      insertPhoto(unsupportedPath, "text/plain"),
    ];

    for (const photoId of ids) {
      const res = await app().request(`/ui/product-photos/${photoId}`);
      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: "Not found" });
    }
  });

  it.each(["0", "-1", "not-a-number", "1.5"])(
    "returns 400 for invalid product photo id %s",
    async (photoId) => {
      const res = await app().request(`/ui/product-photos/${photoId}`);

      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: "Invalid" });
    },
  );
});
