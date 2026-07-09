import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type DbModule = typeof import("../lib/db.js");
type ProductsModule = typeof import("../models/products.js");

let tempDir = "";
let dbPath = "";
let dbModule: DbModule | null = null;
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
  dbModule = await import("../lib/db.js");
  productsModule = await import("../models/products.js");
}

describe.sequential("products model", () => {
  beforeEach(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "products-model-"));
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
  });

  it("creates a product with lookup labels and computed sellability fields", () => {
    const product = productsModule!.createProduct({
      name: "  Controller Stand  ",
      category_id: "gaming",
      status_id: "active",
      source_id: "printables",
      license_id: "personal_use_only",
      target_sale_price: 20,
      model_url: "https://example.com/controller-stand",
    });

    expect(product).toMatchObject({
      name: "Controller Stand",
      category_id: "gaming",
      category_label: "Gaming",
      status_id: "active",
      status_label: "Active",
      source_label: "Printables",
      license_label: "Personal Use Only",
      can_sell_level: "red",
      can_sell_label: "Personal use only",
      ready_to_list: false,
    });
    expect(productsModule!.listProducts()).toContainEqual(product);
  });

  it("computes ready-to-list after a main photo is linked", () => {
    const created = productsModule!.createProduct({
      name: "Desk Tray",
      status_id: "listed",
      source_id: "original",
      license_id: "original_owned",
      target_sale_price: 18,
      model_url: null,
    });
    const photoId = Number(
      dbModule!.db
        .prepare(
          `INSERT INTO product_photos (product_id, path, role)
           VALUES (?, ?, ?)
           RETURNING id`,
        )
        .pluck()
        .get(created.id, "/photos/desk-tray.jpg", "main"),
    );
    const fileId = Number(
      dbModule!.db
        .prepare(
          `INSERT INTO product_files (product_id, role)
           VALUES (?, ?)
           RETURNING id`,
        )
        .pluck()
        .get(created.id, "source"),
    );

    const updated = productsModule!.updateProduct(created.id, {
      main_photo_id: photoId,
      main_file_id: fileId,
    });

    expect(updated).toMatchObject({
      main_photo_path: "/photos/desk-tray.jpg",
      can_sell_level: "green",
      can_sell_label: "Original design",
      ready_to_list: true,
    });
  });

  it("lists only active restock products to print next in priority order", () => {
    const urgent = productsModule!.createProduct({
      name: "Urgent Restock",
      status_id: "active",
      restock_priority: "urgent",
    });
    const high = productsModule!.createProduct({
      name: "High Restock",
      status_id: "selling_well",
      restock_priority: "high",
    });
    productsModule!.createProduct({
      name: "No Restock",
      status_id: "active",
      restock_priority: "none",
    });
    productsModule!.createProduct({
      name: "Not Active",
      status_id: "listed",
      restock_priority: "urgent",
    });

    expect(productsModule!.listProductsToPrintNext().map((product) => product.id)).toEqual([
      urgent.id,
      high.id,
    ]);
  });

  it("returns editable detail fields and preserves them on partial update", () => {
    const printerId = Number(
      dbModule!.db
        .prepare(
          `INSERT INTO printers (provider, provider_printer_id, name)
           VALUES (?, ?, ?)
           RETURNING id`,
        )
        .pluck()
        .get("bambu", "printer-1", "A1 Mini"),
    );
    const product = productsModule!.createProduct({
      name: "Detailed Product",
      model_url: "https://example.com/model",
      etsy_listing_url: "https://etsy.com/listing/123",
      default_material: "PLA",
      primary_color: "#ffffff",
      accent_color: "#222222",
      preferred_printer_id: printerId,
      estimated_print_time_s: 5400,
      estimated_filament_g: 42.5,
      booth_price: 12,
      etsy_price: 15.99,
      packaging_cost: 0.75,
      handling_minutes: 3,
      target_margin_pct: 0.5,
      pricing_notes: "Round to market-friendly prices.",
      notes: "Use a brim.",
    });

    expect(product).toMatchObject({
      model_url: "https://example.com/model",
      etsy_listing_url: "https://etsy.com/listing/123",
      default_material: "PLA",
      primary_color: "#ffffff",
      accent_color: "#222222",
      preferred_printer_id: printerId,
      estimated_print_time_s: 5400,
      estimated_filament_g: 42.5,
      booth_price: 12,
      etsy_price: 15.99,
      packaging_cost: 0.75,
      handling_minutes: 3,
      target_margin_pct: 0.5,
      pricing_notes: "Round to market-friendly prices.",
      notes: "Use a brim.",
    });
    expect(productsModule!.listProducts()).toContainEqual(expect.objectContaining(product));

    const updated = productsModule!.updateProduct(product.id, {
      status_id: "active",
      booth_price: 13,
      pricing_notes: "Updated notes.",
    });

    expect(updated).toMatchObject({
      status_id: "active",
      model_url: "https://example.com/model",
      etsy_listing_url: "https://etsy.com/listing/123",
      default_material: "PLA",
      primary_color: "#ffffff",
      accent_color: "#222222",
      preferred_printer_id: printerId,
      estimated_print_time_s: 5400,
      estimated_filament_g: 42.5,
      booth_price: 13,
      etsy_price: 15.99,
      packaging_cost: 0.75,
      handling_minutes: 3,
      target_margin_pct: 0.5,
      pricing_notes: "Updated notes.",
      notes: "Use a brim.",
    });
  });

  it("creates a product from a job and links the source job", () => {
    const printerId = Number(
      dbModule!.db
        .prepare(
          `INSERT INTO printers (provider, provider_printer_id, name)
           VALUES (?, ?, ?)
           RETURNING id`,
        )
        .pluck()
        .get("bambu", "printer-1", "A1 Mini"),
    );
    const jobId = Number(
      dbModule!.db
        .prepare(
          `INSERT INTO jobs (
             session_id,
             designTitle,
             total_weight_g,
             total_time_s,
             printer_id,
             deviceModel,
             status
           ) VALUES (?, ?, ?, ?, ?, ?, ?)
           RETURNING id`,
        )
        .pluck()
        .get("session-job-product", "Dragon Egg", 88.5, 5400, printerId, "A1 mini", "finish"),
    );

    const product = productsModule!.createProductFromJob(jobId);

    expect(product).toMatchObject({
      name: "Dragon Egg",
      status_id: "test_print",
      default_material: null,
      primary_color: null,
      preferred_printer_id: printerId,
      estimated_print_time_s: 5400,
      estimated_filament_g: 88.5,
    });
    expect(
      dbModule!.db
        .prepare("SELECT relationship FROM product_jobs WHERE product_id = ? AND job_id = ?")
        .pluck()
        .get(product.id, jobId),
    ).toBe("source_job");
  });

  it("creates a product from a project and links all project jobs", () => {
    const projectId = Number(
      dbModule!.db
        .prepare(
          "INSERT INTO projects (name, created_at) VALUES (?, CURRENT_TIMESTAMP) RETURNING id",
        )
        .pluck()
        .get("Cubee Dragons"),
    );
    const insertJob = dbModule!.db.prepare(
      `INSERT INTO jobs (session_id, designTitle, total_weight_g, total_time_s, project_id, status)
       VALUES (?, ?, ?, ?, ?, 'finish')
       RETURNING id`,
    );
    const firstJobId = Number(
      insertJob.pluck().get("project-job-1", "Cubee Dragon Left", 40, 1200, projectId),
    );
    const secondJobId = Number(
      insertJob.pluck().get("project-job-2", "Cubee Dragon Right", 60, 1800, projectId),
    );

    const product = productsModule!.createProductFromProject(projectId);

    expect(product).toMatchObject({
      name: "Cubee Dragons",
      status_id: "test_print",
      estimated_print_time_s: 3000,
      estimated_filament_g: 100,
    });
    expect(
      dbModule!.db
        .prepare("SELECT job_id FROM product_jobs WHERE product_id = ? ORDER BY job_id")
        .pluck()
        .all(product.id),
    ).toEqual([firstJobId, secondJobId]);
  });

  it("defaults missing product status to idea", () => {
    const product = productsModule!.createProduct({ name: "Missing Status" });

    expect(product).toMatchObject({
      status_id: "idea",
      status_label: "Idea",
    });
  });

  it("rejects null product status on create and update", () => {
    expect(() =>
      productsModule!.createProduct({ name: "Null Status", status_id: null as unknown as string }),
    ).toThrow(/status_id is required/i);

    const product = productsModule!.createProduct({ name: "Valid Status", status_id: "idea" });

    expect(() =>
      productsModule!.updateProduct(product.id, { status_id: null as unknown as string }),
    ).toThrow(/status_id is required/i);
  });

  it("rejects blank names, unknown lookup ids, and negative pricing defaults", () => {
    expect(() => productsModule!.createProduct({ name: "   " })).toThrow(/name/i);
    expect(() =>
      productsModule!.createProduct({ name: "Bad Category", category_id: "missing" }),
    ).toThrow(/category_id/i);
    expect(() =>
      productsModule!.createProduct({ name: "Bad Price", packaging_cost: -0.01 }),
    ).toThrow(/packaging_cost/i);
  });
});
