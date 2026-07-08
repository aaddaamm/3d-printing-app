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
    expect(productsModule!.listProducts()).toEqual([product]);
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

  it("rejects blank names and unknown lookup ids", () => {
    expect(() => productsModule!.createProduct({ name: "   " })).toThrow(/name/i);
    expect(() =>
      productsModule!.createProduct({ name: "Bad Category", category_id: "missing" }),
    ).toThrow(/category_id/i);
  });
});
