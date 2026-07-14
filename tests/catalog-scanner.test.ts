import Database from "better-sqlite3";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addScanRoot,
  createCatalogStatements,
  deactivateScanRoot,
  discoverCatalogFiles,
  fileNeedsContentHash,
  hashFileContent,
  isSupportedCatalogFilePath,
  listScanRoots,
  normalizeCatalogPath,
  scanCatalogRoot,
  shouldSkipCatalogDirectory,
} from "../lib/catalog-scanner.js";

let database: Database.Database;
let tempDir = "";

const TEST_PNG_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function parseJsonObject(value: string | null): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as unknown;
    if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}

function zip(entries: { name: string; content: Buffer; deflate?: boolean }[]): Buffer {
  const chunks: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const name = Buffer.from(entry.name);
    const compressed = entry.deflate ? zlib.deflateRawSync(entry.content) : entry.content;
    const method = entry.deflate ? 8 : 0;
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(method, 8);
    local.writeUInt32LE(crc32(entry.content), 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(entry.content.length, 22);
    local.writeUInt16LE(name.length, 26);
    chunks.push(local, name, compressed);

    const header = Buffer.alloc(46);
    header.writeUInt32LE(0x02014b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(20, 6);
    header.writeUInt16LE(method, 10);
    header.writeUInt32LE(crc32(entry.content), 16);
    header.writeUInt32LE(compressed.length, 20);
    header.writeUInt32LE(entry.content.length, 24);
    header.writeUInt16LE(name.length, 28);
    header.writeUInt32LE(offset, 42);
    central.push(header, name);
    offset += local.length + name.length + compressed.length;
  }

  const centralBuffer = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBuffer.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...chunks, centralBuffer, end]);
}

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
      review_status TEXT NOT NULL DEFAULT 'indexed',
      reviewed_at TEXT,
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
    expect(root.normalized_root_path).toBe(path.resolve(rootPath));
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

  it("rejects scan roots that do not exist or are not directories", () => {
    const statements = createCatalogStatements(database);
    const missingPath = path.join(tempDir, "missing");
    const filePath = path.join(tempDir, "file.stl");
    fs.writeFileSync(filePath, "not a directory");

    expect(() => addScanRoot(statements, { name: "Missing", rootPath: missingPath })).toThrow(
      /not a directory/i,
    );
    expect(() => addScanRoot(statements, { name: "File", rootPath: filePath })).toThrow(
      /not a directory/i,
    );
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
      normalizedPath: modelPath,
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
      database
        .prepare("SELECT filename, extension, scan_status, review_status FROM catalog_files")
        .all(),
    ).toEqual([
      {
        filename: "dragon.stl",
        extension: "stl",
        scan_status: "present",
        review_status: "inbox",
      },
    ]);
    expect(historyEvents()).toEqual(["discovered"]);
  });

  it("stores preview metadata for 3MF files with embedded thumbnails", async () => {
    const statements = createCatalogStatements(database);
    const filePath = path.join(tempDir, "dragon.3mf");
    fs.writeFileSync(
      filePath,
      zip([
        { name: "3D/3dmodel.model", content: Buffer.from("model") },
        { name: "Metadata/plate_1.png", content: TEST_PNG_BYTES, deflate: true },
      ]),
    );
    const root = addScanRoot(statements, { name: "Models", rootPath: tempDir });

    const summary = await scanCatalogRoot(statements, root);
    const row = database
      .prepare("SELECT metadata_json FROM catalog_files WHERE filename = 'dragon.3mf'")
      .get() as { metadata_json: string | null };

    expect(summary).toMatchObject({ scanned: 1, added: 1, failed: 0 });
    expect(parseJsonObject(row.metadata_json)).toEqual({
      preview: {
        contentType: "image/png",
        hash: expect.stringMatching(/^[a-f0-9]{64}$/),
      },
    });
  });

  it("clears stale preview metadata when a changed 3MF has no embedded preview", async () => {
    const statements = createCatalogStatements(database);
    const filePath = path.join(tempDir, "dragon.3mf");
    fs.writeFileSync(
      filePath,
      zip([
        { name: "3D/3dmodel.model", content: Buffer.from("model") },
        { name: "Metadata/plate_1.png", content: TEST_PNG_BYTES, deflate: true },
      ]),
    );
    const root = addScanRoot(statements, { name: "Models", rootPath: tempDir });
    await scanCatalogRoot(statements, root);

    fs.writeFileSync(
      filePath,
      zip([{ name: "3D/3dmodel.model", content: Buffer.from("model without preview") }]),
    );
    fs.utimesSync(
      filePath,
      new Date("2026-07-07T00:00:00.000Z"),
      new Date("2026-07-07T00:00:00.000Z"),
    );

    const summary = await scanCatalogRoot(statements, root);
    const row = database
      .prepare("SELECT metadata_json FROM catalog_files WHERE filename = 'dragon.3mf'")
      .get() as { metadata_json: string | null };

    expect(summary).toMatchObject({ scanned: 1, added: 0, changed: 1, failed: 0 });
    expect(row.metadata_json).toBeNull();
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
    fs.utimesSync(
      filePath,
      new Date("2026-07-06T00:00:00.000Z"),
      new Date("2026-07-06T00:00:00.000Z"),
    );
    const summary = await scanCatalogRoot(statements, root);

    expect(summary).toMatchObject({ added: 0, changed: 1, unchanged: 0, missing: 0 });
    expect(database.prepare("SELECT size_bytes, scan_status FROM catalog_files").get()).toEqual({
      size_bytes: Buffer.byteLength("dragon v2"),
      scan_status: "present",
    });
    expect(historyEvents()).toEqual(["discovered", "changed"]);
  });

  it("counts unsupported files and skipped directories", async () => {
    const statements = createCatalogStatements(database);
    fs.writeFileSync(path.join(tempDir, "dragon.stl"), "dragon");
    fs.writeFileSync(path.join(tempDir, "notes.txt"), "ignore me");
    fs.writeFileSync(path.join(tempDir, "archive.zip"), "ignored archive");
    const ignoredDir = path.join(tempDir, "node_modules");
    fs.mkdirSync(ignoredDir);
    fs.writeFileSync(path.join(ignoredDir, "ignored.stl"), "ignored");
    const root = addScanRoot(statements, { name: "Models", rootPath: tempDir });

    const summary = await scanCatalogRoot(statements, root);

    expect(summary).toMatchObject({ scanned: 1, added: 1, skipped: 3, failed: 0 });
  });

  it("continues scanning when file metadata disappears during discovery", async () => {
    const statements = createCatalogStatements(database);
    const badPath = path.join(tempDir, "bad.stl");
    const goodPath = path.join(tempDir, "good.stl");
    fs.writeFileSync(badPath, "bad");
    fs.writeFileSync(goodPath, "good");
    const root = addScanRoot(statements, { name: "Models", rootPath: tempDir });
    const originalStatSync = fs.statSync;
    const statSpy = vi.spyOn(fs, "statSync").mockImplementation((targetPath, options) => {
      if (targetPath === badPath) throw new Error("simulated stat failure");
      return originalStatSync(targetPath, options as fs.StatSyncOptions);
    });

    try {
      const summary = await scanCatalogRoot(statements, root);

      expect(summary).toMatchObject({ scanned: 1, added: 1, failed: 1 });
      expect(database.prepare("SELECT filename FROM catalog_files").all()).toEqual([
        { filename: "good.stl" },
      ]);
    } finally {
      statSpy.mockRestore();
    }
  });

  it("continues scanning when hashing one file fails", async () => {
    const statements = createCatalogStatements(database);
    const badPath = path.join(tempDir, "bad.stl");
    const goodPath = path.join(tempDir, "good.stl");
    fs.writeFileSync(badPath, "bad");
    fs.writeFileSync(goodPath, "good");
    const root = addScanRoot(statements, { name: "Models", rootPath: tempDir });

    const summary = await scanCatalogRoot(statements, root, {
      hashFile: async (filePath) => {
        if (filePath === badPath) throw new Error("simulated hash failure");
        return hashFileContent(filePath);
      },
    });

    expect(summary).toMatchObject({ scanned: 2, added: 1, failed: 1 });
    expect(database.prepare("SELECT filename FROM catalog_files").all()).toEqual([
      { filename: "good.stl" },
    ]);
    expect(historyEvents()).toEqual(["discovered"]);
  });

  it("preserves path case when normalizing paths", () => {
    const mixedCasePath = path.join(tempDir, "Nested", "Part.STL");

    expect(normalizeCatalogPath(mixedCasePath)).toBe(path.resolve(mixedCasePath));
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
