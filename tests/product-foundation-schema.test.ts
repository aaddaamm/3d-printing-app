import Database from "better-sqlite3";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runDatabaseMigrations } from "../lib/db/migrations-list.js";

type DbModule = typeof import("../lib/db.js");
type Row = Record<string, unknown>;
type IndexListRow = {
  name: string;
};

const PRODUCT_BATCH_LOOKUP_INDEX = "idx_product_batches_product_source_created_id";
const PRODUCT_BATCH_LOOKUP_INDEX_SQL =
  "CREATE INDEX idx_product_batches_product_source_created_id ON product_batches(product_id, source_type, created_at DESC, id DESC)";

let tempDir = "";
let dbPath = "";
let database: Database.Database | null = null;
let dbModule: DbModule | null = null;

function cleanupSqliteFiles(basePath: string): void {
  for (const suffix of ["", "-wal", "-shm"]) {
    const target = `${basePath}${suffix}`;
    if (fs.existsSync(target)) fs.rmSync(target, { force: true });
  }
}

async function loadFreshDbModule(): Promise<void> {
  vi.resetModules();
  process.env.BAMBU_DB = dbPath;
  dbModule = await import("../lib/db.js");
}

function getIndexSql(db: Database.Database, name: string): string | null {
  const row = db
    .prepare("SELECT sql FROM sqlite_master WHERE type = 'index' AND name = ?")
    .get(name) as { sql: string } | undefined;
  return row?.sql.replace(/\s+/g, " ").trim() ?? null;
}

function expectProductBatchLookupIndex(db: Database.Database): void {
  const indexes = db.prepare("PRAGMA index_list(product_batches)").all() as IndexListRow[];
  expect(indexes.map(({ name }) => name)).toContain(PRODUCT_BATCH_LOOKUP_INDEX);
  expect(getIndexSql(db, PRODUCT_BATCH_LOOKUP_INDEX)).toBe(PRODUCT_BATCH_LOOKUP_INDEX_SQL);
}

function createPreTaskOneSchema(): void {
  database!.exec(`
    CREATE TABLE schema_migrations (
      id INTEGER PRIMARY KEY,
      description TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );

    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      main_photo_id INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE product_batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      pricing_profile_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE product_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      file_id INTEGER,
      path TEXT,
      role TEXT NOT NULL DEFAULT 'gallery',
      caption TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const insertMigration = database!.prepare(
    "INSERT INTO schema_migrations (id, description, applied_at) VALUES (?, ?, ?)",
  );
  for (let id = 1; id <= 19; id += 1) {
    insertMigration.run(id, `migration-${id}`, new Date(Date.UTC(2026, 0, id)).toISOString());
  }
}

describe.sequential("saved pricing and image selection schema", () => {
  afterEach(() => {
    dbModule?.db.close();
    database?.close();
    cleanupSqliteFiles(dbPath);
    if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    delete process.env.BAMBU_DB;
    dbModule = null;
    database = null;
  });

  describe("fresh schema", () => {
    beforeEach(async () => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "product-foundation-fresh-"));
      dbPath = path.join(tempDir, "test.sqlite");
      await loadFreshDbModule();
    });

    it("creates saved pricing snapshots and image-selection columns with defaults", () => {
      const db = dbModule!.db;
      const productColumns = db.prepare("PRAGMA table_info(products)").all() as Array<{
        name: string;
      }>;
      const batchColumns = db.prepare("PRAGMA table_info(product_batches)").all() as Array<{
        name: string;
      }>;
      const photoColumns = db.prepare("PRAGMA table_info(product_photos)").all() as Array<{
        name: string;
      }>;
      const snapshotSql = db
        .prepare(
          "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'product_price_snapshots'",
        )
        .get() as { sql: string };
      const product = db
        .prepare(
          "SELECT sales_companion_visible, image_selection_mode, auto_source_photo_id FROM products LIMIT 1",
        )
        .get() as Row;
      const productForeignKeys = db.prepare("PRAGMA foreign_key_list(products)").all() as Array<{
        from: string;
        table: string;
        to: string;
        on_delete: string;
      }>;
      const indexes = db
        .prepare(
          "SELECT name FROM sqlite_master WHERE type = 'index' AND name IN (?, ?, ?) ORDER BY name",
        )
        .all(
          "idx_product_photos_candidate",
          "idx_product_price_snapshots_batch_created",
          "idx_products_sales_companion_visible",
        ) as Array<{ name: string }>;

      expect(productColumns.map(({ name }) => name)).toEqual(
        expect.arrayContaining([
          "sales_companion_visible",
          "image_selection_mode",
          "auto_source_photo_id",
        ]),
      );
      expect(batchColumns.map(({ name }) => name)).toEqual(
        expect.arrayContaining(["source_type", "extra_cost"]),
      );
      expect(photoColumns.map(({ name }) => name)).toEqual(
        expect.arrayContaining([
          "source_type",
          "source_ref",
          "candidate_key",
          "is_app_owned",
          "content_type",
          "width",
          "height",
        ]),
      );
      expect(snapshotSql.sql).toContain("UNIQUE (batch_id, channel)");
      expect(product).toMatchObject({
        sales_companion_visible: 0,
        image_selection_mode: "auto",
        auto_source_photo_id: null,
      });
      expect(productForeignKeys).toContainEqual(
        expect.objectContaining({
          from: "auto_source_photo_id",
          table: "product_photos",
          to: "id",
          on_delete: "SET NULL",
        }),
      );
      expect(indexes.map(({ name }) => name)).toEqual([
        "idx_product_photos_candidate",
        "idx_product_price_snapshots_batch_created",
        "idx_products_sales_companion_visible",
      ]);
      expectProductBatchLookupIndex(db);
    });

    it("enforces the current source photo foreign key and clears it when the photo is deleted", () => {
      const db = dbModule!.db;
      const productId = Number(
        db
          .prepare(
            "INSERT INTO products (name, slug) VALUES ('Pointer Product', 'pointer-product') RETURNING id",
          )
          .pluck()
          .get(),
      );
      const photoId = Number(
        db
          .prepare(
            "INSERT INTO product_photos (product_id, role, source_type) VALUES (?, 'gallery', 'source_hero') RETURNING id",
          )
          .pluck()
          .get(productId),
      );

      db.prepare("UPDATE products SET auto_source_photo_id = ? WHERE id = ?").run(
        photoId,
        productId,
      );
      expect(
        db.prepare("SELECT auto_source_photo_id FROM products WHERE id = ?").get(productId),
      ).toEqual({ auto_source_photo_id: photoId });
      db.prepare("DELETE FROM product_photos WHERE id = ?").run(photoId);
      expect(
        db.prepare("SELECT auto_source_photo_id FROM products WHERE id = ?").get(productId),
      ).toEqual({ auto_source_photo_id: null });
    });
  });

  describe("migrations 20 through 22", () => {
    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "product-foundation-migration-"));
      dbPath = path.join(tempDir, "test.sqlite");
      database = new Database(dbPath);
      database.pragma("foreign_keys = ON");
    });

    it("preserves existing main photos as manual and remains idempotent", () => {
      createPreTaskOneSchema();

      database!
        .prepare("INSERT INTO products (name, slug, main_photo_id) VALUES (?, ?, ?)")
        .run("Manual Photo Product", "manual-photo-product", 101);
      database!
        .prepare("INSERT INTO products (name, slug, main_photo_id) VALUES (?, ?, ?)")
        .run("Auto Product", "auto-product", null);
      database!
        .prepare("INSERT INTO product_batches (product_id, pricing_profile_id) VALUES (?, ?)")
        .run(1, "booth");
      database!
        .prepare("INSERT INTO product_photos (id, product_id, path) VALUES (?, ?, ?)")
        .run(101, 1, "/photos/manual-photo.jpg");

      runDatabaseMigrations(database!);
      runDatabaseMigrations(database!);

      expect(
        database!
          .prepare(
            `SELECT p.id,
                    p.main_photo_id,
                    p.sales_companion_visible,
                    p.image_selection_mode,
                    p.auto_source_photo_id,
                    pp.id AS photo_id,
                    pp.path AS photo_path
             FROM products p
             LEFT JOIN product_photos pp ON pp.id = p.main_photo_id
             ORDER BY p.id`,
          )
          .all(),
      ).toEqual([
        {
          id: 1,
          main_photo_id: 101,
          sales_companion_visible: 0,
          image_selection_mode: "manual",
          auto_source_photo_id: null,
          photo_id: 101,
          photo_path: "/photos/manual-photo.jpg",
        },
        {
          id: 2,
          main_photo_id: null,
          sales_companion_visible: 0,
          image_selection_mode: "auto",
          auto_source_photo_id: null,
          photo_id: null,
          photo_path: null,
        },
      ]);
      expect(
        database!.prepare("SELECT source_type, extra_cost FROM product_batches WHERE id = 1").get(),
      ).toEqual({ source_type: "planned", extra_cost: 0 });
      expect(
        database!
          .prepare(
            `SELECT source_type, source_ref, candidate_key, is_app_owned, content_type, width, height
             FROM product_photos WHERE id = 101`,
          )
          .get(),
      ).toEqual({
        source_type: "manual_upload",
        source_ref: null,
        candidate_key: null,
        is_app_owned: 0,
        content_type: null,
        width: null,
        height: null,
      });

      const snapshotSql = database!
        .prepare(
          "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'product_price_snapshots'",
        )
        .get() as { sql: string };
      expect(snapshotSql.sql).toContain("UNIQUE (batch_id, channel)");
      expect(
        database!
          .prepare(
            "SELECT id, COUNT(*) AS count FROM schema_migrations WHERE id IN (20, 21, 22) GROUP BY id",
          )
          .all(),
      ).toEqual([
        { id: 20, count: 1 },
        { id: 21, count: 1 },
        { id: 22, count: 1 },
      ]);
      expectProductBatchLookupIndex(database!);
      const foreignKey = database!
        .prepare("PRAGMA foreign_key_list(products)")
        .all()
        .find((row) => (row as Row)["from"] === "auto_source_photo_id") as Row;
      expect(foreignKey).toMatchObject({
        table: "product_photos",
        to: "id",
        on_delete: "SET NULL",
      });
    });
  });
});
