import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type DbModule = typeof import("../lib/db.js");
type ProductImagesModule = typeof import("../models/product-images.js");
type ProductsModule = typeof import("../models/products.js");

let tempDir = "";
let dbPath = "";
let coversDir = "";
let previewsDir = "";
let dbModule: DbModule | null = null;
let productImagesModule: ProductImagesModule | null = null;
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
  dbModule = await import("../lib/db.js");
  productsModule = await import("../models/products.js");
  productImagesModule = await import("../models/product-images.js");
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

function addPersistedPhoto(
  productId: number,
  sourceType: string,
  candidateKey: string,
  filename: string,
): number {
  const imagePath = path.join(tempDir, filename);
  fs.writeFileSync(imagePath, sourceType);
  return Number(
    dbModule!.db
      .prepare(
        `INSERT INTO product_photos (
           product_id, path, role, source_type, source_ref, candidate_key
         ) VALUES (?, ?, 'gallery', ?, ?, ?)
         RETURNING id`,
      )
      .pluck()
      .get(productId, imagePath, sourceType, filename, candidateKey),
  );
}

describe.sequential("product image model", () => {
  beforeEach(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "product-images-model-"));
    dbPath = path.join(tempDir, "test.sqlite");
    coversDir = path.join(tempDir, "covers");
    previewsDir = path.join(tempDir, "previews");
    await loadFreshModules();
  });

  afterEach(() => {
    dbModule?.db.close();
    cleanupSqliteFiles(dbPath);
    if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    delete process.env.BAMBU_DB;
    delete process.env.BAMBU_COVERS_DIR;
    delete process.env.CATALOG_PREVIEWS_DIR;
    dbModule = null;
    productImagesModule = null;
    productsModule = null;
  });

  it("ranks local candidates deterministically and deduplicates stable candidate keys", () => {
    const product = productsModule!.createProduct({ name: "Image Dragon" });
    seedCatalogPreview(product.id, "a".repeat(64));
    seedSavedBatchCovers(product.id, ["701", "702"]);

    expect(
      productImagesModule!
        .listProductImageCandidates(product.id)
        .map((candidate) => candidate.source_type),
    ).toEqual(["catalog_preview", "print_cover", "print_cover", "placeholder"]);

    addPersistedPhoto(product.id, "source_hero", "source_hero:makerworld:dragon", "hero.jpg");
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
    expect(candidates.filter((candidate) => candidate.available).length).toBe(candidates.length);
  });

  it("selects ephemeral candidates transactionally and preserves Manual mode until Auto return", () => {
    const product = productsModule!.createProduct({ name: "Locked Dragon" });
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

    const heroId = addPersistedPhoto(
      product.id,
      "source_hero",
      "source_hero:makerworld:locked-dragon",
      "hero-after-lock.jpg",
    );
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
