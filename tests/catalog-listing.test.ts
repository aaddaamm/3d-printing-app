import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type DbModule = typeof import("../lib/db.js");
type CatalogModule = typeof import("../models/catalog.js");

let tempDir = "";
let dbPath = "";
let dbModule: DbModule | null = null;
let catalogModule: CatalogModule | null = null;
let rootId = 0;

function cleanupSqliteFiles(basePath: string): void {
  for (const suffix of ["", "-wal", "-shm"]) {
    const target = `${basePath}${suffix}`;
    if (fs.existsSync(target)) fs.rmSync(target, { force: true });
  }
}

function insertFile(
  filename: string,
  options: {
    folder?: string;
    scanStatus?: "present" | "missing";
    reviewStatus?: "indexed" | "inbox" | "referenced" | "ignored";
    updatedAt?: string;
  } = {},
): void {
  const folder = options.folder ?? "/models";
  const filePath = `${folder}/${filename}`;
  dbModule!.db
    .prepare(
      `INSERT INTO catalog_files (
        root_id, path, normalized_path, filename, extension, scan_status, review_status, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      rootId,
      filePath,
      filePath,
      filename,
      path.extname(filename).slice(1),
      options.scanStatus ?? "present",
      options.reviewStatus ?? "indexed",
      options.updatedAt ?? "2026-07-14T00:00:00.000Z",
    );
}

describe.sequential("catalog file listing", () => {
  beforeEach(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "catalog-listing-"));
    dbPath = path.join(tempDir, "test.sqlite");
    vi.resetModules();
    process.env.BAMBU_DB = dbPath;
    dbModule = await import("../lib/db.js");
    catalogModule = await import("../models/catalog.js");
    rootId = Number(
      dbModule.db
        .prepare(
          `INSERT INTO scan_roots (name, root_path, normalized_root_path)
           VALUES ('Models', '/models', '/models')
           RETURNING id`,
        )
        .pluck()
        .get(),
    );
  });

  afterEach(() => {
    dbModule?.db.close();
    cleanupSqliteFiles(dbPath);
    if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    delete process.env.BAMBU_DB;
    dbModule = null;
    catalogModule = null;
  });

  it("returns bounded pages in stable newest-first order", () => {
    for (let index = 1; index <= 5; index++) {
      insertFile(`part-${index}.stl`, {
        updatedAt: `2026-07-14T00:00:0${index}.000Z`,
      });
    }

    const result = catalogModule!.listCatalogFiles({ page: 2, pageSize: 2 });

    expect(result).toMatchObject({ page: 2, pageSize: 2, total: 5, totalPages: 3 });
    expect(result.files.map((file) => file.filename)).toEqual(["part-3.stl", "part-2.stl"]);
  });

  it("filters by literal search text, scan state, and review state", () => {
    insertFile("dragon.3mf", { reviewStatus: "inbox" });
    insertFile("dragon-old.stl", { scanStatus: "missing", reviewStatus: "indexed" });
    insertFile("gear.stl", { folder: "/archive", reviewStatus: "referenced" });
    insertFile("100%gear.stl", { reviewStatus: "indexed" });

    const filtered = catalogModule!.listCatalogFiles({
      query: "dragon",
      scanStatus: "present",
      reviewStatus: "inbox",
    });
    const literalWildcard = catalogModule!.listCatalogFiles({ query: "%" });
    const folderSearch = catalogModule!.listCatalogFiles({ query: "archive" });

    expect(filtered.files.map((file) => file.filename)).toEqual(["dragon.3mf"]);
    expect(filtered.total).toBe(1);
    expect(literalWildcard.files.map((file) => file.filename)).toEqual(["100%gear.stl"]);
    expect(folderSearch.files.map((file) => file.filename)).toEqual(["gear.stl"]);
  });

  it("clamps pages beyond the final result page", () => {
    insertFile("one.stl");
    insertFile("two.stl");
    insertFile("three.stl");

    const result = catalogModule!.listCatalogFiles({ page: 99, pageSize: 2 });

    expect(result).toMatchObject({ page: 2, total: 3, totalPages: 2 });
    expect(result.files).toHaveLength(1);
  });
});
