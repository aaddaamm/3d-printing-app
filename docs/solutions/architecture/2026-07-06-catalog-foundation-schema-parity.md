---
title: Catalog foundation schema needs migration and bootstrap parity
category: architecture
severity: medium
tags:
  - sqlite
  - migrations
  - base-schema
  - catalog-files
  - managed-blobs
  - file-history
  - vitest
applies_when:
  - Adding schema-only foundations to this SQLite app
  - Creating new migrations that must work for both migrated and fresh databases
  - Introducing future-facing catalog tables without changing current runtime behavior
  - Mocking filesystem existence checks in tests for code that validates file stats
---

# Problem

PrintWorks Studio needed a catalog foundation without disrupting the existing print history app. The schema had to support products, assets, catalog files, file history, optional managed storage, and a bridge from existing `projects` to future `products`.

The subtle risk was that this app has two schema creation paths:

1. Existing databases advance through numbered migrations.
2. Fresh databases bootstrap from `lib/db.ts`, then run migrations.

If new catalog tables are added only as a migration, migrated databases work, but the intended fresh-schema contract can drift or become hard to audit.

# Context

The completed foundation added:

- `scan_roots`
- `managed_blobs`
- `catalog_files`
- `products`
- `assets`
- `asset_files`
- `project_products`
- `file_history`

The work intentionally avoided scanner implementation, UI changes, pricing changes, project/product migration, and bulk file copying. SQLite remains authoritative for identity, metadata, relationships, and history; source folders remain in place until a future index-first scanner/importer is built.

# Solution

For schema foundations in this repo:

1. Start with tests that define the target migration behavior.
2. Add an idempotent migration using `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS`.
3. Create dependency tables before referencing tables. Example: `managed_blobs` must be created before `catalog_files` because `catalog_files.managed_blob_id` references it.
4. Mirror the final table/index definitions in `lib/db.ts` bootstrap schema so fresh and migrated databases remain aligned.
5. Add row interfaces in `lib/types.ts` after schema is stable.
6. Verify both focused schema tests and the full suite.

When fixing unrelated test breakage, keep the fix at the failing test boundary. In this case, `downloadCovers()` validates pre-existing cover paths with `fs.lstatSync()`. A stale test mocked `fs.existsSync()` as true but left `lstatSync()` real, causing `ENOENT`. The correct fix was to mock `lstatSync()` as a regular non-symlink file in the existing-file test path.

# Why this works

Migrations alone prove upgrade behavior. Bootstrap schema alone proves fresh creation. Maintaining both prevents drift and makes future review straightforward.

The index-first catalog design also preserves operational safety: new identities and relationships can be introduced without moving, copying, or renaming user source files. Optional managed storage can later dedupe by `content_hash` through `managed_blobs` without changing the initial scan model.

# Prevention

For future catalog work:

- Search this solution before planning schema changes with keywords: `sqlite`, `migration`, `base-schema`, `catalog_files`, `managed_blobs`, `file_history`.
- In `02-plan`, include an explicit task for `lib/db.ts` bootstrap parity whenever a numbered migration adds tables or indexes.
- In `04-review`, compare migration DDL against bootstrap DDL and verify creation order for foreign keys.
- Keep initial file migration index-first unless the user explicitly approves managed storage adoption.
- For filesystem tests, if `existsSync()` is mocked to indicate a file exists, also mock any later stat/read operation that production code performs on that path.
