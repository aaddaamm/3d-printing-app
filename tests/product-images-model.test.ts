import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type DbModule = typeof import("../lib/db.js");
type ProductImageFilesModule = typeof import("../lib/product-image-files.js");
type ProductImagesModule = typeof import("../models/product-images.js");
type ProductImageUpdateModule = typeof import("../models/product-image-update.js");
type ProductsModule = typeof import("../models/products.js");

let tempDir = "";
let dbPath = "";
let coversDir = "";
let previewsDir = "";
let imagesDir = "";
let dbModule: DbModule | null = null;
let productImageFilesModule: ProductImageFilesModule | null = null;
let productImagesModule: ProductImagesModule | null = null;
let productImageUpdateModule: ProductImageUpdateModule | null = null;
let productsModule: ProductsModule | null = null;

function cleanupSqliteFiles(basePath: string): void {
  for (const suffix of ["", "-wal", "-shm"]) {
    const target = `${basePath}${suffix}`;
    if (fs.existsSync(target)) fs.rmSync(target, { force: true });
  }
}

async function loadFreshModules(): Promise<void> {
  vi.resetModules();
  process.env.BAMBU_DB = dbPath;
  process.env.BAMBU_COVERS_DIR = coversDir;
  process.env.CATALOG_PREVIEWS_DIR = previewsDir;
  process.env.PRODUCT_IMAGES_DIR = imagesDir;
  dbModule = await import("../lib/db.js");
  productsModule = await import("../models/products.js");
  productImageFilesModule = await import("../lib/product-image-files.js");
  productImagesModule = await import("../models/product-images.js");
  productImageUpdateModule = await import("../models/product-image-update.js");
}

function seedCatalogPreview(productId: number, hash: string): number {
  const previewPath = path.join(previewsDir, `${hash}.png`);
  fs.mkdirSync(previewsDir, { recursive: true });
  fs.writeFileSync(previewPath, "preview");
  const fileId = Number(
    dbModule!.db
      .prepare(
        `INSERT INTO catalog_files (
           path, normalized_path, filename, extension, content_hash, hash_algorithm, metadata_json
         ) VALUES (?, ?, 'dragon.3mf', '3mf', ?, 'sha256', ?)
         RETURNING id`,
      )
      .pluck()
      .get(
        path.join(tempDir, "dragon.3mf"),
        path.join(tempDir, "dragon.3mf"),
        hash,
        JSON.stringify({ preview: { contentType: "image/png", hash } }),
      ),
  );
  dbModule!.db
    .prepare("INSERT INTO product_files (product_id, file_id, role) VALUES (?, ?, 'source')")
    .run(productId, fileId);
  return fileId;
}

function seedSavedBatchCovers(productId: number, taskIds: string[]): number {
  const insertJob = dbModule!.db.prepare(
    `INSERT INTO jobs (provider, session_id, status, designTitle)
     VALUES ('bambu', ?, 'finish', ?)
     RETURNING id`,
  );
  const insertTask = dbModule!.db.prepare(
    `INSERT INTO print_tasks (id, provider, session_id, title, status, raw_json)
     VALUES (?, 'bambu', ?, ?, 'finish', '{}')`,
  );
  const jobIds = taskIds.map((taskId, index) => {
    const sessionId = `image-session-${taskId}`;
    const jobId = Number(insertJob.pluck().get(sessionId, `Plate ${index + 1}`));
    insertTask.run(taskId, sessionId, `Plate ${index + 1}`);
    fs.mkdirSync(coversDir, { recursive: true });
    fs.writeFileSync(path.join(coversDir, `${taskId}.png`), `cover-${taskId}`);
    return jobId;
  });
  const batchId = Number(
    dbModule!.db
      .prepare(
        `INSERT INTO product_batches (
           product_id, pricing_profile_id, planned_quantity, completed_quantity, source_type
         ) VALUES (?, 'booth', 2, 2, 'price_quote')
         RETURNING id`,
      )
      .pluck()
      .get(productId),
  );
  const link = dbModule!.db.prepare(
    "INSERT INTO product_batch_jobs (batch_id, job_id) VALUES (?, ?)",
  );
  for (const jobId of jobIds) link.run(batchId, jobId);
  return batchId;
}

function addPersistedPhotoAtPath(
  productId: number,
  sourceType: string,
  candidateKey: string,
  imagePath: string,
  sourceRef = path.basename(imagePath),
): number {
  return Number(
    dbModule!.db
      .prepare(
        `INSERT INTO product_photos (
           product_id, path, role, source_type, source_ref, candidate_key
         ) VALUES (?, ?, 'gallery', ?, ?, ?)
         RETURNING id`,
      )
      .pluck()
      .get(productId, imagePath, sourceType, sourceRef, candidateKey),
  );
}

function addPersistedPhoto(
  productId: number,
  sourceType: string,
  candidateKey: string,
  filename: string,
): number {
  const imagePath = path.join(tempDir, filename);
  fs.writeFileSync(imagePath, sourceType);
  return addPersistedPhotoAtPath(productId, sourceType, candidateKey, imagePath, filename);
}

function sourceHeroKey(sourceUrl: string, contentHash: string): string {
  const url = new URL(sourceUrl);
  url.hash = "";
  return `source_hero:${createHash("sha256").update(url.href).digest("hex")}:${contentHash}`;
}

function addSourceHero(
  productId: number,
  _filename: string,
  modelUrl: string,
  sourceUrl: string,
  options: { candidateKey?: string; isAppOwned?: number; sourceRef?: string | null } = {},
): number {
  void _filename;
  const content = Buffer.from("source hero");
  const contentHash = createHash("sha256").update(content).digest("hex");
  const imagePath = path.join(imagesDir, String(productId), "remote", `${contentHash}.webp`);
  fs.mkdirSync(path.dirname(imagePath), { recursive: true });
  fs.writeFileSync(imagePath, content);
  const sourceRef =
    options.sourceRef === undefined
      ? JSON.stringify({ modelUrl, sourceUrl, contentHash })
      : options.sourceRef;
  return Number(
    dbModule!.db
      .prepare(
        `INSERT INTO product_photos (
           product_id, path, role, source_type, source_ref, candidate_key, is_app_owned
         ) VALUES (?, ?, 'gallery', 'source_hero', ?, ?, ?)
         RETURNING id`,
      )
      .pluck()
      .get(
        productId,
        imagePath,
        sourceRef,
        options.candidateKey ?? sourceHeroKey(sourceUrl, contentHash),
        options.isAppOwned ?? 1,
      ),
  );
}

async function writeValidCover(taskId: string, color: string): Promise<void> {
  await sharp({
    create: { width: 80, height: 60, channels: 3, background: color },
  })
    .png()
    .toFile(path.join(coversDir, `${taskId}.png`));
}

describe.sequential("product image model", () => {
  beforeEach(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "product-images-model-"));
    dbPath = path.join(tempDir, "test.sqlite");
    coversDir = path.join(tempDir, "covers");
    previewsDir = path.join(tempDir, "previews");
    imagesDir = path.join(tempDir, "product-images");
    await loadFreshModules();
  });

  afterEach(() => {
    dbModule?.db.close();
    cleanupSqliteFiles(dbPath);
    if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    delete process.env.BAMBU_DB;
    delete process.env.BAMBU_COVERS_DIR;
    delete process.env.CATALOG_PREVIEWS_DIR;
    delete process.env.PRODUCT_IMAGES_DIR;
    dbModule = null;
    productImageFilesModule = null;
    productImagesModule = null;
    productImageUpdateModule = null;
    productsModule = null;
  });

  it("ranks local candidates deterministically and deduplicates stable candidate keys", () => {
    const modelUrl = "https://makerworld.com/en/models/image-dragon";
    const product = productsModule!.createProduct({ name: "Image Dragon", model_url: modelUrl });
    seedCatalogPreview(product.id, "a".repeat(64));
    seedSavedBatchCovers(product.id, ["701", "702"]);

    expect(
      productImagesModule!
        .listProductImageCandidates(product.id)
        .map((candidate) => candidate.source_type),
    ).toEqual(["catalog_preview", "print_cover", "print_cover", "placeholder"]);

    addSourceHero(
      product.id,
      "hero.jpg",
      modelUrl,
      "https://makerworld.bblmw.com/image-dragon.webp",
    );
    addPersistedPhoto(product.id, "manual_upload", "manual_upload:one", "manual.jpg");
    addPersistedPhoto(product.id, "contact_sheet", "contact_sheet:batch:1", "contact.webp");

    const candidates = productImagesModule!.listProductImageCandidates(product.id);
    expect(candidates.map((candidate) => candidate.source_type)).toEqual([
      "manual_upload",
      "source_hero",
      "catalog_preview",
      "contact_sheet",
      "print_cover",
      "print_cover",
      "placeholder",
    ]);
    expect(candidates.map((candidate) => candidate.priority)).toEqual([10, 20, 30, 40, 50, 50, 60]);
    expect(new Set(candidates.map((candidate) => candidate.candidate_key)).size).toBe(
      candidates.length,
    );
    expect(candidates.filter((candidate) => candidate.available)).toHaveLength(
      candidates.length - 1,
    );
    expect(candidates.find(({ source_type }) => source_type === "contact_sheet")).toMatchObject({
      available: false,
      warning: expect.any(String),
    });
  });

  it("enriches a MakerWorld Product into app-owned WebP provenance and selects it in Auto mode", async () => {
    const modelUrl = "https://makerworld.com/en/models/123#files";
    const canonicalModelUrl = "https://makerworld.com/en/models/123";
    const sourceUrl = "https://makerworld.bblmw.com/hero.png#preview";
    const canonicalSourceUrl = "https://makerworld.bblmw.com/hero.png";
    const product = productsModule!.createProduct({ name: "Remote Dragon", model_url: modelUrl });
    const image = new Uint8Array(
      await sharp({
        create: { width: 40, height: 20, channels: 3, background: "#123456" },
      })
        .png()
        .toBuffer(),
    );
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(`<meta property="og:image" content="${sourceUrl}">`, {
          headers: { "Content-Type": "text/html" },
        }),
      )
      .mockResolvedValueOnce(new Response(image, { headers: { "Content-Type": "image/png" } }));
    const lookup = vi.fn(async () => [{ address: "93.184.216.34", family: 4 }]);

    const result = await productImagesModule!.refreshProductIdentificationImages(product.id, {
      fetch,
      lookup: lookup as never,
    });

    expect(result.warnings).toEqual([]);
    expect(result.product).toMatchObject({
      image_selection_mode: "auto",
      main_photo_source_type: "source_hero",
      main_photo_id: expect.any(Number),
    });
    const row = dbModule!.db
      .prepare(
        `SELECT path, source_ref, is_app_owned, content_type, width, height
         FROM product_photos WHERE id = ?`,
      )
      .get(result.product.main_photo_id) as Record<string, unknown>;
    const contentHash = path.basename(String(row["path"]), ".webp");
    const expectedKey = sourceHeroKey(canonicalSourceUrl, contentHash);
    const candidate = productImagesModule!
      .listProductImageCandidates(product.id)
      .find(({ candidate_key }) => candidate_key === expectedKey);
    expect(candidate).toMatchObject({
      source_type: "source_hero",
      available: true,
      warning: null,
      photo_id: result.product.main_photo_id,
    });
    expect(row).toMatchObject({
      path: expect.stringContaining(path.join(String(product.id), "remote")),
      is_app_owned: 1,
      content_type: "image/webp",
      width: 40,
      height: 20,
    });
    expect(JSON.parse(String(row["source_ref"]))).toEqual({
      modelUrl: canonicalModelUrl,
      sourceUrl: canonicalSourceUrl,
      contentHash,
    });
    expect(await sharp(String(row["path"])).metadata()).toMatchObject({ format: "webp" });
  });

  it("reuses the older immutable source row after model URL A to B to A", async () => {
    const modelA = "https://makerworld.com/en/models/model-a";
    const modelB = "https://makerworld.com/en/models/model-b";
    const sourceA = "https://makerworld.bblmw.com/model-a.png";
    const sourceB = "https://makerworld.bblmw.com/model-b.png";
    const product = productsModule!.createProduct({ name: "Returning Source", model_url: modelA });
    const makeImage = async (color: string): Promise<Uint8Array<ArrayBuffer>> =>
      Uint8Array.from(
        await sharp({ create: { width: 20, height: 20, channels: 3, background: color } })
          .png()
          .toBuffer(),
      );
    const dependencies = (sourceUrl: string, bytes: Uint8Array<ArrayBuffer>) => ({
      fetch: vi
        .fn()
        .mockResolvedValueOnce(
          new Response(`<meta property="og:image" content="${sourceUrl}">`, {
            headers: { "Content-Type": "text/html" },
          }),
        )
        .mockResolvedValueOnce(new Response(bytes, { headers: { "Content-Type": "image/png" } })),
      lookup: vi.fn(async () => [{ address: "93.184.216.34", family: 4 }]) as never,
    });
    const bytesA = await makeImage("#aa0000");
    const bytesB = await makeImage("#0000aa");

    const first = await productImagesModule!.refreshProductIdentificationImages(
      product.id,
      dependencies(sourceA, bytesA),
    );
    const photoA = first.product.main_photo_id;
    expect(
      productImageUpdateModule!.updateProductWithAutoImage(product.id, { model_url: modelB }),
    ).toMatchObject({ model_url: modelB, main_photo_id: null, image_selection_mode: "auto" });
    expect(
      dbModule!.db
        .prepare("SELECT auto_source_photo_id FROM products WHERE id = ?")
        .get(product.id),
    ).toEqual({ auto_source_photo_id: null });

    const second = await productImagesModule!.refreshProductIdentificationImages(
      product.id,
      dependencies(sourceB, bytesB),
    );
    expect(second.product.main_photo_id).not.toBe(photoA);
    expect(
      productImageUpdateModule!.updateProductWithAutoImage(product.id, { model_url: modelA }),
    ).toMatchObject({ model_url: modelA, main_photo_id: null, image_selection_mode: "auto" });
    const returned = await productImagesModule!.refreshProductIdentificationImages(
      product.id,
      dependencies(sourceA, bytesA),
    );

    expect(returned.product).toMatchObject({
      model_url: modelA,
      main_photo_id: photoA,
      main_photo_source_type: "source_hero",
      image_selection_mode: "auto",
    });
    expect(
      dbModule!.db
        .prepare("SELECT COUNT(*) FROM product_photos WHERE product_id = ?")
        .pluck()
        .get(product.id),
    ).toBe(2);
  });

  it("does not disturb Manual mode during source enrichment", async () => {
    const modelUrl = "https://makerworld.com/en/models/234";
    const sourceUrl = "https://makerworld.bblmw.com/manual-hero.png";
    const product = productsModule!.createProduct({ name: "Manual Dragon", model_url: modelUrl });
    const manualId = addPersistedPhoto(
      product.id,
      "manual_upload",
      "manual_upload:locked",
      "locked.webp",
    );
    productImagesModule!.selectProductImage(product.id, "manual_upload:locked");
    const image = new Uint8Array(
      await sharp({
        create: { width: 20, height: 20, channels: 3, background: "#654321" },
      })
        .png()
        .toBuffer(),
    );
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(`<meta property="og:image" content="${sourceUrl}">`, {
          headers: { "Content-Type": "text/html" },
        }),
      )
      .mockResolvedValueOnce(new Response(image, { headers: { "Content-Type": "image/png" } }));

    const refreshed = await productImagesModule!.refreshProductIdentificationImages(product.id, {
      fetch,
      lookup: vi.fn(async () => [{ address: "93.184.216.34", family: 4 }]) as never,
    });

    expect(refreshed.product).toMatchObject({
      image_selection_mode: "manual",
      main_photo_id: manualId,
      main_photo_source_type: "manual_upload",
    });
    expect(
      productImagesModule!
        .listProductImageCandidates(product.id)
        .find(({ source_type }) => source_type === "source_hero"),
    ).toMatchObject({ available: true });
  });

  it("marks a previous source hero stale after the model URL changes and uses fallback", async () => {
    const firstModelUrl = "https://makerworld.com/en/models/345";
    const sourceUrl = "https://makerworld.bblmw.com/old-hero.png";
    const product = productsModule!.createProduct({
      name: "Changed Source Dragon",
      model_url: firstModelUrl,
    });
    seedCatalogPreview(product.id, "9".repeat(64));
    const image = new Uint8Array(
      await sharp({
        create: { width: 20, height: 20, channels: 3, background: "#abcdef" },
      })
        .png()
        .toBuffer(),
    );
    await productImagesModule!.refreshProductIdentificationImages(product.id, {
      fetch: vi
        .fn()
        .mockResolvedValueOnce(
          new Response(`<meta property="og:image" content="${sourceUrl}">`, {
            headers: { "Content-Type": "text/html" },
          }),
        )
        .mockResolvedValueOnce(new Response(image, { headers: { "Content-Type": "image/png" } })),
      lookup: vi.fn(async () => [{ address: "93.184.216.34", family: 4 }]) as never,
    });

    productsModule!.updateProduct(product.id, {
      model_url: "https://makerworld.com/en/models/999",
    });
    const failedRefresh = await productImagesModule!.refreshProductIdentificationImages(
      product.id,
      {
        fetch: vi.fn(async () => {
          throw new Error("offline");
        }),
        lookup: vi.fn(async () => [{ address: "93.184.216.34", family: 4 }]) as never,
      },
    );

    expect(failedRefresh.warnings).toEqual([expect.stringMatching(/MakerWorld|source image/i)]);
    expect(failedRefresh.product).toMatchObject({
      image_selection_mode: "auto",
      main_photo_source_type: "catalog_preview",
    });
    expect(
      productImagesModule!
        .listProductImageCandidates(product.id)
        .find(({ source_type }) => source_type === "source_hero"),
    ).toMatchObject({ available: false, warning: expect.stringMatching(/current source/i) });
  });

  it("keeps invalid source provenance warning-visible but unavailable to Auto mode", () => {
    const modelUrl = "https://makerworld.com/en/models/provenance";
    const otherModelUrl = "https://makerworld.com/en/models/other";
    const product = productsModule!.createProduct({
      name: "Provenance Dragon",
      model_url: modelUrl,
    });
    const source = (name: string) => `https://makerworld.bblmw.com/${name}.webp`;

    const badPathId = addSourceHero(product.id, "bad-path.webp", modelUrl, source("bad-path"));
    const badPath = path.join(tempDir, "not-content-addressed.webp");
    fs.writeFileSync(badPath, "source hero");
    dbModule!.db.prepare("UPDATE product_photos SET path = ? WHERE id = ?").run(badPath, badPathId);
    const invalidIds = [
      badPathId,
      addSourceHero(product.id, "missing.webp", modelUrl, source("missing"), { sourceRef: null }),
      addSourceHero(product.id, "malformed.webp", modelUrl, source("malformed"), {
        sourceRef: "{bad json",
      }),
      addSourceHero(product.id, "legacy.webp", modelUrl, source("legacy"), {
        sourceRef: source("legacy"),
      }),
      addSourceHero(product.id, "non-owned.webp", modelUrl, source("non-owned"), {
        isAppOwned: 0,
      }),
      addSourceHero(product.id, "mismatch.webp", otherModelUrl, source("mismatch")),
      addSourceHero(product.id, "unsupported.webp", modelUrl, "https://images.example/hero.webp"),
      addSourceHero(product.id, "bad-key.webp", modelUrl, source("bad-key"), {
        candidateKey: "source_hero:not-the-source-hash",
      }),
    ];
    const validId = addSourceHero(product.id, "valid.webp", modelUrl, source("valid"));

    const candidates = productImagesModule!
      .listProductImageCandidates(product.id)
      .filter(({ source_type }) => source_type === "source_hero");
    expect(candidates).toHaveLength(9);
    expect(candidates.find(({ photo_id }) => photo_id === validId)).toMatchObject({
      available: true,
      warning: null,
    });
    for (const photoId of invalidIds) {
      expect(candidates.find((candidate) => candidate.photo_id === photoId)).toMatchObject({
        available: false,
        warning: expect.any(String),
      });
    }

    dbModule!.db
      .prepare(
        `UPDATE products
         SET main_photo_id = ?, auto_source_photo_id = ?, image_selection_mode = 'manual'
         WHERE id = ?`,
      )
      .run(invalidIds[0], validId, product.id);
    expect(productImagesModule!.refreshAutoProductImage(product.id)).toMatchObject({
      main_photo_id: invalidIds[0],
      image_selection_mode: "manual",
    });
    expect(productImagesModule!.returnProductImageToAuto(product.id)).toMatchObject({
      main_photo_id: validId,
      main_photo_source_type: "source_hero",
      image_selection_mode: "auto",
    });
  });

  it("validates the current source pointer belongs to the Product and current model URL", () => {
    const modelUrl = "https://makerworld.com/en/models/pointer-owner";
    const product = productsModule!.createProduct({ name: "Pointer Owner", model_url: modelUrl });
    seedCatalogPreview(product.id, "7".repeat(64));
    const validSourceId = addSourceHero(
      product.id,
      "owner.webp",
      modelUrl,
      "https://makerworld.bblmw.com/owner.webp",
    );
    const otherProduct = productsModule!.createProduct({
      name: "Pointer Other",
      model_url: "https://makerworld.com/en/models/pointer-other",
    });
    const otherSourceId = addSourceHero(
      otherProduct.id,
      "other.webp",
      otherProduct.model_url!,
      "https://makerworld.bblmw.com/other.webp",
    );

    dbModule!.db
      .prepare("UPDATE products SET auto_source_photo_id = ? WHERE id = ?")
      .run(otherSourceId, product.id);
    expect(productImagesModule!.refreshAutoProductImage(product.id)).toMatchObject({
      main_photo_source_type: "catalog_preview",
      image_selection_mode: "auto",
    });

    dbModule!.db
      .prepare("UPDATE products SET auto_source_photo_id = ? WHERE id = ?")
      .run(validSourceId, product.id);
    expect(productImagesModule!.refreshAutoProductImage(product.id)).toMatchObject({
      main_photo_id: validSourceId,
      main_photo_source_type: "source_hero",
      image_selection_mode: "auto",
    });
  });

  it("returns warnings and fallback candidates for missing and unsupported source URLs", async () => {
    const missing = productsModule!.createProduct({ name: "No Source Dragon" });
    await expect(
      productImagesModule!.refreshProductIdentificationImages(missing.id),
    ).resolves.toMatchObject({
      product: { id: missing.id },
      warnings: [expect.stringMatching(/source URL/i)],
    });

    const unsupported = productsModule!.createProduct({
      name: "Cubee Dragon",
      model_url: "https://cubee.com/model/1",
    });
    const result = await productImagesModule!.refreshProductIdentificationImages(unsupported.id, {
      fetch: vi.fn(),
      lookup: vi.fn() as never,
    });
    expect(result.warnings).toEqual([expect.stringMatching(/MakerWorld|supported/i)]);
    expect(result.product.main_photo_id).toBeNull();
  });

  it("lazily generates and upserts a contact sheet for the latest multi-cover Batch", async () => {
    const product = productsModule!.createProduct({ name: "Contact Sheet Dragon" });
    const batchId = seedSavedBatchCovers(product.id, ["711", "712"]);
    await writeValidCover("711", "#aa0000");
    await writeValidCover("712", "#0000aa");

    const first = await productImagesModule!.ensureGeneratedProductImageCandidates(product.id);
    const second = await productImagesModule!.ensureGeneratedProductImageCandidates(product.id);

    expect(first.warnings).toEqual([]);
    expect(first.candidates.map(({ source_type }) => source_type)).toEqual([
      "contact_sheet",
      "print_cover",
      "print_cover",
      "placeholder",
    ]);
    expect(second.candidates).toEqual(first.candidates);
    const contact = first.candidates[0]!;
    expect(contact).toMatchObject({
      photo_id: expect.any(Number),
      available: true,
      warning: null,
    });
    expect(contact.candidate_key.startsWith(`contact_sheet:${batchId}:`)).toBe(true);
    expect(contact.candidate_key.split(":").at(-1)).toMatch(/^[a-f0-9]{64}$/);
    const row = dbModule!.db
      .prepare(
        `SELECT source_type, source_ref, candidate_key, is_app_owned, content_type, width, height, path
         FROM product_photos WHERE id = ?`,
      )
      .get(contact.photo_id) as Record<string, unknown>;
    expect(row).toMatchObject({
      source_type: "contact_sheet",
      source_ref: expect.any(String),
      candidate_key: contact.candidate_key,
      is_app_owned: 1,
      content_type: "image/webp",
      width: expect.any(Number),
      height: expect.any(Number),
      path: expect.stringContaining(imagesDir),
    });
    expect(String(row["source_ref"]).startsWith(`contact_sheet:${batchId}:`)).toBe(true);
    expect(String(row["source_ref"]).split(":").at(-1)).toMatch(/^[a-f0-9]{64}$/);
    expect(
      dbModule!.db
        .prepare("SELECT COUNT(*) FROM product_photos WHERE product_id = ?")
        .pluck()
        .get(product.id),
    ).toBe(1);
  });

  it("orders contact covers by numeric plate, start time, and task ID before content dedupe", async () => {
    const product = productsModule!.createProduct({ name: "Ordered Contact Dragon" });
    const batchId = seedSavedBatchCovers(product.id, ["10", "tie-b", "rerun-2", "tie-a", "2"]);
    await writeValidCover("10", "#0000aa");
    await writeValidCover("2", "#aa0000");
    await writeValidCover("tie-a", "#00aa00");
    await writeValidCover("tie-b", "#aaaa00");
    fs.copyFileSync(path.join(coversDir, "2.png"), path.join(coversDir, "rerun-2.png"));
    const updateTask = dbModule!.db.prepare(
      "UPDATE print_tasks SET plateIndex = ?, startTime = ? WHERE id = ?",
    );
    updateTask.run(10, "2026-07-25 10:00:00", "10");
    updateTask.run(2, "2026-07-25 09:00:00", "rerun-2");
    updateTask.run(2, "2026-07-25 08:00:00", "2");
    updateTask.run(3, "2026-07-25 09:30:00", "tie-b");
    updateTask.run(3, "2026-07-25 09:30:00", "tie-a");

    const expectedSnapshot = productImageFilesModule!.createProductContactSheetSnapshot([
      { key: "print_cover:2", label: "Plate 5", path: path.join(coversDir, "2.png") },
      { key: "print_cover:tie-a", label: "Plate 4", path: path.join(coversDir, "tie-a.png") },
      { key: "print_cover:tie-b", label: "Plate 2", path: path.join(coversDir, "tie-b.png") },
      { key: "print_cover:10", label: "Plate 1", path: path.join(coversDir, "10.png") },
    ]);
    const result = await productImagesModule!.ensureGeneratedProductImageCandidates(product.id);
    const contact = result.candidates.find(({ source_type }) => source_type === "contact_sheet");
    const sourceRef = dbModule!.db
      .prepare("SELECT source_ref FROM product_photos WHERE id = ?")
      .pluck()
      .get(contact!.photo_id);

    expect(expectedSnapshot.inputCount).toBe(4);
    expect(sourceRef).toBe(`contact_sheet:${batchId}:${expectedSnapshot.fingerprint}`);
  });

  it("returns a warning candidate and cover fallback when contact-sheet decoding fails", async () => {
    const product = productsModule!.createProduct({ name: "Fallback Dragon" });
    const batchId = seedSavedBatchCovers(product.id, ["721", "722"]);
    await writeValidCover("721", "#00aa00");

    const result = await productImagesModule!.ensureGeneratedProductImageCandidates(product.id);

    expect(result.warnings).toEqual([expect.stringMatching(/contact sheet/i)]);
    expect(
      result.candidates.find(({ source_type }) => source_type === "contact_sheet"),
    ).toMatchObject({
      candidate_key: `contact_sheet:${batchId}:unavailable`,
      available: false,
      warning: expect.stringMatching(/contact sheet/i),
    });
    expect(
      result.candidates.find(({ candidate_key }) => candidate_key === "print_cover:721"),
    ).toMatchObject({ available: true });
    expect(
      dbModule!.db
        .prepare("SELECT COUNT(*) FROM product_photos WHERE product_id = ?")
        .pluck()
        .get(product.id),
    ).toBe(0);
  });

  it("skips contact-sheet generation for a single available cover", async () => {
    const product = productsModule!.createProduct({ name: "Single Cover Dragon" });
    seedSavedBatchCovers(product.id, ["731"]);
    await writeValidCover("731", "#444444");

    const result = await productImagesModule!.ensureGeneratedProductImageCandidates(product.id);

    expect(result.warnings).toEqual([]);
    expect(result.candidates.some(({ source_type }) => source_type === "contact_sheet")).toBe(
      false,
    );
  });

  it("marks an older Batch contact sheet stale without unlocking Manual selection", async () => {
    const product = productsModule!.createProduct({ name: "Batch Change Dragon" });
    seedSavedBatchCovers(product.id, ["741", "742"]);
    await writeValidCover("741", "#110000");
    await writeValidCover("742", "#220000");
    const generated = await productImagesModule!.ensureGeneratedProductImageCandidates(product.id);
    const oldContact = generated.candidates.find(
      ({ source_type }) => source_type === "contact_sheet",
    )!;
    const manual = productImagesModule!.selectProductImage(product.id, oldContact.candidate_key);

    const newBatchId = seedSavedBatchCovers(product.id, ["743", "744"]);
    await writeValidCover("743", "#001100");
    await writeValidCover("744", "#002200");
    const stale = productImagesModule!
      .listProductImageCandidates(product.id)
      .find(({ candidate_key }) => candidate_key === oldContact.candidate_key);
    expect(stale).toMatchObject({ available: false, warning: expect.any(String) });
    expect(productImagesModule!.refreshAutoProductImage(product.id)).toMatchObject({
      main_photo_id: manual.main_photo_id,
      image_selection_mode: "manual",
    });

    const refreshed = await productImagesModule!.ensureGeneratedProductImageCandidates(product.id);
    expect(
      refreshed.candidates.find(
        ({ candidate_key, available }) =>
          available && candidate_key.startsWith(`contact_sheet:${newBatchId}:`),
      ),
    ).toBeDefined();
  });

  it("invalidates contact sheets when cover bytes or the stored output hash changes", async () => {
    const product = productsModule!.createProduct({ name: "Changed Cover Dragon" });
    seedSavedBatchCovers(product.id, ["751", "752"]);
    await writeValidCover("751", "#111111");
    await writeValidCover("752", "#222222");
    const first = await productImagesModule!.ensureGeneratedProductImageCandidates(product.id);
    const oldContact = first.candidates.find(({ source_type }) => source_type === "contact_sheet")!;

    await writeValidCover("751", "#333333");
    expect(
      productImagesModule!
        .listProductImageCandidates(product.id)
        .find(({ candidate_key }) => candidate_key === oldContact.candidate_key),
    ).toMatchObject({ available: false, warning: expect.any(String) });

    const regenerated = await productImagesModule!.ensureGeneratedProductImageCandidates(
      product.id,
    );
    const current = regenerated.candidates.find(
      ({ source_type, available }) => source_type === "contact_sheet" && available,
    )!;
    const currentPath = dbModule!.db
      .prepare("SELECT path FROM product_photos WHERE id = ?")
      .pluck()
      .get(current.photo_id) as string;
    fs.writeFileSync(currentPath, "wrong hash");
    expect(
      productImagesModule!
        .listProductImageCandidates(product.id)
        .find(({ candidate_key }) => candidate_key === current.candidate_key),
    ).toMatchObject({ available: false, warning: expect.any(String) });
  });

  it("invalidates an old contact sheet when the latest Batch has only one cover", async () => {
    const product = productsModule!.createProduct({ name: "Reduced Cover Dragon" });
    seedSavedBatchCovers(product.id, ["761", "762"]);
    await writeValidCover("761", "#111111");
    await writeValidCover("762", "#222222");
    const generated = await productImagesModule!.ensureGeneratedProductImageCandidates(product.id);
    const oldContact = generated.candidates.find(
      ({ source_type }) => source_type === "contact_sheet",
    )!;

    seedSavedBatchCovers(product.id, ["763"]);
    await writeValidCover("763", "#333333");

    expect(
      productImagesModule!
        .listProductImageCandidates(product.id)
        .find(({ candidate_key }) => candidate_key === oldContact.candidate_key),
    ).toMatchObject({ available: false, warning: expect.any(String) });
  });

  it("keeps old contact sheets unavailable when regeneration fails", async () => {
    const product = productsModule!.createProduct({ name: "Broken Regeneration Dragon" });
    seedSavedBatchCovers(product.id, ["771", "772"]);
    await writeValidCover("771", "#111111");
    await writeValidCover("772", "#222222");
    await productImagesModule!.ensureGeneratedProductImageCandidates(product.id);

    fs.writeFileSync(path.join(coversDir, "771.png"), "not an image");
    const failed = await productImagesModule!.ensureGeneratedProductImageCandidates(product.id);

    expect(failed.warnings).toEqual([expect.stringMatching(/contact sheet/i)]);
    expect(
      failed.candidates.filter(({ source_type }) => source_type === "contact_sheet"),
    ).not.toEqual([]);
    expect(
      failed.candidates
        .filter(({ source_type }) => source_type === "contact_sheet")
        .every(({ available, warning }) => !available && Boolean(warning)),
    ).toBe(true);
  });

  it("retains a contact-sheet orphan when its database upsert fails", async () => {
    const product = productsModule!.createProduct({ name: "Orphan Dragon" });
    seedSavedBatchCovers(product.id, ["781", "782"]);
    await writeValidCover("781", "#111111");
    await writeValidCover("782", "#222222");
    dbModule!.db.exec(`
      CREATE TEMP TRIGGER fail_contact_sheet_upsert
      BEFORE INSERT ON product_photos
      WHEN NEW.source_type = 'contact_sheet'
      BEGIN
        SELECT RAISE(ABORT, 'contact upsert failed');
      END;
    `);

    const failed = await productImagesModule!.ensureGeneratedProductImageCandidates(product.id);

    expect(failed.warnings).toEqual([expect.stringMatching(/contact sheet/i)]);
    expect(
      dbModule!.db
        .prepare("SELECT COUNT(*) FROM product_photos WHERE product_id = ?")
        .pluck()
        .get(product.id),
    ).toBe(0);
    const contactDirectory = path.join(imagesDir, String(product.id), "contact-sheets");
    expect(fs.readdirSync(contactDirectory)).toHaveLength(1);
  });

  it("retains pre-existing and newly written uploads after database rollback", async () => {
    const product = productsModule!.createProduct({ name: "Cleanup Dragon" });
    const bytes = await sharp({
      create: { width: 32, height: 32, channels: 3, background: "#112233" },
    })
      .png()
      .toBuffer();
    const first = await productImageFilesModule!.storeUploadedProductImage(product.id, bytes);
    const selected = productImagesModule!.createManualProductPhoto(product.id, first);
    const repeated = await productImageFilesModule!.storeUploadedProductImage(product.id, bytes);
    expect(repeated.createdOrRepaired).toBe(false);

    dbModule!.db.exec(`
      CREATE TEMP TRIGGER fail_repeated_upload_selection
      BEFORE UPDATE OF main_photo_id ON products
      BEGIN
        SELECT RAISE(ABORT, 'forced database failure');
      END;
    `);
    expect(() => productImagesModule!.createManualProductPhoto(product.id, repeated)).toThrow(
      /forced database failure/i,
    );
    expect(fs.readFileSync(first.path)).toEqual(fs.readFileSync(repeated.path));
    expect(
      dbModule!.db
        .prepare("SELECT path FROM product_photos WHERE id = ?")
        .pluck()
        .get(selected.photo.id),
    ).toBe(first.path);
    expect(fs.existsSync(first.path)).toBe(true);

    const freshBytes = await sharp({
      create: { width: 33, height: 33, channels: 3, background: "#445566" },
    })
      .png()
      .toBuffer();
    const fresh = await productImageFilesModule!.storeUploadedProductImage(product.id, freshBytes);
    expect(fresh.createdOrRepaired).toBe(true);
    expect(() => productImagesModule!.createManualProductPhoto(product.id, fresh)).toThrow(
      /forced database failure/i,
    );
    expect(fs.existsSync(fresh.path)).toBe(true);
    expect(
      dbModule!.db
        .prepare("SELECT COUNT(*) FROM product_photos WHERE path = ?")
        .pluck()
        .get(fresh.path),
    ).toBe(0);
  });

  it("transactionally inserts a Manual upload and selects it as the main photo", () => {
    const product = productsModule!.createProduct({ name: "Uploaded Dragon" });
    const storedPath = path.join(
      imagesDir,
      String(product.id),
      "uploads",
      `${"a".repeat(64)}.webp`,
    );
    fs.mkdirSync(path.dirname(storedPath), { recursive: true });
    fs.writeFileSync(storedPath, "webp");
    const stored = {
      path: storedPath,
      contentType: "image/webp" as const,
      width: 640,
      height: 480,
      contentHash: "a".repeat(64),
      createdOrRepaired: true,
    };

    const result = productImagesModule!.createManualProductPhoto(product.id, stored);

    expect(result.product).toMatchObject({
      main_photo_id: result.photo.id,
      main_photo_source_type: "manual_upload",
      image_selection_mode: "manual",
    });
    expect(result.photo).toMatchObject({
      product_id: product.id,
      path: storedPath,
      source_type: "manual_upload",
      source_ref: stored.contentHash,
      candidate_key: `manual_upload:${stored.contentHash}`,
      content_type: "image/webp",
      width: 640,
      height: 480,
      is_app_owned: 1,
    });

    dbModule!.db.exec(`
      CREATE TEMP TRIGGER fail_manual_upload_selection
      BEFORE UPDATE OF main_photo_id ON products
      BEGIN
        SELECT RAISE(ABORT, 'manual selection failure');
      END;
    `);
    const secondStored = { ...stored, contentHash: "b".repeat(64) };
    expect(() => productImagesModule!.createManualProductPhoto(product.id, secondStored)).toThrow(
      /manual selection failure/i,
    );
    expect(
      dbModule!.db
        .prepare("SELECT COUNT(*) FROM product_photos WHERE product_id = ?")
        .pluck()
        .get(product.id),
    ).toBe(1);
  });

  it("selects ephemeral candidates transactionally and preserves Manual mode until Auto return", () => {
    const modelUrl = "https://makerworld.com/en/models/locked-dragon";
    const product = productsModule!.createProduct({
      name: "Locked Dragon",
      model_url: modelUrl,
    });
    const catalogFileId = seedCatalogPreview(product.id, "b".repeat(64));
    seedSavedBatchCovers(product.id, ["801"]);
    const catalogCandidate = productImagesModule!
      .listProductImageCandidates(product.id)
      .find((candidate) => candidate.source_type === "catalog_preview")!;

    const selected = productImagesModule!.selectProductImage(
      product.id,
      catalogCandidate.candidate_key,
    );
    expect(selected).toMatchObject({
      image_selection_mode: "manual",
      main_photo_path: expect.stringMatching(/^\/ui\/product-photos\/\d+$/),
      main_photo_source_type: "catalog_preview",
    });
    expect(selected.main_photo_id).toEqual(expect.any(Number));
    expect(
      dbModule!.db
        .prepare(
          `SELECT file_id, candidate_key, source_type
           FROM product_photos WHERE id = ?`,
        )
        .get(selected.main_photo_id),
    ).toEqual({
      file_id: catalogFileId,
      candidate_key: catalogCandidate.candidate_key,
      source_type: "catalog_preview",
    });

    const heroId = addSourceHero(
      product.id,
      "hero-after-lock.jpg",
      modelUrl,
      "https://makerworld.bblmw.com/locked-dragon.webp",
    );
    dbModule!.db
      .prepare("UPDATE products SET auto_source_photo_id = ? WHERE id = ?")
      .run(heroId, product.id);
    const refreshed = productImagesModule!.refreshAutoProductImage(product.id);
    expect(refreshed).toMatchObject({
      main_photo_id: selected.main_photo_id,
      main_photo_source_type: "catalog_preview",
      image_selection_mode: "manual",
    });

    const automatic = productImagesModule!.returnProductImageToAuto(product.id);
    expect(automatic).toMatchObject({
      main_photo_id: heroId,
      main_photo_source_type: "source_hero",
      image_selection_mode: "auto",
    });

    const keys = productImagesModule!
      .listProductImageCandidates(product.id)
      .map((candidate) => candidate.candidate_key);
    expect(keys.filter((key) => key === catalogCandidate.candidate_key)).toHaveLength(1);
  });

  it("marks a materialized old cover stale when a newer saved Batch supplies a cover", () => {
    const product = productsModule!.createProduct({ name: "Changing Cover Dragon" });
    seedSavedBatchCovers(product.id, ["901"]);
    const oldCandidate = productImagesModule!
      .listProductImageCandidates(product.id)
      .find((candidate) => candidate.candidate_key === "print_cover:901")!;
    const oldSelection = productImagesModule!.selectProductImage(
      product.id,
      oldCandidate.candidate_key,
    );

    seedSavedBatchCovers(product.id, ["902"]);
    const candidates = productImagesModule!.listProductImageCandidates(product.id);
    expect(
      candidates.find(({ candidate_key }) => candidate_key === "print_cover:901"),
    ).toMatchObject({
      photo_id: oldSelection.main_photo_id,
      available: false,
      warning: expect.any(String),
    });
    expect(
      candidates.find(({ candidate_key }) => candidate_key === "print_cover:902"),
    ).toMatchObject({ photo_id: null, available: true, warning: null });

    const automatic = productImagesModule!.returnProductImageToAuto(product.id);
    expect(automatic).toMatchObject({
      image_selection_mode: "auto",
      main_photo_source_type: "print_cover",
    });
    expect(automatic.main_photo_id).not.toBe(oldSelection.main_photo_id);
    expect(
      dbModule!.db
        .prepare("SELECT source_ref FROM product_photos WHERE id = ?")
        .pluck()
        .get(automatic.main_photo_id),
    ).toBe("902");
  });

  it("keeps unlinked and metadata-stale catalog photos warning-visible but unavailable", () => {
    const product = productsModule!.createProduct({ name: "Changing Catalog Dragon" });
    const oldHash = "c".repeat(64);
    const newHash = "d".repeat(64);
    const catalogFileId = seedCatalogPreview(product.id, oldHash);
    const oldCandidate = productImagesModule!
      .listProductImageCandidates(product.id)
      .find((candidate) => candidate.source_type === "catalog_preview")!;
    const oldSelection = productImagesModule!.selectProductImage(
      product.id,
      oldCandidate.candidate_key,
    );

    dbModule!.db.prepare("DELETE FROM product_files WHERE product_id = ?").run(product.id);
    expect(
      productImagesModule!
        .listProductImageCandidates(product.id)
        .find(({ candidate_key }) => candidate_key === oldCandidate.candidate_key),
    ).toMatchObject({ available: false, warning: expect.any(String) });

    dbModule!.db
      .prepare("INSERT INTO product_files (product_id, file_id) VALUES (?, ?)")
      .run(product.id, catalogFileId);
    fs.writeFileSync(path.join(previewsDir, `${newHash}.png`), "new preview");
    dbModule!.db
      .prepare("UPDATE catalog_files SET metadata_json = ? WHERE id = ?")
      .run(JSON.stringify({ preview: { contentType: "image/png", hash: newHash } }), catalogFileId);

    const candidates = productImagesModule!.listProductImageCandidates(product.id);
    expect(
      candidates.find(({ candidate_key }) => candidate_key === oldCandidate.candidate_key),
    ).toMatchObject({
      photo_id: oldSelection.main_photo_id,
      available: false,
      warning: expect.any(String),
    });
    const fresh = candidates.find(
      ({ candidate_key }) => candidate_key === `catalog_preview:${catalogFileId}:${newHash}`,
    );
    expect(fresh).toMatchObject({ photo_id: null, available: true, warning: null });

    const automatic = productImagesModule!.returnProductImageToAuto(product.id);
    expect(automatic).toMatchObject({
      image_selection_mode: "auto",
      main_photo_source_type: "catalog_preview",
    });
    expect(automatic.main_photo_id).not.toBe(oldSelection.main_photo_id);
  });

  it("prefers available ephemeral candidates over unavailable persisted duplicate keys", () => {
    const product = productsModule!.createProduct({ name: "Duplicate Candidate Dragon" });
    const catalogFileId = seedCatalogPreview(product.id, "e".repeat(64));
    const key = `catalog_preview:${catalogFileId}:${"e".repeat(64)}`;
    const persistedPhotoId = addPersistedPhotoAtPath(
      product.id,
      "catalog_preview",
      key,
      path.join(tempDir, "missing-duplicate.png"),
      String(catalogFileId),
    );

    const matches = productImagesModule!
      .listProductImageCandidates(product.id)
      .filter(({ candidate_key }) => candidate_key === key);
    expect(matches).toEqual([
      expect.objectContaining({ photo_id: null, available: true, warning: null }),
    ]);

    const selected = productImagesModule!.selectProductImage(product.id, key);
    expect(selected.main_photo_id).toBe(persistedPhotoId);
    expect(
      dbModule!.db
        .prepare("SELECT path FROM product_photos WHERE id = ?")
        .pluck()
        .get(persistedPhotoId),
    ).toBe(path.join(previewsDir, `${"e".repeat(64)}.png`));

    seedSavedBatchCovers(product.id, ["905"]);
    const coverKey = "print_cover:905";
    const persistedCoverId = addPersistedPhotoAtPath(
      product.id,
      "print_cover",
      coverKey,
      path.join(tempDir, "missing-cover-duplicate.png"),
      "905",
    );
    expect(
      productImagesModule!
        .listProductImageCandidates(product.id)
        .filter(({ candidate_key }) => candidate_key === coverKey),
    ).toEqual([expect.objectContaining({ photo_id: null, available: true, warning: null })]);
    expect(productImagesModule!.selectProductImage(product.id, coverKey).main_photo_id).toBe(
      persistedCoverId,
    );
  });

  it("rejects non-regular files and symlinks for persisted, catalog, and cover candidates", () => {
    const product = productsModule!.createProduct({ name: "File Policy Dragon" });
    const regularPath = path.join(tempDir, "regular.png");
    const directoryPath = path.join(tempDir, "directory.png");
    const symlinkPath = path.join(tempDir, "symlink.png");
    const fifoPath = path.join(tempDir, "fifo.png");
    fs.writeFileSync(regularPath, "regular");
    fs.mkdirSync(directoryPath);
    fs.symlinkSync(regularPath, symlinkPath);
    execFileSync("mkfifo", [fifoPath]);
    addPersistedPhotoAtPath(product.id, "manual_upload", "manual:regular", regularPath);
    addPersistedPhotoAtPath(product.id, "manual_upload", "manual:directory", directoryPath);
    addPersistedPhotoAtPath(product.id, "manual_upload", "manual:symlink", symlinkPath);
    addPersistedPhotoAtPath(product.id, "manual_upload", "manual:fifo", fifoPath);

    const catalogHash = "f".repeat(64);
    const catalogFileId = seedCatalogPreview(product.id, catalogHash);
    const catalogTarget = path.join(tempDir, "catalog-target.png");
    fs.writeFileSync(catalogTarget, "catalog target");
    fs.rmSync(path.join(previewsDir, `${catalogHash}.png`));
    fs.symlinkSync(catalogTarget, path.join(previewsDir, `${catalogHash}.png`));

    seedSavedBatchCovers(product.id, ["903", "904"]);
    fs.rmSync(path.join(coversDir, "903.png"));
    fs.mkdirSync(path.join(coversDir, "903.png"));
    fs.rmSync(path.join(coversDir, "904.png"));
    fs.symlinkSync(regularPath, path.join(coversDir, "904.png"));

    const byKey = new Map(
      productImagesModule!
        .listProductImageCandidates(product.id)
        .map((candidate) => [candidate.candidate_key, candidate]),
    );
    expect(byKey.get("manual:regular")).toMatchObject({ available: true });
    for (const key of ["manual:directory", "manual:symlink", "manual:fifo"]) {
      expect(byKey.get(key)).toMatchObject({ available: false, warning: expect.any(String) });
    }
    expect(byKey.get(`catalog_preview:${catalogFileId}:${catalogHash}`)).toMatchObject({
      available: false,
    });
    expect(byKey.get("print_cover:903")).toMatchObject({ available: false });
    expect(byKey.get("print_cover:904")).toMatchObject({ available: false });
  });

  it("classifies explicit HTTP(S) URLs and filesystem paths without leaking paths", () => {
    const product = productsModule!.createProduct({ name: "Path Policy Dragon" });
    const relativeFile = path.relative(process.cwd(), path.join(tempDir, "relative.png"));
    fs.writeFileSync(path.resolve(relativeFile), "relative");
    addPersistedPhotoAtPath(product.id, "manual_upload", "manual:home", "/home/adam/photo.png");
    addPersistedPhotoAtPath(product.id, "manual_upload", "manual:opt", "/opt/printworks/photo.png");
    addPersistedPhotoAtPath(product.id, "manual_upload", "manual:relative", relativeFile);
    addPersistedPhotoAtPath(
      product.id,
      "source_hero",
      "source:https",
      "https://images.example.test/dragon.png",
    );

    const byKey = new Map(
      productImagesModule!
        .listProductImageCandidates(product.id)
        .map((candidate) => [candidate.candidate_key, candidate]),
    );
    expect(byKey.get("manual:home")).toMatchObject({ url: null, available: false });
    expect(byKey.get("manual:opt")).toMatchObject({ url: null, available: false });
    expect(byKey.get("manual:relative")).toMatchObject({
      url: expect.stringMatching(/^\/ui\/product-photos\/\d+$/),
      available: true,
    });
    expect(byKey.get("source:https")).toMatchObject({
      url: "https://images.example.test/dragon.png",
      available: false,
      warning: expect.any(String),
    });
  });

  it("rolls back an ephemeral photo upsert when Product selection fails", () => {
    const product = productsModule!.createProduct({ name: "Rollback Dragon" });
    seedCatalogPreview(product.id, "1".repeat(64));
    const candidate = productImagesModule!
      .listProductImageCandidates(product.id)
      .find(({ source_type }) => source_type === "catalog_preview")!;
    dbModule!.db.exec(`
      CREATE TEMP TRIGGER fail_product_image_selection
      BEFORE UPDATE OF main_photo_id ON products
      WHEN NEW.main_photo_id IS NOT NULL
      BEGIN
        SELECT RAISE(ABORT, 'selection failure');
      END;
    `);

    expect(() =>
      productImagesModule!.selectProductImage(product.id, candidate.candidate_key),
    ).toThrow(/selection failure/i);
    expect(
      dbModule!.db
        .prepare("SELECT COUNT(*) FROM product_photos WHERE product_id = ?")
        .pluck()
        .get(product.id),
    ).toBe(0);
    expect(
      dbModule!.db
        .prepare("SELECT main_photo_id, image_selection_mode FROM products WHERE id = ?")
        .get(product.id),
    ).toEqual({ main_photo_id: null, image_selection_mode: "auto" });
  });

  it("rejects unknown and unavailable candidate keys", () => {
    const product = productsModule!.createProduct({ name: "Unavailable Dragon" });
    addPersistedPhoto(product.id, "manual_upload", "manual_upload:missing", "missing.jpg");
    fs.rmSync(path.join(tempDir, "missing.jpg"));

    const missing = productImagesModule!
      .listProductImageCandidates(product.id)
      .find((candidate) => candidate.candidate_key === "manual_upload:missing")!;
    expect(missing).toMatchObject({ available: false, warning: expect.any(String) });
    expect(() =>
      productImagesModule!.selectProductImage(product.id, missing.candidate_key),
    ).toThrow(/unavailable/i);
    expect(() => productImagesModule!.selectProductImage(product.id, "missing:key")).toThrow(
      /unknown image candidate/i,
    );
  });
});
