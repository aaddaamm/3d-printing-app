# Catalog Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the schema-only Catalog Foundation for products, assets, scanned files, file history, optional managed blobs, and project/product bridging without changing existing runtime behavior.

**Architecture:** This is a bridge-first, index-first SQLite foundation. Existing print-history tables (`print_tasks`, `jobs`, `projects`) remain unchanged; new catalog tables live alongside them and connect through `project_products`.

**Tech Stack:** TypeScript, better-sqlite3, Vitest, existing migration helpers in `lib/migrations.ts`, current schema bootstrap in `lib/db.ts`.

## Global Constraints

- Do not implement the full filesystem scanner in this plan.
- Do not implement thumbnail extraction in this plan.
- Do not implement Product Catalog UI in this plan.
- Do not automatically create products from existing projects.
- Do not change pricing behavior.
- Do not migrate or rename existing `projects` into `products`.
- Do not automatically bulk-copy source files into managed storage.
- Create `managed_blobs` before `catalog_files` because `catalog_files.managed_blob_id` references it.
- Use `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS`.
- Add matching base schema statements in `lib/db.ts` so fresh databases and migrated databases agree.
- Run `npm run typecheck`, `npm run lint`, and `npm test` before completion.

---

## File Structure

- Modify `lib/db/migrations-list.ts`
  - Add migration `13`, `add catalog foundation tables`.
  - Migration creates `scan_roots`, `managed_blobs`, `catalog_files`, `products`, `assets`, `asset_files`, `project_products`, and `file_history`.
  - Migration creates all planned indexes.

- Modify `lib/db.ts`
  - Add the same base schema `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS` statements for fresh databases.
  - Keep existing schema order valid for foreign keys.

- Modify `lib/types.ts`
  - Add row interfaces: `ScanRoot`, `ManagedBlob`, `CatalogFile`, `Product`, `Asset`, `AssetFile`, `ProjectProduct`, `FileHistory`.

- Create `tests/catalog-schema.test.ts`
  - Use a real temp SQLite database.
  - Import `runDatabaseMigrations` from `lib/db/migrations-list.ts`.
  - Test idempotency, table creation, indexes, uniqueness constraints, and cascade behavior.

---

### Task 1: Add failing catalog schema migration tests

**Files:**

- Create: `tests/catalog-schema.test.ts`

**Interfaces:**

- Consumes: `runDatabaseMigrations(database: Database.Database): void` from `lib/db/migrations-list.ts`.
- Produces: failing tests that define the required catalog schema behavior.

- [ ] **Step 1: Create the failing test file**

Write `tests/catalog-schema.test.ts` with this content:

```ts
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
```

- [ ] **Step 2: Run the new test to verify it fails**

Run:

```bash
npm test -- tests/catalog-schema.test.ts
```

Expected: FAIL because the catalog tables and indexes do not exist yet.

- [ ] **Step 3: Commit the failing test**

```bash
git add tests/catalog-schema.test.ts
git commit -m "test: define catalog foundation schema"
```

---

### Task 2: Add catalog foundation migration

**Files:**

- Modify: `lib/db/migrations-list.ts`
- Test: `tests/catalog-schema.test.ts`

**Interfaces:**

- Consumes: failing tests from Task 1.
- Produces: migration `13` in `DB_MIGRATIONS` that creates all catalog foundation tables and indexes.

- [ ] **Step 1: Add migration 13**

In `lib/db/migrations-list.ts`, add this migration object after migration `12` and before the closing `];` of `DB_MIGRATIONS`:

```ts
  {
    id: 13,
    description: "add catalog foundation tables",
    up(database) {
      database.exec(`CREATE TABLE IF NOT EXISTS scan_roots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        root_path TEXT NOT NULL,
        normalized_root_path TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        last_scanned_at TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(normalized_root_path)
      )`);
      database.exec("CREATE INDEX IF NOT EXISTS idx_scan_roots_active ON scan_roots(is_active)");

      database.exec(`CREATE TABLE IF NOT EXISTS managed_blobs (
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
      )`);
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_managed_blobs_hash ON managed_blobs(content_hash, hash_algorithm)",
      );

      database.exec(`CREATE TABLE IF NOT EXISTS catalog_files (
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
      )`);
      database.exec("CREATE INDEX IF NOT EXISTS idx_catalog_files_root ON catalog_files(root_id)");
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_catalog_files_content_hash ON catalog_files(content_hash)",
      );
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_catalog_files_extension ON catalog_files(extension)",
      );
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_catalog_files_scan_status ON catalog_files(scan_status)",
      );
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_catalog_files_storage_role ON catalog_files(storage_role)",
      );
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_catalog_files_managed_blob ON catalog_files(managed_blob_id)",
      );
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_catalog_files_filename ON catalog_files(filename COLLATE NOCASE)",
      );

      database.exec(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'needs_review',
        designer TEXT,
        marketplace TEXT,
        source_url TEXT,
        license_summary TEXT,
        metadata_json TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);
      database.exec("CREATE INDEX IF NOT EXISTS idx_products_status ON products(status)");
      database.exec("CREATE INDEX IF NOT EXISTS idx_products_designer ON products(designer)");
      database.exec("CREATE INDEX IF NOT EXISTS idx_products_marketplace ON products(marketplace)");
      database.exec("CREATE INDEX IF NOT EXISTS idx_products_name ON products(name COLLATE NOCASE)");

      database.exec(`CREATE TABLE IF NOT EXISTS assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        asset_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        role TEXT,
        metadata_json TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);
      database.exec("CREATE INDEX IF NOT EXISTS idx_assets_product ON assets(product_id)");
      database.exec("CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(asset_type)");

      database.exec(`CREATE TABLE IF NOT EXISTS asset_files (
        asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
        file_id INTEGER NOT NULL REFERENCES catalog_files(id) ON DELETE CASCADE,
        role TEXT NOT NULL DEFAULT 'primary',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (asset_id, file_id, role)
      )`);
      database.exec("CREATE INDEX IF NOT EXISTS idx_asset_files_file ON asset_files(file_id)");

      database.exec(`CREATE TABLE IF NOT EXISTS project_products (
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        relationship TEXT NOT NULL DEFAULT 'primary',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (project_id, product_id)
      )`);
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_project_products_product ON project_products(product_id)",
      );

      database.exec(`CREATE TABLE IF NOT EXISTS file_history (
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
      )`);
      database.exec("CREATE INDEX IF NOT EXISTS idx_file_history_file ON file_history(file_id)");
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_file_history_event_type ON file_history(event_type)",
      );
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_file_history_detected_at ON file_history(detected_at)",
      );
    },
  },
```

- [ ] **Step 2: Run the focused schema test**

Run:

```bash
npm test -- tests/catalog-schema.test.ts
```

Expected: PASS.

- [ ] **Step 3: Run existing migration tests**

Run:

```bash
npm test -- tests/migrations.test.ts tests/provider-schema.integration.test.ts tests/catalog-schema.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit migration**

```bash
git add lib/db/migrations-list.ts tests/catalog-schema.test.ts
git commit -m "feat: add catalog foundation migration"
```

---

### Task 3: Add catalog foundation tables to fresh database schema

**Files:**

- Modify: `lib/db.ts`
- Test: `tests/catalog-schema.test.ts`

**Interfaces:**

- Consumes: SQL definitions from migration `13`.
- Produces: fresh databases opened through `lib/db.ts` contain the same catalog foundation tables as migrated databases.

- [ ] **Step 1: Add a fresh DB schema test**

Append this test to `tests/catalog-schema.test.ts` after the existing `describe.sequential(...)` block:

```ts
describe.sequential("catalog foundation fresh db schema", () => {
  let moduleDbPath = "";
  let moduleTempDir = "";

  afterEach(async () => {
    const imported = await import("../lib/db.js");
    imported.db.close();
    cleanupSqliteFiles(moduleDbPath);
    if (moduleTempDir && fs.existsSync(moduleTempDir)) {
      fs.rmSync(moduleTempDir, { recursive: true, force: true });
    }
    delete process.env["BAMBU_DB"];
  });

  it("creates catalog tables when lib/db initializes a fresh database", async () => {
    moduleTempDir = fs.mkdtempSync(path.join(os.tmpdir(), "catalog-fresh-db-"));
    moduleDbPath = path.join(moduleTempDir, `fresh-${Date.now()}.sqlite`);
    process.env["BAMBU_DB"] = moduleDbPath;

    const imported = await import(`../lib/db.js?catalogFresh=${Date.now()}`);
    const rows = imported.db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all()
      .map((row) => (row as { name: string }).name);

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
      ]),
    );
  });
});
```

- [ ] **Step 2: Run the new fresh DB test before adding base schema statements**

Run:

```bash
npm test -- tests/catalog-schema.test.ts
```

Expected: This may PASS because `lib/db.ts` runs migrations during initialization. Regardless of this result, still add matching base schema statements to `lib/db.ts` so the bootstrap schema mirrors the migration definitions.

- [ ] **Step 3: Add base schema statements to `lib/db.ts`**

In `lib/db.ts`, inside the existing `for (const sql of [ ... ])` schema array, add the same table and index statements from migration `13`.

Place them after the existing `project_price_cache` table statement, in this order:

1. `scan_roots`
2. `idx_scan_roots_active`
3. `managed_blobs`
4. `idx_managed_blobs_hash`
5. `catalog_files`
6. all `catalog_files` indexes
7. `products`
8. all `products` indexes
9. `assets`
10. all `assets` indexes
11. `asset_files`
12. `idx_asset_files_file`
13. `project_products`
14. `idx_project_products_product`
15. `file_history`
16. all `file_history` indexes

Use the exact SQL strings from Task 2 so base schema and migration schema match.

- [ ] **Step 4: Run catalog schema tests**

Run:

```bash
npm test -- tests/catalog-schema.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit fresh schema support**

```bash
git add lib/db.ts tests/catalog-schema.test.ts
git commit -m "feat: include catalog tables in base schema"
```

---

### Task 4: Add TypeScript row interfaces

**Files:**

- Modify: `lib/types.ts`
- Test: `npm run typecheck`

**Interfaces:**

- Consumes: table definitions from Tasks 2 and 3.
- Produces: exported row interfaces for future scanner/model work.

- [ ] **Step 1: Add row interfaces to `lib/types.ts`**

In `lib/types.ts`, after the existing `Project` interface and before `JobFilament`, add:

```ts
export interface ScanRoot {
  id: number;
  name: string;
  root_path: string;
  normalized_root_path: string;
  is_active: number;
  last_scanned_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ManagedBlob {
  id: number;
  content_hash: string;
  hash_algorithm: string;
  storage_path: string;
  normalized_storage_path: string;
  size_bytes: number | null;
  created_at: string;
  last_verified_at: string | null;
}

export interface CatalogFile {
  id: number;
  root_id: number | null;
  path: string;
  normalized_path: string;
  filename: string;
  extension: string | null;
  size_bytes: number | null;
  modified_at: string | null;
  created_at_fs: string | null;
  quick_hash: string | null;
  content_hash: string | null;
  hash_algorithm: string | null;
  storage_role: string;
  managed_blob_id: number | null;
  original_source_path: string | null;
  original_source_root_id: number | null;
  scan_status: string;
  missing_since: string | null;
  metadata_json: string | null;
  first_seen_at: string;
  last_seen_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  designer: string | null;
  marketplace: string | null;
  source_url: string | null;
  license_summary: string | null;
  metadata_json: string | null;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: number;
  product_id: number;
  asset_type: string;
  title: string;
  description: string | null;
  role: string | null;
  metadata_json: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssetFile {
  asset_id: number;
  file_id: number;
  role: string;
  created_at: string;
}

export interface ProjectProduct {
  project_id: number;
  product_id: number;
  relationship: string;
  created_at: string;
}

export interface FileHistory {
  id: number;
  file_id: number;
  event_type: string;
  old_path: string | null;
  new_path: string | null;
  old_root_id: number | null;
  new_root_id: number | null;
  content_hash: string | null;
  details_json: string | null;
  detected_at: string;
}
```

- [ ] **Step 2: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 3: Commit types**

```bash
git add lib/types.ts
git commit -m "feat: add catalog row types"
```

---

### Task 5: Final verification and cleanup

**Files:**

- Review: `lib/db/migrations-list.ts`
- Review: `lib/db.ts`
- Review: `lib/types.ts`
- Review: `tests/catalog-schema.test.ts`

**Interfaces:**

- Consumes: all previous task outputs.
- Produces: verified implementation ready for review.

- [ ] **Step 1: Run full verification**

Run:

```bash
npm run typecheck
npm run lint
npm test
```

Expected: all commands PASS.

- [ ] **Step 2: Inspect git diff**

Run:

```bash
git status --short
git diff --stat
```

Expected changed files are limited to:

```text
lib/db/migrations-list.ts
lib/db.ts
lib/types.ts
tests/catalog-schema.test.ts
```

- [ ] **Step 3: Confirm no runtime behavior changes**

Run:

```bash
grep -R "scan_roots\|catalog_files\|managed_blobs\|file_history\|project_products" -n lib models routes frontend tests | sort
```

Expected: matches only in schema, types, and tests. No API routes, UI files, pricing code, sync code, or provider code should depend on the new tables in this plan.

- [ ] **Step 4: Commit final cleanup if needed**

If Step 1 or Step 2 required formatting-only cleanup, commit it:

```bash
git add lib/db/migrations-list.ts lib/db.ts lib/types.ts tests/catalog-schema.test.ts
git commit -m "chore: verify catalog foundation schema"
```

If there are no cleanup changes, do not create an empty commit.

---

## Plan Self-Review

Spec coverage:

- Bridge-first catalog foundation: Tasks 2 and 3 add `project_products`.
- Index-first file migration foundation: Tasks 2 and 3 add `scan_roots`, `catalog_files`, `storage_role`, and source provenance columns.
- File move/history tracking from day one: Tasks 2 and 3 add `file_history`; Task 1 tests cascade behavior.
- Optional managed storage: Tasks 2 and 3 add `managed_blobs` and `catalog_files.managed_blob_id`; Task 1 tests dedupe constraints.
- Products/assets/files abstraction: Tasks 2 and 3 add `products`, `assets`, `asset_files`, and `catalog_files`.
- No runtime behavior changes: Task 5 verifies references stay limited to schema/types/tests.
- TypeScript row interfaces: Task 4 adds exported interfaces.
- Verification: Task 5 runs typecheck, lint, and full tests.

Placeholder scan:

- The plan contains no unspecified implementation steps.

Type consistency:

- Interface names match the spec: `ScanRoot`, `ManagedBlob`, `CatalogFile`, `Product`, `Asset`, `AssetFile`, `ProjectProduct`, `FileHistory`.
- Table names match the spec: `scan_roots`, `managed_blobs`, `catalog_files`, `products`, `assets`, `asset_files`, `project_products`, `file_history`.
