import Database from "better-sqlite3";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  addScanRoot,
  createCatalogStatements,
  deactivateScanRoot,
  discoverCatalogFiles,
  fileNeedsContentHash,
  hashFileContent,
  isSupportedCatalogFilePath,
  listScanRoots,
  scanCatalogRoot,
  shouldSkipCatalogDirectory,
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

    CREATE TABLE managed_blobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_hash TEXT NOT NULL,
      hash_algorithm TEXT NOT NULL,
      storage_path TEXT NOT NULL,
      normalized_storage_path TEXT NOT NULL,
      size_bytes INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_verified_at TEXT,
      UNIQUE(content_hash, hash_algorithm),
      UNIQUE(normalized_storage_path)
    );

    CREATE TABLE catalog_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      root_id INTEGER REFERENCES scan_roots(id),
      path TEXT NOT NULL,
      normalized_path TEXT NOT NULL,
      filename TEXT NOT NULL,
      extension TEXT,
      size_bytes INTEGER,
      modified_at TEXT,
      created_at_fs TEXT,
      quick_hash TEXT,
      content_hash TEXT,
      hash_algorithm TEXT,
      storage_role TEXT NOT NULL DEFAULT 'source',
      managed_blob_id INTEGER REFERENCES managed_blobs(id),
      original_source_path TEXT,
      original_source_root_id INTEGER REFERENCES scan_roots(id),
      scan_status TEXT NOT NULL DEFAULT 'present',
      missing_since TEXT,
      metadata_json TEXT,
      first_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(normalized_path)
    );

    CREATE TABLE file_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_id INTEGER NOT NULL REFERENCES catalog_files(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      old_path TEXT,
      new_path TEXT,
      old_root_id INTEGER REFERENCES scan_roots(id),
      new_root_id INTEGER REFERENCES scan_roots(id),
      content_hash TEXT,
      details_json TEXT,
      detected_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
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

describe("catalog file discovery", () => {
  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "catalog-files-"));
  });

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("recognizes supported 3D/source/G-code extensions case-insensitively", () => {
    for (const filename of [
      "part.3MF",
      "part.stl",
      "part.STEP",
      "part.stp",
      "part.obj",
      "part.f3d",
      "part.blend",
      "part.gcode",
    ]) {
      expect(isSupportedCatalogFilePath(filename)).toBe(true);
    }

    for (const filename of ["archive.zip", "archive.rar", "archive.7z", "notes.txt"]) {
      expect(isSupportedCatalogFilePath(filename)).toBe(false);
    }
  });

  it("skips common noisy/system directories", () => {
    expect(shouldSkipCatalogDirectory(".git")).toBe(true);
    expect(shouldSkipCatalogDirectory("node_modules")).toBe(true);
    expect(shouldSkipCatalogDirectory("__MACOSX")).toBe(true);
    expect(shouldSkipCatalogDirectory("models")).toBe(false);
  });

  it("discovers supported files recursively with metadata and skips unsupported files", () => {
    const nestedDir = path.join(tempDir, "Nested");
    const ignoredDir = path.join(tempDir, "node_modules");
    fs.mkdirSync(nestedDir);
    fs.mkdirSync(ignoredDir);
    const modelPath = path.join(tempDir, "Dragon.STL");
    const gcodePath = path.join(nestedDir, "plate.gcode");
    fs.writeFileSync(modelPath, "solid dragon");
    fs.writeFileSync(gcodePath, "G1 X0 Y0");
    fs.writeFileSync(path.join(tempDir, "archive.zip"), "ignored");
    fs.writeFileSync(path.join(ignoredDir, "ignored.stl"), "ignored");

    const files = discoverCatalogFiles(tempDir);

    expect(files.map((file) => file.filename).sort()).toEqual(["Dragon.STL", "plate.gcode"]);
    expect(files.find((file) => file.filename === "Dragon.STL")).toMatchObject({
      path: modelPath,
      normalizedPath: modelPath.toLowerCase(),
      filename: "Dragon.STL",
      extension: "stl",
      sizeBytes: Buffer.byteLength("solid dragon"),
    });
    expect(files.every((file) => typeof file.modifiedAt === "string")).toBe(true);
  });

  it("hashes file content with stable SHA-256", async () => {
    const filePath = path.join(tempDir, "part.stl");
    fs.writeFileSync(filePath, "abc");

    await expect(hashFileContent(filePath)).resolves.toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  it("requires content hashing only for new or changed files", () => {
    const discovered = {
      sizeBytes: 12,
      modifiedAt: "2026-07-06T00:00:00.000Z",
    };

    expect(fileNeedsContentHash(null, discovered)).toBe(true);
    expect(
      fileNeedsContentHash(
        { size_bytes: 12, modified_at: "2026-07-06T00:00:00.000Z", content_hash: "hash" },
        discovered,
      ),
    ).toBe(false);
    expect(
      fileNeedsContentHash(
        { size_bytes: 13, modified_at: "2026-07-06T00:00:00.000Z", content_hash: "hash" },
        discovered,
      ),
    ).toBe(true);
    expect(
      fileNeedsContentHash(
        { size_bytes: 12, modified_at: "2026-07-07T00:00:00.000Z", content_hash: "hash" },
        discovered,
      ),
    ).toBe(true);
    expect(
      fileNeedsContentHash(
        { size_bytes: 12, modified_at: "2026-07-06T00:00:00.000Z", content_hash: null },
        discovered,
      ),
    ).toBe(true);
  });
});

describe("catalog scan execution", () => {
  beforeEach(() => {
    database = new Database(":memory:");
    database.pragma("foreign_keys = ON");
    createCatalogRootSchema(database);
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "catalog-scan-"));
  });

  afterEach(() => {
    database.close();
    if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
  });

  function historyEvents(): string[] {
    return database
      .prepare("SELECT event_type FROM file_history ORDER BY id")
      .all()
      .map((row) => (row as { event_type: string }).event_type);
  }

  it("indexes new files and records discovered history", async () => {
    const statements = createCatalogStatements(database);
    const filePath = path.join(tempDir, "dragon.stl");
    fs.writeFileSync(filePath, "dragon");
    const root = addScanRoot(statements, { name: "Models", rootPath: tempDir });

    const summary = await scanCatalogRoot(statements, root);

    expect(summary).toMatchObject({
      scanned: 1,
      added: 1,
      changed: 0,
      unchanged: 0,
      missing: 0,
      restored: 0,
      skipped: 0,
      failed: 0,
    });
    expect(
      database.prepare("SELECT filename, extension, scan_status FROM catalog_files").all(),
    ).toEqual([{ filename: "dragon.stl", extension: "stl", scan_status: "present" }]);
    expect(historyEvents()).toEqual(["discovered"]);
  });

  it("does not duplicate rows or history on unchanged scans", async () => {
    const statements = createCatalogStatements(database);
    fs.writeFileSync(path.join(tempDir, "dragon.stl"), "dragon");
    const root = addScanRoot(statements, { name: "Models", rootPath: tempDir });

    await scanCatalogRoot(statements, root);
    const summary = await scanCatalogRoot(statements, root);

    expect(summary).toMatchObject({ added: 0, changed: 0, unchanged: 1, missing: 0, restored: 0 });
    expect(database.prepare("SELECT COUNT(*) AS n FROM catalog_files").get()).toEqual({ n: 1 });
    expect(historyEvents()).toEqual(["discovered"]);
  });

  it("updates changed files and records changed history", async () => {
    const statements = createCatalogStatements(database);
    const filePath = path.join(tempDir, "dragon.stl");
    fs.writeFileSync(filePath, "dragon");
    const root = addScanRoot(statements, { name: "Models", rootPath: tempDir });
    await scanCatalogRoot(statements, root);

    fs.writeFileSync(filePath, "dragon v2");
    fs.utimesSync(filePath, new Date("2026-07-06T00:00:00.000Z"), new Date("2026-07-06T00:00:00.000Z"));
    const summary = await scanCatalogRoot(statements, root);

    expect(summary).toMatchObject({ added: 0, changed: 1, unchanged: 0, missing: 0 });
    expect(database.prepare("SELECT size_bytes, scan_status FROM catalog_files").get()).toEqual({
      size_bytes: Buffer.byteLength("dragon v2"),
      scan_status: "present",
    });
    expect(historyEvents()).toEqual(["discovered", "changed"]);
  });

  it("marks missing files without deleting rows and restores them when seen again", async () => {
    const statements = createCatalogStatements(database);
    const filePath = path.join(tempDir, "dragon.stl");
    fs.writeFileSync(filePath, "dragon");
    const root = addScanRoot(statements, { name: "Models", rootPath: tempDir });
    await scanCatalogRoot(statements, root);

    fs.rmSync(filePath);
    const missingSummary = await scanCatalogRoot(statements, root);

    expect(missingSummary).toMatchObject({ added: 0, missing: 1, restored: 0 });
    expect(database.prepare("SELECT scan_status FROM catalog_files").get()).toEqual({
      scan_status: "missing",
    });

    fs.writeFileSync(filePath, "dragon");
    const restoredSummary = await scanCatalogRoot(statements, root);

    expect(restoredSummary).toMatchObject({ added: 0, missing: 0, restored: 1 });
    expect(database.prepare("SELECT scan_status FROM catalog_files").get()).toEqual({
      scan_status: "present",
    });
    expect(historyEvents()).toEqual(["discovered", "missing", "restored"]);
  });
});
