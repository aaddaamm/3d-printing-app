import Database from "better-sqlite3";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  addScanRoot,
  createCatalogStatements,
  deactivateScanRoot,
  listScanRoots,
} from "../lib/catalog-scanner.js";

let database: Database.Database;
let tempDir = "";

function createCatalogRootSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE scan_roots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      root_path TEXT NOT NULL,
      normalized_root_path TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      last_scanned_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(normalized_root_path)
    );

    CREATE INDEX idx_scan_roots_active ON scan_roots(is_active);
  `);
}

describe("catalog scan roots", () => {
  beforeEach(() => {
    database = new Database(":memory:");
    database.pragma("foreign_keys = ON");
    createCatalogRootSchema(database);
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "catalog-roots-"));
  });

  afterEach(() => {
    database.close();
    if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("adds a scan root with normalized path, timestamps, and active status", () => {
    const statements = createCatalogStatements(database);
    const rootPath = path.join(tempDir, "Models");
    fs.mkdirSync(rootPath);

    const root = addScanRoot(statements, { name: "Models", rootPath });

    expect(root.id).toBeGreaterThan(0);
    expect(root.name).toBe("Models");
    expect(root.root_path).toBe(path.resolve(rootPath));
    expect(root.normalized_root_path).toBe(path.resolve(rootPath).toLowerCase());
    expect(root.is_active).toBe(1);
    expect(root.last_scanned_at).toBeNull();
    expect(root.created_at).toEqual(expect.any(String));
    expect(root.updated_at).toEqual(expect.any(String));
  });

  it("rejects duplicate normalized scan roots", () => {
    const statements = createCatalogStatements(database);
    const rootPath = path.join(tempDir, "Models");
    fs.mkdirSync(rootPath);

    addScanRoot(statements, { name: "Models", rootPath });

    expect(() => addScanRoot(statements, { name: "Duplicate", rootPath })).toThrow(
      /scan root already exists/i,
    );
    expect(listScanRoots(statements)).toHaveLength(1);
  });

  it("lists scan roots in stable id order including inactive roots", () => {
    const statements = createCatalogStatements(database);
    const firstPath = path.join(tempDir, "First");
    const secondPath = path.join(tempDir, "Second");
    fs.mkdirSync(firstPath);
    fs.mkdirSync(secondPath);

    const first = addScanRoot(statements, { name: "First", rootPath: firstPath });
    const second = addScanRoot(statements, { name: "Second", rootPath: secondPath });
    deactivateScanRoot(statements, first.id);

    expect(listScanRoots(statements).map((root) => [root.id, root.name, root.is_active])).toEqual([
      [first.id, "First", 0],
      [second.id, "Second", 1],
    ]);
  });

  it("deactivates a scan root instead of deleting it", () => {
    const statements = createCatalogStatements(database);
    const rootPath = path.join(tempDir, "Models");
    fs.mkdirSync(rootPath);
    const root = addScanRoot(statements, { name: "Models", rootPath });

    const deactivated = deactivateScanRoot(statements, root.id);

    expect(deactivated.is_active).toBe(0);
    expect(deactivated.id).toBe(root.id);
    expect(listScanRoots(statements)).toHaveLength(1);
  });
});
