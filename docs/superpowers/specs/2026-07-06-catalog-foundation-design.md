# Catalog Foundation Design

Date: 2026-07-06

## Status

Approved for design/specification. Not yet approved for implementation.

## Context

PrintWorks Studio is evolving from a print-history and pricing app into a broader operating system for Robinson PrintWorks.

The current application is centered around imported print records:

```text
print_tasks → jobs → projects
```

This model works for print history, project pricing, and customer tracking, but it is not sufficient for a long-term product catalog. Future catalog work needs to track printable products, source files, photos, licenses, receipts, documentation, packaging, and other product-related assets.

This design introduces a schema-only catalog foundation while preserving all existing behavior.

## Goals

- Add a durable catalog foundation without rewriting the current app.
- Keep existing `print_tasks`, `jobs`, `projects`, pricing, sync, and UI behavior unchanged.
- Introduce a clean path toward `products → assets → files`.
- Allow current print-history projects to link to future catalog products through a bridge.
- Support idempotent future filesystem scanning by tracking stable file identity and scan state.
- Track file moves and missing/restored events from day one.
- Support an initial file migration that makes SQLite authoritative without blindly duplicating all source files.
- Allow optional managed storage adoption later, deduped by content hash.
- Avoid hard-coding the assumption that every product owns only printable model files.

## Non-goals

- No full filesystem scanner implementation in this phase.
- No thumbnail extraction implementation in this phase.
- No Product Catalog UI in this phase.
- No automatic product creation from existing projects in this phase.
- No pricing behavior changes in this phase.
- No migration or rename of existing `projects` into `products`.
- No automatic bulk copying of source files into managed storage.

## Domain boundary

The current operational print-history domain remains intact:

```text
print_tasks → jobs → projects
```

- `print_tasks`: provider-imported records.
- `jobs`: normalized print sessions/runs.
- `projects`: current operational grouping for pricing and customer tracking.

The new catalog domain is added alongside it:

```text
products → assets → catalog_files
```

- `products`: curated sellable/printable designs in the Robinson PrintWorks catalog.
- `assets`: semantic product-owned items such as model files, photos, licenses, receipts, packaging, documentation, print profiles, or videos.
- `catalog_files`: scanned filesystem records with paths, hashes, timestamps, metadata, missing/present scan state, and optional managed-storage adoption state.

SQLite becomes authoritative for identity, metadata, product/asset relationships, and history. Source folders do not have to become authoritative, and the app should not duplicate all source files by default.

The bridge between current and future domains is explicit:

```text
projects ↔ products
```

A current project can optionally link to one or more catalog products. This avoids forcing every auto-grouped print-history project to become a curated product immediately.

## Recommended approach

Use a bridge-first, index-first catalog foundation.

Benefits:

- Current app behavior remains stable.
- Catalog work can begin without a large data migration.
- Existing projects can be reviewed and linked to products gradually.
- Bundles, variants, and messy historical groupings remain possible.
- The catalog model remains distinct from print-history grouping.
- Initial import can index existing files without doubling disk usage.
- Optional managed storage can adopt important files later using dedupe by content hash.

Rejected alternatives:

1. **Fully separate catalog with no bridge yet**
   - Safer in the short term, but delays an important connection between existing print history and future products.
2. **Promote `projects` into `products`**
   - Too risky. Existing projects are auto-grouped operational records, not curated catalog products.

## Initial file migration model

The initial file migration should be space-conscious.

Default behavior should be **index-first**:

1. Scan configured source roots.
2. Store file identity, path, timestamps, hashes, and metadata in SQLite.
3. Link catalog files to products/assets only when the user or future automation decides they belong together.
4. Do not copy source files into managed storage automatically.

Managed storage should be optional and explicit:

1. A user or future workflow chooses to adopt a file into app-managed storage.
2. The app dedupes by `content_hash` before storing anything.
3. If a managed copy already exists for the same hash, reuse it.
4. If possible, use hardlinks or APFS clone/copy-on-write behavior to avoid duplicating bytes.
5. Fall back to a normal copy only when necessary.
6. Preserve original source path and source root provenance.

This gives the app an authoritative SQLite catalog without forcing a full duplicate library on day one.

## Schema design

### `scan_roots`

Configured filesystem roots that future scanners will traverse.

```sql
CREATE TABLE IF NOT EXISTS scan_roots (
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
```

Indexes:

```sql
CREATE INDEX IF NOT EXISTS idx_scan_roots_active ON scan_roots(is_active);
```

### `catalog_files`

Filesystem records discovered by future scanner runs.

The table is named `catalog_files` instead of `files` to avoid ambiguity in code and SQL.

```sql
CREATE TABLE IF NOT EXISTS catalog_files (
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
```

Indexes:

```sql
CREATE INDEX IF NOT EXISTS idx_catalog_files_root ON catalog_files(root_id);
CREATE INDEX IF NOT EXISTS idx_catalog_files_content_hash ON catalog_files(content_hash);
CREATE INDEX IF NOT EXISTS idx_catalog_files_extension ON catalog_files(extension);
CREATE INDEX IF NOT EXISTS idx_catalog_files_scan_status ON catalog_files(scan_status);
CREATE INDEX IF NOT EXISTS idx_catalog_files_storage_role ON catalog_files(storage_role);
CREATE INDEX IF NOT EXISTS idx_catalog_files_managed_blob ON catalog_files(managed_blob_id);
CREATE INDEX IF NOT EXISTS idx_catalog_files_filename ON catalog_files(filename COLLATE NOCASE);
```

Future scanner behavior should use `content_hash` to detect moved files and `scan_status` / `missing_since` to mark missing files instead of deleting them.

`storage_role` should initially support:

- `source`: indexed file in an existing source folder.
- `managed`: app-managed adopted file.

### `managed_blobs`

Optional app-managed storage entries, deduped by content hash.

This table does not require the app to copy files automatically. It provides a safe target for future explicit adoption/import workflows.

```sql
CREATE TABLE IF NOT EXISTS managed_blobs (
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
```

Indexes:

```sql
CREATE INDEX IF NOT EXISTS idx_managed_blobs_hash ON managed_blobs(content_hash, hash_algorithm);
```

### `file_history`

Append-only history for movement, import, missing, restore, and managed adoption events.

```sql
CREATE TABLE IF NOT EXISTS file_history (
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
```

Indexes:

```sql
CREATE INDEX IF NOT EXISTS idx_file_history_file ON file_history(file_id);
CREATE INDEX IF NOT EXISTS idx_file_history_event_type ON file_history(event_type);
CREATE INDEX IF NOT EXISTS idx_file_history_detected_at ON file_history(detected_at);
```

Initial event types should include:

- `indexed`
- `moved`
- `missing`
- `restored`
- `adopted_managed`
- `verified`

### `products`

Curated catalog products.

```sql
CREATE TABLE IF NOT EXISTS products (
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
);
```

Indexes:

```sql
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_designer ON products(designer);
CREATE INDEX IF NOT EXISTS idx_products_marketplace ON products(marketplace);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name COLLATE NOCASE);
```

### `assets`

Semantic product-owned assets.

```sql
CREATE TABLE IF NOT EXISTS assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  role TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

Indexes:

```sql
CREATE INDEX IF NOT EXISTS idx_assets_product ON assets(product_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(asset_type);
```

Initial asset types should be represented as data values, not hard-coded table names:

- `model`
- `print_profile`
- `cad_source`
- `photo`
- `license`
- `receipt`
- `documentation`
- `packaging`
- `marketing`
- `video`
- `other`

Asset-specific metadata belongs in `assets.metadata_json` until specific fields become stable enough to promote.

### `asset_files`

Many-to-many link between assets and scanned files.

```sql
CREATE TABLE IF NOT EXISTS asset_files (
  asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  file_id INTEGER NOT NULL REFERENCES catalog_files(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'primary',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (asset_id, file_id, role)
);
```

Indexes:

```sql
CREATE INDEX IF NOT EXISTS idx_asset_files_file ON asset_files(file_id);
```

Example roles:

- `primary`
- `alternate`
- `source`
- `thumbnail`
- `preview`
- `backup`

### `project_products`

Bridge between current operational projects and catalog products.

```sql
CREATE TABLE IF NOT EXISTS project_products (
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL DEFAULT 'primary',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (project_id, product_id)
);
```

Indexes:

```sql
CREATE INDEX IF NOT EXISTS idx_project_products_product ON project_products(product_id);
```

Relationship examples:

- `primary`
- `bundle_item`
- `variant`
- `related`

## Migration strategy

Add one schema-only migration after the current migration `12`.

Suggested migration:

- `id`: `13`
- `description`: `add catalog foundation tables`

Rules:

- Use `CREATE TABLE IF NOT EXISTS`.
- Use `CREATE INDEX IF NOT EXISTS`.
- Do not modify or drop existing columns/tables.
- Do not backfill products from projects.
- Do not change runtime behavior.
- Add matching base schema statements in `lib/db.ts` so fresh databases and migrated databases agree.
- Create `managed_blobs` before `catalog_files` in implementation order because `catalog_files.managed_blob_id` references it.

## TypeScript changes

Add row interfaces to `lib/types.ts`:

- `ScanRoot`
- `CatalogFile`
- `Product`
- `Asset`
- `AssetFile`
- `ProjectProduct`
- `ManagedBlob`
- `FileHistory`

No route/model API is required in this phase unless tests need a small helper.

## Testing strategy

Add a real SQLite migration test using a temp DB.

Assertions:

- Running migrations twice is safe.
- New tables exist:
  - `scan_roots`
  - `catalog_files`
  - `products`
  - `assets`
  - `asset_files`
  - `project_products`
  - `managed_blobs`
  - `file_history`
- Important indexes exist:
  - active scan roots
  - catalog file root
  - catalog file content hash
  - catalog file extension
  - catalog file scan status
  - catalog file storage role
  - catalog file managed blob
  - catalog file filename
  - managed blob hash
  - file history file/event/detected-at
  - product status/designer/marketplace/name
  - assets product/type
  - asset files by file
  - project products by product
- Key constraints work:
  - duplicate `normalized_root_path` is rejected.
  - duplicate `normalized_path` is rejected.
  - duplicate managed blob `(content_hash, hash_algorithm)` is rejected.
  - duplicate managed blob `normalized_storage_path` is rejected.
  - deleting a product cascades assets and project bridge rows.
  - deleting an asset cascades asset file rows.
  - deleting a project cascades project bridge rows.
  - deleting a catalog file cascades its file history rows.

Verification commands:

```bash
npm run typecheck
npm run lint
npm test
```

## Future work enabled

This schema enables later phases without another major redesign:

- Initial source-root indexing/import.
- Optional managed file adoption with hardlink/reflink/copy fallback.
- Filesystem scanner.
- 3MF preview extraction.
- STL thumbnail generation.
- Product Catalog UI.
- Product completeness scoring.
- Product search and filters.
- Product-to-pricing connections.
- Multiple print profiles per product.
- Multiple marketplace image sets.
- License/receipt tracking.
- CAD source tracking.
- Packaging and marketing asset management.
- Product bundles and variants.

## Open decisions deferred

These decisions are intentionally deferred until later phases:

- Exact scanner hashing algorithm and quick-hash strategy.
- Exact managed library path layout.
- Whether managed adoption should prefer hardlink, APFS clone, or normal copy on each platform.
- Whether product status should become a constrained lookup table.
- Whether asset types should remain free-text or become a table.
- How existing projects should be suggested for product creation/linking.
- Product completeness scoring rules.
- Search implementation details, including whether to use SQLite FTS.
