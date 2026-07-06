# Requirements

## Problem

The catalog foundation schema exists, but there is no way to populate it from local model/source files. The next useful step is a safe, index-first scanner that inventories files in user-selected folders without copying, moving, or automatically attaching them to products.

## Goals

- Provide a CLI-only first slice for local file inventory.
- Persist scan roots in SQLite using `scan_roots`.
- Recursively scan active roots into `catalog_files`.
- Record audit events in `file_history` for discovered, changed, missing, and restored files.
- Compute `content_hash` for new files and files whose size or modified time changed.
- Preserve current print history, pricing, sync, project, and UI behavior.
- Produce concise scan summaries that are easy to verify in tests and during local use.

## Non-goals

- No product or asset auto-creation.
- No automatic matching/adoption into `products`, `assets`, or `asset_files`.
- No API endpoints or UI controls in this first slice.
- No bulk copying, moving, renaming, or reorganizing source files.
- No managed storage adoption or `managed_blobs` population beyond leaving schema ready for future work.
- No Bambu Studio local database import or metadata reverse-engineering in this slice.
- No archive indexing by default.

## Approach options

### Option A — Inventory-only CLI (chosen)

Persist roots, scan files, update `catalog_files`, and record `file_history`. This validates the new schema with minimal product risk and creates the substrate for future matching/adoption.

Tradeoffs:

- Pros: safest, testable, no UI/API scope, no bad automatic matching.
- Cons: less immediately visible in the app until later UI/API work.

### Option B — Product/asset adoption now

Scan files and automatically or semi-automatically attach them to products/assets.

Tradeoffs:

- Pros: more user-facing catalog value sooner.
- Cons: requires matching rules and approval UX; overlaps future manual adoption work and risks wrong relationships.

### Option C — Bambu Studio local metadata import now

Start with local Bambu Studio project/database metadata instead of generic file inventory.

Tradeoffs:

- Pros: potentially richer metadata.
- Cons: larger unknown surface, reverse-engineering risk, and conflates local project import with file indexing.

## Recommended direction

Build **Option A: Inventory-only CLI**.

CLI capabilities:

- Add a scan root.
- List scan roots.
- Remove or deactivate a scan root.
- Run a scan across active roots.

Default indexed extensions:

- `.3mf`
- `.stl`
- `.step`
- `.stp`
- `.obj`
- `.f3d`
- `.blend`
- `.gcode`

Default ignored behavior:

- Skip archive files such as `.zip`, `.rar`, and `.7z`.
- Skip common noisy/system directories where appropriate.
- Do not traverse or index files outside configured roots.

Scan behavior:

- New matching files create `catalog_files` rows with path, root, extension/type, size, modified time, and `content_hash`.
- Existing unchanged files remain active and are not rehashed.
- Existing files with changed size or modified time are rehashed and recorded as changed.
- Previously indexed files not observed during a scan are marked missing, not deleted.
- Missing files observed again are marked active/restored.
- Each meaningful state transition records a `file_history` event.

CLI output:

- Default output is a concise summary with counts such as scanned, added, changed, unchanged, missing, restored, skipped, failed, and duration.
- Verbose per-file output can be deferred unless needed during implementation.

## Success criteria

- A user can persist one or more scan roots from the CLI.
- A user can list and remove/deactivate scan roots from the CLI.
- Running the scan indexes supported files into `catalog_files` without copying or moving files.
- Re-running an unchanged scan is idempotent and does not duplicate rows/history.
- Changing a file records a changed event and updates metadata/hash.
- Removing a file marks it missing and records a missing event without deleting its row.
- Restoring a missing file marks it active and records a restored event.
- Unsupported/archive files are skipped by default.
- Current app behavior for jobs, projects, pricing, sync, and UI is unchanged.
- `npm run typecheck`, `npm run lint`, and `npm test` pass.

## Domain vocabulary

- **scan root**: A persisted local directory that the scanner is allowed to recursively inventory.
- **catalog file**: A database record for a local file discovered under a scan root.
- **index-first**: Record file identity and metadata in SQLite without copying or reorganizing the underlying file.
- **missing file**: A previously indexed file that was not observed during a later scan; its row is retained for audit/history.
- **restored file**: A missing file that appears again in a later scan.
- **managed storage**: Future optional storage mode that may dedupe by content hash; out of scope for this slice.
