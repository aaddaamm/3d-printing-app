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

function createRequiredExistingTables(): void {
  database!.exec(`
    PRAGMA foreign_keys = ON;

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
      ]),
    );

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
