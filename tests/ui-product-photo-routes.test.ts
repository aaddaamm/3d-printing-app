import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Hono } from "hono";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type DbModule = typeof import("../lib/db.js");
type ProductImagesModule = typeof import("../models/product-images.js");
type ProductsModule = typeof import("../models/products.js");
type UiModule = typeof import("../routes/ui.js");

let tempDir = "";
let dbPath = "";
let imagesDir = "";
let dbModule: DbModule | null = null;
let productImagesModule: ProductImagesModule | null = null;
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
  process.env.PRODUCT_IMAGES_DIR = imagesDir;
  dbModule = await import("../lib/db.js");
  productsModule = await import("../models/products.js");
  productImagesModule = await import("../models/product-images.js");
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
    imagesDir = path.join(tempDir, "product-images");
    await loadFreshModules();
  });

  afterEach(() => {
    dbModule?.db.close();
    cleanupSqliteFiles(dbPath);
    if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    delete process.env.BAMBU_DB;
    delete process.env.PRODUCT_IMAGES_DIR;
    dbModule = null;
    productImagesModule = null;
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

  it("keeps immutable source-hero IDs byte-stable under 24-hour caching", async () => {
    const modelUrl = "https://makerworld.com/en/models/cache-stable";
    const sourceUrl = "https://makerworld.bblmw.com/cache-stable.png";
    productsModule!.updateProduct(productId, { model_url: modelUrl });
    const oldImage = await sharp({
      create: { width: 24, height: 24, channels: 3, background: "#aa0000" },
    })
      .png()
      .toBuffer();
    const newImage = await sharp({
      create: { width: 24, height: 24, channels: 3, background: "#0000aa" },
    })
      .png()
      .toBuffer();
    const dependencies = (image: Buffer) => ({
      fetch: vi
        .fn()
        .mockResolvedValueOnce(
          new Response(`<meta property="og:image" content="${sourceUrl}">`, {
            headers: { "Content-Type": "text/html" },
          }),
        )
        .mockResolvedValueOnce(
          new Response(new Uint8Array(image), { headers: { "Content-Type": "image/png" } }),
        ),
      lookup: vi.fn(async () => [{ address: "93.184.216.34", family: 4 }]) as never,
    });

    const first = await productImagesModule!.refreshProductIdentificationImages(
      productId,
      dependencies(oldImage),
    );
    const oldId = first.product.main_photo_id!;
    const oldPath = String(
      dbModule!.db.prepare("SELECT path FROM product_photos WHERE id = ?").pluck().get(oldId),
    );
    const oldCandidate = productImagesModule!
      .listProductImageCandidates(productId)
      .find(({ photo_id }) => photo_id === oldId)!;
    productImagesModule!.selectProductImage(productId, oldCandidate.candidate_key);
    const second = await productImagesModule!.refreshProductIdentificationImages(
      productId,
      dependencies(newImage),
    );
    const newCandidate = productImagesModule!
      .listProductImageCandidates(productId)
      .find(({ source_type, photo_id }) => source_type === "source_hero" && photo_id !== oldId)!;
    const newId = newCandidate.photo_id!;
    const unchanged = await productImagesModule!.refreshProductIdentificationImages(
      productId,
      dependencies(newImage),
    );

    expect(second.product).toMatchObject({
      image_selection_mode: "manual",
      main_photo_id: oldId,
      main_photo_path: `/ui/product-photos/${oldId}`,
    });
    expect(unchanged.product).toMatchObject({
      image_selection_mode: "manual",
      main_photo_id: oldId,
    });
    expect(newId).not.toBe(oldId);
    expect(
      dbModule!.db
        .prepare("SELECT COUNT(*) FROM product_photos WHERE product_id = ?")
        .pluck()
        .get(productId),
    ).toBe(2);
    expect(
      dbModule!.db.prepare("SELECT path FROM product_photos WHERE id = ?").pluck().get(oldId),
    ).toBe(oldPath);
    expect(
      dbModule!.db.prepare("SELECT path FROM product_photos WHERE id = ?").pluck().get(newId),
    ).not.toBe(oldPath);
    expect(productImagesModule!.returnProductImageToAuto(productId)).toMatchObject({
      image_selection_mode: "auto",
      main_photo_id: newId,
      main_photo_path: `/ui/product-photos/${newId}`,
    });

    const oldResponse = await app().request(`/ui/product-photos/${oldId}`);
    const newResponse = await app().request(`/ui/product-photos/${newId}`);
    const oldBytes = Buffer.from(await oldResponse.arrayBuffer());
    const newBytes = Buffer.from(await newResponse.arrayBuffer());
    expect(oldResponse.headers.get("cache-control")).toBe("public, max-age=86400");
    expect(newResponse.headers.get("cache-control")).toBe("public, max-age=86400");
    expect(oldBytes.equals(newBytes)).toBe(false);
    expect((await sharp(oldBytes).stats()).channels[0]!.mean).toBeGreaterThan(
      (await sharp(newBytes).stats()).channels[0]!.mean,
    );
  });

  it("returns 404 when a validated photo is replaced by a symlink before open", async () => {
    const photoPath = path.join(tempDir, "replace-me.webp");
    const targetPath = path.join(tempDir, "secret.webp");
    fs.writeFileSync(photoPath, "original bytes");
    fs.writeFileSync(targetPath, "secret bytes");
    const photoId = insertPhoto(photoPath, "image/webp");
    const originalLstat = fs.lstatSync.bind(fs);
    const lstat = vi.spyOn(fs, "lstatSync").mockImplementationOnce((filePath) => {
      const stat = originalLstat(filePath);
      fs.rmSync(photoPath);
      fs.symlinkSync(targetPath, photoPath);
      return stat;
    });

    const res = await app().request(`/ui/product-photos/${photoId}`);

    lstat.mockRestore();
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Not found" });
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
