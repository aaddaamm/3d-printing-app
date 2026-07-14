# 3MF Catalog Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let Adam browse scanned local `.3mf` files visually, similar to Bambu Studio’s model browser.

**Architecture:** Extend the existing catalog scanner. During scan, extract embedded 3MF preview images into a local cache keyed by content hash, store preview metadata on `catalog_files.metadata_json`, expose catalog files through `/catalog/files`, serve previews through `/catalog/previews/:hash`, and render a grid in `CatalogView`.

**Tech Stack:** Node.js `fs/path/zlib`, better-sqlite3, Hono, Preact + htm, Vitest.

## Global Constraints

- Do not copy or move source 3MF files.
- Do not add a heavy slicer/STL renderer dependency for the MVP.
- Prefer embedded 3MF thumbnails/plate images when present.
- Keep path serving constrained to the preview cache directory.
- Follow existing synchronous DB model patterns.

---

### Task 1: 3MF preview extraction

**Files:**

- Create: `lib/catalog-preview.ts`
- Test: `tests/catalog-preview.test.ts`

**Interfaces:**

- Produces: `extract3mfPreview(filePath: string): Buffer | null`
- Produces: `writeCatalogPreview(contentHash: string, image: Buffer): string`
- Produces: `catalogPreviewPath(contentHash: string): string`
- Produces: `catalogPreviewExists(contentHash: string): boolean`

- [ ] Write failing tests with synthetic ZIP/3MF files containing `Metadata/thumbnail.png`, `Metadata/plate_1.png`, and no preview.
- [ ] Implement a minimal ZIP central-directory reader that supports stored and deflated entries.
- [ ] Extract first preferred PNG/JPEG preview.
- [ ] Write previews under `catalog-previews/<sha256>.<ext>` with safe hash validation.
- [ ] Run `npm test -- tests/catalog-preview.test.ts`.

### Task 2: Scanner metadata integration

**Files:**

- Modify: `lib/db/catalog-statements.ts`
- Modify: `lib/catalog-scanner.ts`
- Test: `tests/catalog-scanner.test.ts`

**Interfaces:**

- Produces metadata JSON like `{ "preview": { "hash": "...", "contentType": "image/png" } }` on present 3MF rows with extracted previews.

- [ ] Add failing scanner test that scans a 3MF with embedded thumbnail and expects `metadata_json` preview data.
- [ ] Add a DB statement to update `metadata_json`.
- [ ] During new/changed/restored 3MF scans, extract/write preview and update metadata.
- [ ] Leave non-3MF and 3MF-without-preview rows with null/unchanged preview metadata.
- [ ] Run `npm test -- tests/catalog-scanner.test.ts tests/catalog-preview.test.ts`.

### Task 3: Catalog API endpoints

**Files:**

- Modify: `models/catalog.ts`
- Modify: `routes/catalog.ts`
- Test: `tests/catalog-routes.test.ts`

**Interfaces:**

- Produces: `GET /catalog/files` returning `{ files: CatalogFileSummary[] }`.
- Produces: `GET /catalog/previews/:hash` returning cached image bytes.

- [ ] Add failing route tests for file listing and preview serving.
- [ ] List present/missing catalog files with `preview_url` when metadata has a cached preview.
- [ ] Serve preview bytes only via safe content-hash path resolution.
- [ ] Run `npm test -- tests/catalog-routes.test.ts`.

### Task 4: Catalog gallery UI

**Files:**

- Modify: `frontend/components/catalog-view.ts`
- Modify: `frontend/app.css`

**Interfaces:**

- Consumes: `GET /catalog/files`.
- Displays: thumbnail grid, filename, folder, extension, size, modified date, status.

- [ ] Load files alongside roots.
- [ ] Refresh files after scans.
- [ ] Render a responsive gallery with placeholder cards when no preview exists.
- [ ] Run `npm run typecheck` and `npm run build:ui`.

### Task 5: Verification

- [ ] Run `npm run lint`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm test`.
