import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type DbModule = typeof import("../lib/db.js");
type ProductsModule = typeof import("../models/products.js");
type BatchesModule = typeof import("../models/batches.js");
type CreateProductInput = import("../models/products.js").CreateProductInput;

let tempDir = "";
let dbPath = "";
let dbModule: DbModule | null = null;
let productsModule: ProductsModule | null = null;
let batchesModule: BatchesModule | null = null;

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
  batchesModule = await import("../models/batches.js");
}

function createProduct(overrides: Partial<CreateProductInput> = {}) {
  return productsModule!.createProduct({
    name: `Product ${Math.random()}`,
    status_id: "active",
    default_material: "PETG",
    primary_color: "#ff6600",
    packaging_cost: 0.25,
    handling_minutes: 2,
    target_margin_pct: 0.4,
    ...overrides,
  });
}

function insertJob(
  overrides: { total_weight_g?: number; total_time_s?: number; deviceModel?: string } = {},
) {
  const result = dbModule!.db
    .prepare(
      `INSERT INTO jobs (session_id, print_run, total_weight_g, total_time_s, deviceModel, status)
       VALUES (?, 1, ?, ?, ?, 'finish')`,
    )
    .run(
      `session-${Math.random()}`,
      overrides.total_weight_g ?? 80,
      overrides.total_time_s ?? 7200,
      overrides.deviceModel ?? "P1S",
    );
  return result.lastInsertRowid as number;
}

describe.sequential("batches model", () => {
  beforeEach(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "batches-model-"));
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
    batchesModule = null;
  });

  it("creates a priced batch from product and profile defaults", () => {
    const product = createProduct();

    const batch = batchesModule!.createBatch({
      product_id: product.id,
      pricing_profile_id: "booth",
      planned_quantity: 10,
      completed_quantity: 5,
      total_filament_g: 100,
      total_print_time_s: 3600,
    });

    expect(batch).toMatchObject({
      product_id: product.id,
      product_name: product.name,
      pricing_profile_id: "booth",
      pricing_profile_label: "Booth",
      planned_quantity: 10,
      completed_quantity: 5,
      material_type: "PETG",
      primary_color: "#ff6600",
    });
    expect(batch.unit_cost).toBeGreaterThan(0);
    expect(batch.suggested_price).toBeGreaterThan(batch.unit_cost!);
    expect(batchesModule!.listBatches()).toContainEqual(batch);
  });

  it("allows draft batches with zero completed quantity but rejects negative quantities", () => {
    const product = createProduct();

    const draft = batchesModule!.createBatch({
      product_id: product.id,
      pricing_profile_id: "booth",
      planned_quantity: 4,
      completed_quantity: 0,
    });

    expect(draft.unit_cost).toBeNull();
    expect(draft.suggested_price).toBeNull();
    expect(draft.estimated_margin_pct).toBeNull();

    expect(() =>
      batchesModule!.createBatch({
        product_id: product.id,
        pricing_profile_id: "booth",
        planned_quantity: 4,
        completed_quantity: -1,
      }),
    ).toThrow(/completed_quantity/i);
  });

  it("uses linked job totals only when explicit batch totals are null", () => {
    const product = createProduct();
    const jobId = insertJob({ total_weight_g: 80, total_time_s: 7200, deviceModel: "P1S" });
    const batch = batchesModule!.createBatch({
      product_id: product.id,
      pricing_profile_id: "booth",
      planned_quantity: 2,
      completed_quantity: 2,
    });

    const linked = batchesModule!.addBatchJob(batch.id, jobId)!;
    expect(linked.total_filament_g).toBe(80);
    expect(linked.total_print_time_s).toBe(7200);
    expect(linked.unit_cost).toBeGreaterThan(0);

    const updated = batchesModule!.updateBatch(batch.id, {
      total_filament_g: 20,
      total_print_time_s: 3600,
    })!;

    expect(updated.total_filament_g).toBe(20);
    expect(updated.total_print_time_s).toBe(3600);
  });

  it("prices Etsy batches higher than booth batches for the same costs", () => {
    const product = createProduct({ target_margin_pct: null });
    const common = {
      product_id: product.id,
      planned_quantity: 5,
      completed_quantity: 5,
      total_filament_g: 100,
      total_print_time_s: 3600,
    };

    const booth = batchesModule!.createBatch({ ...common, pricing_profile_id: "booth" });
    const etsy = batchesModule!.createBatch({ ...common, pricing_profile_id: "etsy" });

    expect(etsy.fixed_fee_per_order).toBe(0.45);
    expect(etsy.suggested_price).toBeGreaterThan(booth.suggested_price!);
  });

  it("rejects unknown product and pricing profile ids", () => {
    const product = createProduct();

    expect(() =>
      batchesModule!.createBatch({ product_id: 9999, pricing_profile_id: "booth" }),
    ).toThrow(/Unknown product_id/i);
    expect(() =>
      batchesModule!.createBatch({ product_id: product.id, pricing_profile_id: "missing" }),
    ).toThrow(/Unknown pricing_profile_id/i);
  });
});
