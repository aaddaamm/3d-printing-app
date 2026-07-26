import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PriceQuoteResult } from "../models/price-quotes.js";
import type { ProductSummary } from "../models/products.js";

type DbModule = typeof import("../lib/db.js");
type ProductsModule = typeof import("../models/products.js");
type SavedSnapshot = {
  quote: PriceQuoteResult;
};
type SavedResult = {
  product: ProductSummary;
  batch_id: number;
  snapshots: { direct: SavedSnapshot; etsy: SavedSnapshot };
};
type SavedHistoryItem = {
  batch_id: number;
  created_at: string;
  sellable_units: number;
  job_ids: number[];
  notes: string | null;
  snapshots: { direct: SavedSnapshot; etsy: SavedSnapshot };
};
type SavedProductPricingModule = {
  SavedProductPricingValidationError: typeof Error;
  saveProductPricing(input: Record<string, unknown>): SavedResult;
  listProductPricingHistory(productId: number): SavedHistoryItem[];
};

let tempDir = "";
let dbPath = "";
let dbModule: DbModule | null = null;
let productsModule: ProductsModule | null = null;
let savedPricingModule: SavedProductPricingModule | null = null;
let successfulJobId = 0;
let failedJobId = 0;

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
  const savedPricingModulePath = "../models/saved-product-pricing.js";
  savedPricingModule = (await import(savedPricingModulePath)) as SavedProductPricingModule;
}

function seedRatesAndJobs(): void {
  const db = dbModule!.db;
  db.exec("DELETE FROM machine_rates; DELETE FROM material_rates;");
  db.prepare(
    `INSERT INTO machine_rates
       (device_model, purchase_price, lifetime_hrs, electricity_rate, maintenance_buffer, machine_rate_per_hr)
     VALUES ('P1S', 0, 1, 0, 0, 2), ('Snapmaker U1', 0, 1, 0, 0, 4)`,
  ).run();
  db.prepare(
    `INSERT INTO material_rates (filament_type, cost_per_g, waste_buffer_pct, rate_per_g)
     VALUES ('PLA', 0.02, 0, 0.02), ('PETG', 0.03, 0, 0.03)`,
  ).run();
  db.prepare(
    `UPDATE labor_config
     SET hourly_rate = 30, failure_buffer_pct = 0.1, overhead_buffer_pct = 0.05
     WHERE id = 1`,
  ).run();
  db.prepare(
    `UPDATE pricing_profiles
     SET target_margin_pct = 0.4, platform_fee_pct = 0, fixed_fee_per_order = 0,
         minimum_price = NULL
     WHERE id = 'booth'`,
  ).run();
  db.prepare(
    `UPDATE pricing_profiles
     SET target_margin_pct = 0.5, platform_fee_pct = 0.12, fixed_fee_per_order = 0.45,
         minimum_price = NULL
     WHERE id = 'etsy'`,
  ).run();

  successfulJobId = Number(
    db
      .prepare(
        `INSERT INTO jobs (provider, session_id, print_run, deviceModel, status, designTitle)
         VALUES ('bambu', 'saved-success', 1, 'P1S', 'finish', 'Dragon')
         RETURNING id`,
      )
      .pluck()
      .get(),
  );
  failedJobId = Number(
    db
      .prepare(
        `INSERT INTO jobs (provider, session_id, print_run, deviceModel, status, designTitle)
         VALUES ('moonraker', 'saved-failed', 1, 'Snapmaker U1', 'cancelled', 'Dragon retry')
         RETURNING id`,
      )
      .pluck()
      .get(),
  );
  const insertTask = db.prepare(
    `INSERT INTO print_tasks
       (id, provider, session_id, title, status, deviceModel, weight, costTime, raw_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, '{}')`,
  );
  insertTask.run(
    "saved-success-task",
    "bambu",
    "saved-success",
    "Dragon body",
    "finish",
    "P1S",
    50,
    3600,
  );
  insertTask.run(
    "saved-failed-task",
    "moonraker",
    "saved-failed",
    "Dragon retry",
    "cancelled",
    "Snapmaker U1",
    20,
    1800,
  );
  db.prepare(
    `INSERT INTO job_filaments (task_id, filament_type, weight_g)
     VALUES ('saved-success-task', 'PLA', 50), ('saved-failed-task', 'PETG', 20)`,
  ).run();
}

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    job_ids: [successfulJobId, failedJobId],
    sellable_units: 3,
    batch_labor_minutes: 12,
    per_unit_labor_minutes: 2,
    packaging_cost_per_unit: 0.75,
    extra_cost: 4.5,
    ...overrides,
  };
}

type SnapshotJsonColumn = "input_json" | "assumptions_json" | "warnings_json" | "breakdown_json";

function mutateSnapshotJson(
  batchId: number,
  channel: "direct" | "etsy",
  column: SnapshotJsonColumn,
  mutate: (value: Record<string, unknown>) => void,
): void {
  const raw = dbModule!.db
    .prepare(`SELECT ${column} FROM product_price_snapshots WHERE batch_id = ? AND channel = ?`)
    .pluck()
    .get(batchId, channel) as string;
  const value = JSON.parse(raw) as Record<string, unknown>;
  mutate(value);
  dbModule!.db
    .prepare(`UPDATE product_price_snapshots SET ${column} = ? WHERE batch_id = ? AND channel = ?`)
    .run(JSON.stringify(value), batchId, channel);
}

function expectHistoryRejected(productId: number): void {
  expect(() => savedPricingModule!.listProductPricingHistory(productId)).toThrowError(
    savedPricingModule!.SavedProductPricingValidationError,
  );
}

describe.sequential("saved product pricing model", () => {
  beforeEach(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "saved-product-pricing-"));
    dbPath = path.join(tempDir, "test.sqlite");
    await loadFreshModules();
    seedRatesAndJobs();
  });

  afterEach(() => {
    dbModule?.db.close();
    cleanupSqliteFiles(dbPath);
    if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    delete process.env.BAMBU_DB;
    dbModule = null;
    productsModule = null;
    savedPricingModule = null;
  });

  it("requires exactly one existing or new Product target", () => {
    const product = productsModule!.createProduct({ name: "Existing" });

    for (const target of [
      {},
      { product_id: product.id, new_product: { name: "Also new" } },
      { product_id: 999_999 },
    ]) {
      expect(() => savedPricingModule!.saveProductPricing(validInput(target))).toThrowError(
        savedPricingModule!.SavedProductPricingValidationError,
      );
    }
  });

  it("recalculates both channels and saves one complete Batch for an existing Product", () => {
    const product = productsModule!.createProduct({ name: "Existing Dragon" });
    const saved = savedPricingModule!.saveProductPricing(
      validInput({
        product_id: product.id,
        job_ids: [failedJobId, successfulJobId, failedJobId],
      }),
    );

    expect(saved.snapshots.direct.quote.breakdown.totalCost).toBe(
      saved.snapshots.etsy.quote.breakdown.totalCost,
    );
    expect(saved.snapshots.direct.quote.breakdown.suggestedPrice).not.toBe(
      saved.snapshots.etsy.quote.breakdown.suggestedPrice,
    );
    expect(
      dbModule!.db
        .prepare("SELECT COUNT(*) AS count FROM product_batch_jobs WHERE batch_id = ?")
        .get(saved.batch_id),
    ).toEqual({ count: 2 });
    expect(
      dbModule!.db
        .prepare("SELECT job_id FROM product_batch_jobs WHERE batch_id = ? ORDER BY rowid")
        .pluck()
        .all(saved.batch_id),
    ).toEqual([failedJobId, successfulJobId]);
    expect(
      dbModule!.db
        .prepare(
          `SELECT pricing_profile_id, planned_quantity, completed_quantity, source_type, extra_cost
           FROM product_batches WHERE id = ?`,
        )
        .get(saved.batch_id),
    ).toEqual({
      pricing_profile_id: "booth",
      planned_quantity: 3,
      completed_quantity: 3,
      source_type: "price_quote",
      extra_cost: 4.5,
    });
    expect(saved.product).toMatchObject({
      booth_price: saved.snapshots.direct.quote.breakdown.suggestedPrice,
      etsy_price: saved.snapshots.etsy.quote.breakdown.suggestedPrice,
      target_sale_price: saved.snapshots.direct.quote.breakdown.suggestedPrice,
    });

    const snapshotRows = dbModule!.db
      .prepare(
        `SELECT channel, input_json, assumptions_json, warnings_json, breakdown_json
         FROM product_price_snapshots WHERE batch_id = ? ORDER BY channel`,
      )
      .all(saved.batch_id) as Array<{
      channel: string;
      input_json: string;
      assumptions_json: string;
      warnings_json: string;
      breakdown_json: string;
    }>;
    expect(snapshotRows).toHaveLength(2);
    for (const row of snapshotRows) {
      expect(() => JSON.parse(row.input_json)).not.toThrow();
      expect(() => JSON.parse(row.assumptions_json)).not.toThrow();
      expect(() => JSON.parse(row.warnings_json)).not.toThrow();
      expect(() => JSON.parse(row.breakdown_json)).not.toThrow();
    }
  });

  it("creates a Product through Product model fields and returns immutable stored history", () => {
    const saved = savedPricingModule!.saveProductPricing(
      validInput({
        new_product: {
          name: "  Crystal Dragon  ",
          designer: "  Model Maker  ",
          source_id: "printables",
          license_id: "commercial_allowed",
          model_url: " https://example.com/crystal-dragon ",
          notes: "  Approved design  ",
        },
      }),
    );
    const originalHistory = savedPricingModule!.listProductPricingHistory(saved.product.id);

    expect(saved.product).toMatchObject({
      name: "Crystal Dragon",
      designer: "Model Maker",
      source_id: "printables",
      license_id: "commercial_allowed",
      model_url: "https://example.com/crystal-dragon",
      notes: "Approved design",
    });
    expect(originalHistory).toHaveLength(1);
    expect(originalHistory[0]).toMatchObject({
      batch_id: saved.batch_id,
      sellable_units: 3,
      job_ids: [successfulJobId, failedJobId],
      snapshots: {
        direct: { quote: saved.snapshots.direct.quote },
        etsy: { quote: saved.snapshots.etsy.quote },
      },
    });

    dbModule!.db.exec(`
      UPDATE material_rates SET rate_per_g = rate_per_g * 10;
      UPDATE machine_rates SET machine_rate_per_hr = machine_rate_per_hr * 10;
      UPDATE labor_config SET hourly_rate = 300 WHERE id = 1;
      UPDATE jobs SET designTitle = 'Changed after save';
    `);

    expect(savedPricingModule!.listProductPricingHistory(saved.product.id)).toEqual(
      originalHistory,
    );
  });

  it("projects prices from the latest successfully saved Batch", () => {
    const product = productsModule!.createProduct({ name: "Latest price" });
    const first = savedPricingModule!.saveProductPricing(
      validInput({ product_id: product.id, extra_cost: 0 }),
    );
    const second = savedPricingModule!.saveProductPricing(
      validInput({ product_id: product.id, extra_cost: 20 }),
    );

    expect(second.product.booth_price).toBe(second.snapshots.direct.quote.breakdown.suggestedPrice);
    expect(second.product.etsy_price).toBe(second.snapshots.etsy.quote.breakdown.suggestedPrice);
    expect(second.product.target_sale_price).toBe(
      second.snapshots.direct.quote.breakdown.suggestedPrice,
    );
    expect(second.product.booth_price).not.toBe(first.product.booth_price);
    expect(
      savedPricingModule!.listProductPricingHistory(product.id).map((item) => item.batch_id),
    ).toEqual([second.batch_id, first.batch_id]);
  });

  it("cascades one Product's saved pricing without touching unrelated Products", () => {
    const deleted = savedPricingModule!.saveProductPricing(
      validInput({ new_product: { name: "Delete me" } }),
    );
    const kept = savedPricingModule!.saveProductPricing(
      validInput({ new_product: { name: "Keep me" } }),
    );

    dbModule!.db.prepare("DELETE FROM products WHERE id = ?").run(deleted.product.id);

    expect(
      dbModule!.db
        .prepare("SELECT COUNT(*) AS count FROM product_batches WHERE product_id = ?")
        .get(deleted.product.id),
    ).toEqual({ count: 0 });
    expect(
      dbModule!.db
        .prepare("SELECT COUNT(*) AS count FROM product_batch_jobs WHERE batch_id = ?")
        .get(deleted.batch_id),
    ).toEqual({ count: 0 });
    expect(
      dbModule!.db
        .prepare("SELECT COUNT(*) AS count FROM product_price_snapshots WHERE batch_id = ?")
        .get(deleted.batch_id),
    ).toEqual({ count: 0 });
    expect(savedPricingModule!.listProductPricingHistory(kept.product.id)).toHaveLength(1);
  });

  it("rolls back new Product, Batch, links, snapshots, and projection on snapshot failure", () => {
    const before = {
      products: dbModule!.db.prepare("SELECT COUNT(*) FROM products").pluck().get(),
      batches: dbModule!.db.prepare("SELECT COUNT(*) FROM product_batches").pluck().get(),
      links: dbModule!.db.prepare("SELECT COUNT(*) FROM product_batch_jobs").pluck().get(),
      snapshots: dbModule!.db.prepare("SELECT COUNT(*) FROM product_price_snapshots").pluck().get(),
    };
    dbModule!.db.exec(`
      CREATE TEMP TRIGGER fail_saved_snapshot
      BEFORE INSERT ON product_price_snapshots
      BEGIN
        SELECT RAISE(ABORT, 'snapshot failure');
      END;
    `);

    expect(() =>
      savedPricingModule!.saveProductPricing(
        validInput({ new_product: { name: "Must roll back" } }),
      ),
    ).toThrow(/snapshot failure/i);
    expect({
      products: dbModule!.db.prepare("SELECT COUNT(*) FROM products").pluck().get(),
      batches: dbModule!.db.prepare("SELECT COUNT(*) FROM product_batches").pluck().get(),
      links: dbModule!.db.prepare("SELECT COUNT(*) FROM product_batch_jobs").pluck().get(),
      snapshots: dbModule!.db.prepare("SELECT COUNT(*) FROM product_price_snapshots").pluck().get(),
    }).toEqual(before);
  });

  it("rejects incomplete saved-quote Batches in history", () => {
    const product = productsModule!.createProduct({ name: "Corrupt history" });
    dbModule!.db
      .prepare(
        `INSERT INTO product_batches (
           product_id, pricing_profile_id, planned_quantity, completed_quantity, source_type
         ) VALUES (?, 'booth', 1, 1, 'price_quote')`,
      )
      .run(product.id);

    expect(() => savedPricingModule!.listProductPricingHistory(product.id)).toThrowError(
      savedPricingModule!.SavedProductPricingValidationError,
    );
    expect(() => savedPricingModule!.listProductPricingHistory(product.id)).toThrow(
      /incomplete.*direct.*etsy/i,
    );
  });

  it("rejects structurally corrupt snapshot JSON in history", () => {
    const saved = savedPricingModule!.saveProductPricing(
      validInput({ new_product: { name: "Invalid snapshot JSON" } }),
    );
    dbModule!.db
      .prepare(
        `UPDATE product_price_snapshots
         SET assumptions_json = '{}'
         WHERE batch_id = ? AND channel = 'direct'`,
      )
      .run(saved.batch_id);

    expect(() => savedPricingModule!.listProductPricingHistory(saved.product.id)).toThrowError(
      savedPricingModule!.SavedProductPricingValidationError,
    );
    expect(() => savedPricingModule!.listProductPricingHistory(saved.product.id)).toThrow(
      /invalid JSON/i,
    );
  });

  it("rejects conflicting Direct and Etsy job identity", () => {
    const saved = savedPricingModule!.saveProductPricing(
      validInput({ new_product: { name: "Conflicting jobs" } }),
    );
    mutateSnapshotJson(saved.batch_id, "etsy", "input_json", (input) => {
      input["job_ids"] = [...(input["job_ids"] as number[])].reverse();
      input["attempts"] = [...(input["attempts"] as unknown[])].reverse();
    });

    expectHistoryRejected(saved.product.id);
  });

  it("rejects conflicting Direct and Etsy quantities", () => {
    const saved = savedPricingModule!.saveProductPricing(
      validInput({
        new_product: { name: "Conflicting quantities" },
        per_unit_labor_minutes: 0,
        packaging_cost_per_unit: 0,
      }),
    );
    mutateSnapshotJson(saved.batch_id, "etsy", "input_json", (input) => {
      input["sellable_units"] = 4;
    });
    mutateSnapshotJson(saved.batch_id, "etsy", "breakdown_json", (breakdown) => {
      breakdown["sellableUnits"] = 4;
    });

    expectHistoryRejected(saved.product.id);
  });

  it.each(["batch_labor_minutes", "extra_cost"] as const)(
    "rejects stored %s input that no longer agrees with its breakdown",
    (field) => {
      const saved = savedPricingModule!.saveProductPricing(
        validInput({ new_product: { name: `Conflicting ${field}` } }),
      );
      for (const channel of ["direct", "etsy"] as const) {
        mutateSnapshotJson(saved.batch_id, channel, "input_json", (input) => {
          input[field] = Number(input[field]) + 1;
        });
      }

      expectHistoryRejected(saved.product.id);
    },
  );

  it("rejects a breakdown quantity that conflicts with its immutable input", () => {
    const saved = savedPricingModule!.saveProductPricing(
      validInput({ new_product: { name: "Conflicting breakdown quantity" } }),
    );
    mutateSnapshotJson(saved.batch_id, "direct", "breakdown_json", (breakdown) => {
      breakdown["sellableUnits"] = 4;
    });

    expectHistoryRejected(saved.product.id);
  });

  it.each([
    ["target margin at the hard limit", "direct", "target_margin_pct", 0.95],
    ["target margin plus fee at the hard limit", "etsy", "target_margin_pct", 0.84],
    ["a platform fee on Direct pricing", "direct", "platform_fee_pct", 0.01],
  ] as const)("rejects %s", (_name, channel, field, value) => {
    const saved = savedPricingModule!.saveProductPricing(
      validInput({ new_product: { name: "Invalid margin or fee" } }),
    );
    mutateSnapshotJson(saved.batch_id, channel, "assumptions_json", (assumptions) => {
      assumptions[field] = value;
    });
    dbModule!.db
      .prepare(`UPDATE product_price_snapshots SET ${field} = ? WHERE batch_id = ? AND channel = ?`)
      .run(value, saved.batch_id, channel);

    expectHistoryRejected(saved.product.id);
  });

  it.each([
    ["assumption", "labor_hourly_rate"],
    ["breakdown", "total_cost"],
  ] as const)("rejects a scalar-vs-JSON %s mismatch", (_name, column) => {
    const saved = savedPricingModule!.saveProductPricing(
      validInput({ new_product: { name: "Scalar mismatch" } }),
    );
    dbModule!.db
      .prepare(
        `UPDATE product_price_snapshots SET ${column} = ${column} + 1
         WHERE batch_id = ? AND channel = 'direct'`,
      )
      .run(saved.batch_id);

    expectHistoryRejected(saved.product.id);
  });

  it("keeps historical input identity after mutable Batch and link changes", () => {
    const saved = savedPricingModule!.saveProductPricing(
      validInput({ new_product: { name: "Immutable identity" } }),
    );
    const original = savedPricingModule!.listProductPricingHistory(saved.product.id);

    dbModule!.db
      .prepare(
        `UPDATE product_batches
         SET planned_quantity = 99, completed_quantity = 99
         WHERE id = ?`,
      )
      .run(saved.batch_id);
    dbModule!.db
      .prepare("DELETE FROM product_batch_jobs WHERE batch_id = ? AND job_id = ?")
      .run(saved.batch_id, successfulJobId);
    dbModule!.db.prepare("DELETE FROM jobs WHERE id = ?").run(failedJobId);

    expect(savedPricingModule!.listProductPricingHistory(saved.product.id)).toEqual(original);
    expect(original[0]).toMatchObject({
      sellable_units: 3,
      job_ids: [successfulJobId, failedJobId],
    });
  });
});
