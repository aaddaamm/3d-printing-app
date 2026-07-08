import Database from "better-sqlite3";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runDatabaseMigrations } from "../lib/db/migrations-list.js";

let tempDir = "";
let dbPath = "";
let database: Database.Database | null = null;

function cleanupSqliteFiles(basePath: string): void {
  for (const suffix of ["", "-wal", "-shm"]) {
    const target = `${basePath}${suffix}`;
    if (fs.existsSync(target)) fs.rmSync(target, { force: true });
  }
}

function tableNames(): string[] {
  return database!
    .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    .all()
    .map((row) => (row as { name: string }).name);
}

function indexNames(): string[] {
  return database!
    .prepare("SELECT name FROM sqlite_master WHERE type='index' ORDER BY name")
    .all()
    .map((row) => (row as { name: string }).name);
}

function columnNames(tableName: string): string[] {
  return database!
    .prepare(`PRAGMA table_info(${tableName})`)
    .all()
    .map((row) => (row as { name: string }).name);
}

function sortedLookupIds(tableName: string): string[] {
  return database!
    .prepare(`SELECT id FROM ${tableName} ORDER BY sort_order`)
    .all()
    .map((row) => (row as { id: string }).id);
}

function pricingProfileIds(): string[] {
  return database!
    .prepare("SELECT id FROM pricing_profiles ORDER BY sort_order")
    .all()
    .map((row) => (row as { id: string }).id);
}

function pricingProfile(id: string): Record<string, unknown> | undefined {
  return database!.prepare("SELECT * FROM pricing_profiles WHERE id = ?").get(id) as
    | Record<string, unknown>
    | undefined;
}

function pricingProfileRows(): Record<string, unknown>[] {
  return database!
    .prepare(
      `SELECT id, target_margin_pct, platform_fee_pct, failure_buffer_pct, overhead_buffer_pct,
              default_packaging_cost, default_setup_minutes, default_handling_minutes,
              minimum_price
       FROM pricing_profiles
       ORDER BY sort_order`,
    )
    .all() as Record<string, unknown>[];
}

function createRequiredExistingTables(): void {
  database!.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE print_tasks (
      id TEXT PRIMARY KEY,
      deviceId TEXT,
      deviceName TEXT,
      deviceModel TEXT,
      raw_json TEXT NOT NULL
    );

    CREATE TABLE jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT UNIQUE NOT NULL,
      deviceId TEXT
    );

    CREATE TABLE sync_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      inserted INTEGER,
      updated INTEGER,
      error TEXT
    );

    CREATE TABLE labor_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      hourly_rate REAL NOT NULL DEFAULT 25.0,
      minimum_minutes REAL NOT NULL DEFAULT 15.0,
      profit_markup_pct REAL NOT NULL DEFAULT 0.20
    );

    CREATE TABLE projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      customer TEXT,
      notes TEXT,
      created_at TEXT NOT NULL
    );
  `);
}

describe.sequential("catalog foundation schema migration", () => {
  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "catalog-schema-"));
    dbPath = path.join(tempDir, "test.sqlite");
    database = new Database(dbPath);
    database.pragma("foreign_keys = ON");
  });

  afterEach(() => {
    database?.close();
    cleanupSqliteFiles(dbPath);
    if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    database = null;
  });

  it("creates catalog foundation tables and indexes idempotently", () => {
    createRequiredExistingTables();

    runDatabaseMigrations(database!);
    runDatabaseMigrations(database!);

    expect(tableNames()).toEqual(
      expect.arrayContaining([
        "scan_roots",
        "managed_blobs",
        "catalog_files",
        "products",
        "assets",
        "asset_files",
        "project_products",
        "file_history",
        "product_statuses",
        "product_categories",
        "product_sources",
        "product_licenses",
        "product_files",
        "product_photos",
        "product_links",
        "product_jobs",
        "pricing_profiles",
        "product_batches",
        "product_batch_jobs",
      ]),
    );

    expect(pricingProfileIds()).toEqual(["personal", "booth", "etsy", "custom"]);
    expect(pricingProfileRows()).toEqual([
      {
        id: "personal",
        target_margin_pct: 0,
        platform_fee_pct: 0,
        failure_buffer_pct: 0,
        overhead_buffer_pct: 0,
        default_packaging_cost: 0,
        default_setup_minutes: 0,
        default_handling_minutes: 0,
        minimum_price: null,
      },
      {
        id: "booth",
        target_margin_pct: 0.5,
        platform_fee_pct: 0.035,
        failure_buffer_pct: 0.08,
        overhead_buffer_pct: 0.05,
        default_packaging_cost: 0.75,
        default_setup_minutes: 10,
        default_handling_minutes: 3,
        minimum_price: 5,
      },
      {
        id: "etsy",
        target_margin_pct: 0.55,
        platform_fee_pct: 0.13,
        failure_buffer_pct: 0.08,
        overhead_buffer_pct: 0.05,
        default_packaging_cost: 1,
        default_setup_minutes: 10,
        default_handling_minutes: 4,
        minimum_price: 9.99,
      },
      {
        id: "custom",
        target_margin_pct: 0.55,
        platform_fee_pct: 0,
        failure_buffer_pct: 0.12,
        overhead_buffer_pct: 0.05,
        default_packaging_cost: 1,
        default_setup_minutes: 15,
        default_handling_minutes: 5,
        minimum_price: 20,
      },
    ]);
    expect(pricingProfile("personal")).toMatchObject({
      target_margin_pct: 0,
      platform_fee_pct: 0,
    });
    expect(pricingProfile("booth")).toMatchObject({
      target_margin_pct: 0.5,
      platform_fee_pct: 0.035,
    });
    expect(pricingProfile("etsy")).toMatchObject({
      target_margin_pct: 0.55,
      platform_fee_pct: 0.13,
    });

    expect(sortedLookupIds("product_statuses")).toEqual([
      "idea",
      "downloaded_designed",
      "test_print",
      "needs_tuning",
      "ready_for_photos",
      "listed",
      "active",
      "selling_well",
      "retired",
    ]);
    expect(sortedLookupIds("product_categories")).toEqual([
      "gaming",
      "workshop",
      "home_organization",
      "decor",
      "personalized",
      "seasonal",
      "custom_repair_parts",
    ]);
    expect(sortedLookupIds("product_sources")).toEqual([
      "hive",
      "original",
      "printables",
      "makerworld",
      "thangs",
      "stlflix",
      "custom_commission",
    ]);
    expect(sortedLookupIds("product_licenses")).toEqual([
      "commercial_allowed",
      "personal_use_only",
      "attribution_required",
      "hive_community",
      "hive_plus",
      "original_owned",
      "unknown_verify",
    ]);

    expect(
      database!.prepare("SELECT label FROM product_statuses WHERE id = ?").pluck().get("idea"),
    ).toBe("Idea");
    expect(
      database!
        .prepare("SELECT allows_commercial_sale FROM product_licenses WHERE id = ?")
        .pluck()
        .get("personal_use_only"),
    ).toBe(0);
    expect(
      database!
        .prepare("SELECT allows_commercial_sale FROM product_licenses WHERE id = ?")
        .pluck()
        .get("hive_community"),
    ).toBe(1);

    expect(columnNames("products")).toEqual(
      expect.arrayContaining([
        "category_id",
        "status_id",
        "source_id",
        "license_id",
        "model_url",
        "main_file_id",
        "main_photo_id",
        "etsy_listing_url",
        "default_material",
        "primary_color",
        "accent_color",
        "preferred_printer_id",
        "estimated_print_time_s",
        "estimated_filament_g",
        "target_sale_price",
        "notes",
        "is_original_design",
        "restock_priority",
        "booth_price",
        "etsy_price",
        "packaging_cost",
        "handling_minutes",
        "target_margin_pct",
        "pricing_notes",
      ]),
    );

    const starterProducts = database!
      .prepare<
        [],
        {
          slug: string;
          category_id: string | null;
          status_id: string;
          license_id: string | null;
          source_id: string | null;
          is_original_design: number;
        }
      >(
        `SELECT slug, category_id, status_id, license_id, source_id, is_original_design
         FROM products
         WHERE slug IN (
          'controller-stand',
          'gridfinity-bin',
          'woodland-switch-cover',
          'family-name-sign',
          'qr-code-business-sign'
         )
         ORDER BY slug`,
      )
      .all();
    expect(starterProducts).toEqual([
      {
        slug: "controller-stand",
        category_id: "gaming",
        status_id: "idea",
        license_id: "unknown_verify",
        source_id: null,
        is_original_design: 0,
      },
      {
        slug: "family-name-sign",
        category_id: "personalized",
        status_id: "idea",
        license_id: "original_owned",
        source_id: "original",
        is_original_design: 1,
      },
      {
        slug: "gridfinity-bin",
        category_id: "workshop",
        status_id: "idea",
        license_id: "unknown_verify",
        source_id: null,
        is_original_design: 0,
      },
      {
        slug: "qr-code-business-sign",
        category_id: "personalized",
        status_id: "idea",
        license_id: "original_owned",
        source_id: "original",
        is_original_design: 1,
      },
      {
        slug: "woodland-switch-cover",
        category_id: "decor",
        status_id: "idea",
        license_id: "unknown_verify",
        source_id: null,
        is_original_design: 0,
      },
    ]);
    expect(database!.prepare("SELECT COUNT(*) FROM products").pluck().get()).toBe(5);

    expect(indexNames()).toEqual(
      expect.arrayContaining([
        "idx_scan_roots_active",
        "idx_catalog_files_root",
        "idx_catalog_files_content_hash",
        "idx_catalog_files_extension",
        "idx_catalog_files_scan_status",
        "idx_catalog_files_storage_role",
        "idx_catalog_files_managed_blob",
        "idx_catalog_files_filename",
        "idx_managed_blobs_hash",
        "idx_products_status",
        "idx_products_designer",
        "idx_products_marketplace",
        "idx_products_name",
        "idx_assets_product",
        "idx_assets_type",
        "idx_asset_files_file",
        "idx_project_products_product",
        "idx_file_history_file",
        "idx_file_history_event_type",
        "idx_file_history_detected_at",
      ]),
    );
  });

  it("enforces unique roots, file paths, and managed blobs", () => {
    createRequiredExistingTables();
    runDatabaseMigrations(database!);

    const insertRoot = database!.prepare(
      `INSERT INTO scan_roots (name, root_path, normalized_root_path)
       VALUES (?, ?, ?)`,
    );
    insertRoot.run("Downloads", "/Users/adam/Downloads", "/users/adam/downloads");
    expect(() =>
      insertRoot.run("Downloads Duplicate", "/Users/Adam/Downloads", "/users/adam/downloads"),
    ).toThrow();

    const insertBlob = database!.prepare(
      `INSERT INTO managed_blobs (content_hash, hash_algorithm, storage_path, normalized_storage_path, size_bytes)
       VALUES (?, ?, ?, ?, ?)`,
    );
    insertBlob.run("abc123", "sha256", "/library/ab/abc123.stl", "/library/ab/abc123.stl", 100);
    expect(() =>
      insertBlob.run("abc123", "sha256", "/library/other.stl", "/library/other.stl", 100),
    ).toThrow();
    expect(() =>
      insertBlob.run("def456", "sha256", "/library/ab/abc123.stl", "/library/ab/abc123.stl", 100),
    ).toThrow();

    const rootId = (database!.prepare("SELECT id FROM scan_roots").get() as { id: number }).id;
    const insertFile = database!.prepare(
      `INSERT INTO catalog_files (root_id, path, normalized_path, filename, extension, content_hash, hash_algorithm)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    insertFile.run(
      rootId,
      "/Users/adam/Downloads/dragon.stl",
      "/users/adam/downloads/dragon.stl",
      "dragon.stl",
      "stl",
      "filehash1",
      "sha256",
    );
    expect(() =>
      insertFile.run(
        rootId,
        "/Users/Adam/Downloads/dragon.stl",
        "/users/adam/downloads/dragon.stl",
        "dragon.stl",
        "stl",
        "filehash1",
        "sha256",
      ),
    ).toThrow();
  });

  it("cascades catalog relationship rows", () => {
    createRequiredExistingTables();
    runDatabaseMigrations(database!);

    const rootId = Number(
      database!
        .prepare(
          `INSERT INTO scan_roots (name, root_path, normalized_root_path)
           VALUES ('Library', '/Library', '/library')`,
        )
        .run().lastInsertRowid,
    );
    const fileId = Number(
      database!
        .prepare(
          `INSERT INTO catalog_files (root_id, path, normalized_path, filename, extension, content_hash, hash_algorithm)
           VALUES (?, '/Library/dragon.stl', '/library/dragon.stl', 'dragon.stl', 'stl', 'hash1', 'sha256')`,
        )
        .run(rootId).lastInsertRowid,
    );
    const projectId = Number(
      database!
        .prepare(
          "INSERT INTO projects (name, created_at) VALUES ('Dragon prints', '2026-07-06T00:00:00.000Z')",
        )
        .run().lastInsertRowid,
    );
    const productId = Number(
      database!.prepare("INSERT INTO products (name, slug) VALUES ('Dragon', 'dragon')").run()
        .lastInsertRowid,
    );
    const assetId = Number(
      database!
        .prepare(
          "INSERT INTO assets (product_id, asset_type, title) VALUES (?, 'model', 'Printable Model')",
        )
        .run(productId).lastInsertRowid,
    );

    database!
      .prepare("INSERT INTO asset_files (asset_id, file_id, role) VALUES (?, ?, 'primary')")
      .run(assetId, fileId);
    database!
      .prepare(
        "INSERT INTO project_products (project_id, product_id, relationship) VALUES (?, ?, 'primary')",
      )
      .run(projectId, productId);
    database!
      .prepare(
        "INSERT INTO file_history (file_id, event_type, new_path, content_hash) VALUES (?, 'indexed', '/Library/dragon.stl', 'hash1')",
      )
      .run(fileId);

    database!.prepare("DELETE FROM assets WHERE id = ?").run(assetId);
    expect(database!.prepare("SELECT COUNT(*) AS n FROM asset_files").get()).toEqual({ n: 0 });

    const secondAssetId = Number(
      database!
        .prepare(
          "INSERT INTO assets (product_id, asset_type, title) VALUES (?, 'model', 'Printable Model')",
        )
        .run(productId).lastInsertRowid,
    );
    database!
      .prepare("INSERT INTO asset_files (asset_id, file_id, role) VALUES (?, ?, 'primary')")
      .run(secondAssetId, fileId);

    database!.prepare("DELETE FROM products WHERE id = ?").run(productId);
    expect(database!.prepare("SELECT COUNT(*) AS n FROM assets").get()).toEqual({ n: 0 });
    expect(database!.prepare("SELECT COUNT(*) AS n FROM project_products").get()).toEqual({ n: 0 });

    database!.prepare("DELETE FROM catalog_files WHERE id = ?").run(fileId);
    expect(database!.prepare("SELECT COUNT(*) AS n FROM file_history").get()).toEqual({ n: 0 });
  });
});

describe.sequential("catalog foundation fresh db schema", () => {
  let moduleDbPath = "";
  let moduleTempDir = "";
  let moduleDb: Database.Database | null = null;

  afterEach(() => {
    moduleDb?.close();
    cleanupSqliteFiles(moduleDbPath);
    if (moduleTempDir && fs.existsSync(moduleTempDir)) {
      fs.rmSync(moduleTempDir, { recursive: true, force: true });
    }
    delete process.env["BAMBU_DB"];
    moduleDb = null;
  });

  it("creates catalog tables when lib/db initializes a fresh database", async () => {
    moduleTempDir = fs.mkdtempSync(path.join(os.tmpdir(), "catalog-fresh-db-"));
    moduleDbPath = path.join(moduleTempDir, `fresh-${Date.now()}.sqlite`);
    process.env["BAMBU_DB"] = moduleDbPath;

    const imported = await import(/* @vite-ignore */ `../lib/db.js?catalogFresh=${Date.now()}`);
    moduleDb = imported.db;
    const rows = imported.db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all()
      .map((row: { name: string }) => row.name);

    expect(rows).toEqual(
      expect.arrayContaining([
        "scan_roots",
        "managed_blobs",
        "catalog_files",
        "products",
        "assets",
        "asset_files",
        "project_products",
        "file_history",
        "product_statuses",
        "product_categories",
        "product_sources",
        "product_licenses",
        "product_files",
        "product_photos",
        "product_links",
        "product_jobs",
        "pricing_profiles",
        "product_batches",
        "product_batch_jobs",
      ]),
    );

    const profileIds = imported.db
      .prepare("SELECT id FROM pricing_profiles ORDER BY sort_order")
      .all()
      .map((row: { id: string }) => row.id);
    expect(profileIds).toEqual(["personal", "booth", "etsy", "custom"]);
    expect(
      imported.db
        .prepare("SELECT target_margin_pct FROM pricing_profiles WHERE id = ?")
        .pluck()
        .get("booth"),
    ).toBe(0.5);

    const productColumns = imported.db
      .prepare("PRAGMA table_info(products)")
      .all()
      .map((row: { name: string }) => row.name);

    expect(productColumns).toEqual(
      expect.arrayContaining([
        "category_id",
        "status_id",
        "source_id",
        "license_id",
        "model_url",
        "main_file_id",
        "main_photo_id",
        "etsy_listing_url",
        "default_material",
        "primary_color",
        "accent_color",
        "preferred_printer_id",
        "estimated_print_time_s",
        "estimated_filament_g",
        "target_sale_price",
        "notes",
        "is_original_design",
        "restock_priority",
        "booth_price",
        "etsy_price",
        "packaging_cost",
        "handling_minutes",
        "target_margin_pct",
        "pricing_notes",
      ]),
    );
  });
});
