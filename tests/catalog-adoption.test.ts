import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type DbModule = typeof import("../lib/db.js");
type CatalogModule = typeof import("../models/catalog.js");
type ProductsModule = typeof import("../models/products.js");

let tempDir = "";
let dbPath = "";
let dbModule: DbModule | null = null;
let catalogModule: CatalogModule | null = null;
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
  catalogModule = await import("../models/catalog.js");
  productsModule = await import("../models/products.js");
}

function insertCatalogFile(reviewStatus = "inbox", scanStatus = "present"): number {
  const rootId = Number(
    dbModule!.db
      .prepare(
        `INSERT INTO scan_roots (name, root_path, normalized_root_path)
         VALUES ('Models', '/models', '/models')
         RETURNING id`,
      )
      .pluck()
      .get(),
  );
  return Number(
    dbModule!.db
      .prepare(
        `INSERT INTO catalog_files (
          root_id, path, normalized_path, filename, extension, content_hash, hash_algorithm,
          scan_status, review_status
        ) VALUES (?, '/models/dragon.3mf', '/models/dragon.3mf', 'dragon.3mf', '3mf', ?,
          'sha256', ?, ?)
        RETURNING id`,
      )
      .pluck()
      .get(rootId, "a".repeat(64), scanStatus, reviewStatus),
  );
}

function insertCandidateFiles(): { stlId: number; threeMfId: number } {
  const rootId = Number(
    dbModule!.db
      .prepare(
        `INSERT INTO scan_roots (name, root_path, normalized_root_path)
         VALUES ('Models', '/models', '/models') RETURNING id`,
      )
      .pluck()
      .get(),
  );
  const insert = dbModule!.db
    .prepare(
      `INSERT INTO catalog_files (
        root_id, path, normalized_path, filename, extension, content_hash, hash_algorithm,
        scan_status, review_status, size_bytes
      ) VALUES (?, ?, ?, ?, ?, ?, 'sha256', 'present', 'inbox', ?)
      RETURNING id`,
    )
    .pluck();
  const stlPath = "/models/Dragon/STL/dragon.stl";
  const threeMfPath = "/models/Dragon/3MF/dragon.3mf";
  return {
    stlId: Number(insert.get(rootId, stlPath, stlPath, "dragon.stl", "stl", "b".repeat(64), 100)),
    threeMfId: Number(
      insert.get(rootId, threeMfPath, threeMfPath, "dragon.3mf", "3mf", "c".repeat(64), 200),
    ),
  };
}

describe.sequential("catalog inbox adoption", () => {
  beforeEach(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "catalog-adoption-"));
    dbPath = path.join(tempDir, "test.sqlite");
    await loadFreshModules();
  });

  afterEach(() => {
    dbModule?.db.close();
    cleanupSqliteFiles(dbPath);
    if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    delete process.env.BAMBU_DB;
    dbModule = null;
    catalogModule = null;
    productsModule = null;
  });

  it("lists only present files awaiting inbox review", () => {
    const inboxId = insertCatalogFile();
    dbModule!.db
      .prepare(
        `INSERT INTO catalog_files (
          root_id, path, normalized_path, filename, scan_status, review_status
        ) VALUES (1, '/models/old.stl', '/models/old.stl', 'old.stl', 'present', 'indexed')`,
      )
      .run();

    expect(catalogModule!.listCatalogInboxFiles()).toEqual([
      expect.objectContaining({ id: inboxId, review_status: "inbox" }),
    ]);
  });

  it("adopts an inbox file into an existing product without moving it", () => {
    const fileId = insertCatalogFile();
    const product = productsModule!.createProduct({ name: "Dragon", status_id: "idea" });

    const adoption = catalogModule!.adoptCatalogFile(fileId, { productId: product.id });

    expect(adoption).toMatchObject({
      product_id: product.id,
      product_name: "Dragon",
      file: {
        id: fileId,
        review_status: "referenced",
        storage_mode: "referenced",
        linked_product_id: product.id,
      },
    });
    expect(
      dbModule!.db.prepare("SELECT path FROM catalog_files WHERE id = ?").pluck().get(fileId),
    ).toBe("/models/dragon.3mf");
    expect(
      dbModule!.db
        .prepare("SELECT main_file_id FROM products WHERE id = ?")
        .pluck()
        .get(product.id),
    ).toBe(adoption.product_file_id);
  });

  it("creates a product while adopting an inbox file", () => {
    const fileId = insertCatalogFile();

    const adoption = catalogModule!.adoptCatalogFile(fileId, { productName: "New Dragon" });

    expect(adoption.product_name).toBe("New Dragon");
    expect(productsModule!.listProducts()).toContainEqual(
      expect.objectContaining({
        id: adoption.product_id,
        name: "New Dragon",
        status_id: "downloaded_designed",
      }),
    );
  });

  it("ignores a file and can return it to the inbox", () => {
    const fileId = insertCatalogFile();

    expect(catalogModule!.ignoreCatalogFile(fileId).review_status).toBe("ignored");
    expect(catalogModule!.listCatalogInboxFiles()).toEqual([]);
    expect(catalogModule!.returnCatalogFileToInbox(fileId).review_status).toBe("inbox");
    expect(catalogModule!.listCatalogInboxFiles()).toHaveLength(1);
  });

  it("rejects invalid review-state transitions", () => {
    const fileId = insertCatalogFile();

    catalogModule!.ignoreCatalogFile(fileId);
    expect(() => catalogModule!.ignoreCatalogFile(fileId)).toThrow(
      "Only inbox files can be ignored",
    );
    catalogModule!.returnCatalogFileToInbox(fileId);
    expect(() => catalogModule!.returnCatalogFileToInbox(fileId)).toThrow(
      "Only ignored files can be returned to the inbox",
    );
  });

  it("does not allow product-linked files back into triage states", () => {
    const fileId = insertCatalogFile();
    const product = productsModule!.createProduct({ name: "Dragon", status_id: "idea" });
    catalogModule!.adoptCatalogFile(fileId, { productId: product.id });

    expect(() => catalogModule!.ignoreCatalogFile(fileId)).toThrow(
      "Only inbox files can be ignored",
    );

    dbModule!.db
      .prepare("UPDATE catalog_files SET review_status = 'ignored' WHERE id = ?")
      .run(fileId);
    expect(() => catalogModule!.returnCatalogFileToInbox(fileId)).toThrow(
      "Linked catalog files cannot be returned to the inbox",
    );
  });

  it("groups a package candidate and adopts all files transactionally", () => {
    const { stlId, threeMfId } = insertCandidateFiles();
    const [candidate] = catalogModule!.listCatalogInboxCandidates();
    const product = productsModule!.createProduct({ name: "Dragon", status_id: "idea" });

    expect(candidate).toMatchObject({
      name: "Dragon",
      folder: "/models/Dragon",
      primary_file_id: threeMfId,
      total_size_bytes: 300,
    });

    const adoption = catalogModule!.adoptCatalogCandidate({
      fileIds: [stlId, threeMfId],
      primaryFileId: threeMfId,
      productId: product.id,
    });

    expect(adoption).toMatchObject({
      product_id: product.id,
      product_name: "Dragon",
      files: expect.arrayContaining([
        expect.objectContaining({ id: stlId, review_status: "referenced" }),
        expect.objectContaining({ id: threeMfId, review_status: "referenced" }),
      ]),
    });
    expect(
      dbModule!.db
        .prepare("SELECT COUNT(*) FROM product_files WHERE product_id = ?")
        .pluck()
        .get(product.id),
    ).toBe(2);
    expect(
      dbModule!.db
        .prepare(
          `SELECT pf.file_id
           FROM products p JOIN product_files pf ON pf.id = p.main_file_id
           WHERE p.id = ?`,
        )
        .pluck()
        .get(product.id),
    ).toBe(threeMfId);
  });

  it("rejects files from unrelated candidates before creating a product", () => {
    const rootId = Number(
      dbModule!.db
        .prepare(
          `INSERT INTO scan_roots (name, root_path, normalized_root_path)
           VALUES ('Models', '/models', '/models') RETURNING id`,
        )
        .pluck()
        .get(),
    );
    const insert = dbModule!.db
      .prepare(
        `INSERT INTO catalog_files (
          root_id, path, normalized_path, filename, extension, scan_status, review_status
        ) VALUES (?, ?, ?, ?, 'stl', 'present', 'inbox') RETURNING id`,
      )
      .pluck();
    const firstId = Number(insert.get(rootId, "/models/A/a.stl", "/models/A/a.stl", "a.stl"));
    const secondId = Number(insert.get(rootId, "/models/B/b.stl", "/models/B/b.stl", "b.stl"));

    expect(() =>
      catalogModule!.adoptCatalogCandidate({
        fileIds: [firstId, secondId],
        primaryFileId: firstId,
        productName: "Invalid Bundle",
      }),
    ).toThrow("fileIds must belong to one current inbox candidate");
    expect(productsModule!.listProducts()).not.toContainEqual(
      expect.objectContaining({ name: "Invalid Bundle" }),
    );
  });
});
