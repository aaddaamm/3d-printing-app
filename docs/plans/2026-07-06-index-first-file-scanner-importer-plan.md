# Plan

## Problem summary

The catalog foundation schema is available, but it is empty unless data is inserted manually. Build the first safe population path: an inventory-only, CLI-first scanner that persists scan roots, indexes supported local 3D/source/G-code files into `catalog_files`, records state transitions in `file_history`, and never copies, moves, renames, or auto-attaches files to products/assets.

Requirements source: `docs/brainstorms/2026-07-06-index-first-file-scanner-importer-requirements.md`.

## Relevant learnings

- `docs/solutions/architecture/2026-07-06-catalog-foundation-schema-parity.md`
  - Keep catalog work index-first unless the user explicitly approves managed storage adoption.
  - Maintain current app behavior while adding future-facing catalog capabilities.
  - Use tests to pin SQLite behavior and keep fixture mocks aligned with production filesystem checks.

## Scope boundaries

In scope:

- CLI-only scanner/importer.
- Persistent scan root management using `scan_roots`.
- Recursive scan of active roots.
- Default indexed extensions: `.3mf`, `.stl`, `.step`, `.stp`, `.obj`, `.f3d`, `.blend`, `.gcode`.
- Default archive skip: `.zip`, `.rar`, `.7z`.
- Content hashing for new files and files whose size or modified time changed.
- Missing/restored/changed/discovered history events in `file_history`.
- Concise scan summary.
- Tests for root management, scan behavior, CLI behavior, and idempotency.

Out of scope:

- Product/asset auto-creation or matching.
- `asset_files` adoption.
- API endpoints or UI controls.
- Managed storage copying/deduplication.
- Bambu Studio local database import.
- Thumbnail extraction.

## Architecture decisions

No ADR-worthy decisions. The feature follows the already-approved catalog architecture: index-first local metadata in SQLite, no file reorganization, CLI-only first slice.

Implementation architecture:

- Add a pure-ish catalog scanner module in `lib/catalog-scanner.ts` that accepts an injected DB handle/root paths/options where practical.
- Add prepared statement helpers in `lib/db/catalog-statements.ts` to keep SQL centralized and testable.
- Add CLI entrypoint `scan-catalog.ts` for root add/list/remove and scan commands.
- Add package scripts for common CLI use, likely `catalog` or `catalog:scan`.
- Keep public APIs explicitly typed and avoid `any`.
- Use parameterized SQL only.
- Use Node `fs`, `path`, and `crypto` APIs. Verify exact API usage against installed Node typings/official docs before implementation where behavior matters, especially recursive traversal/stat/hash streaming.

## Implementation units

### Unit 1 — Catalog root model and SQL statements

#### Goal

Create tested data-access functions for scan root management and catalog scan persistence primitives.

#### Files

Create/modify:

- `lib/db/catalog-statements.ts`
- `lib/catalog-scanner.ts` or `lib/catalog-roots.ts` if a smaller root-only module is cleaner
- `lib/db.ts`
- `tests/catalog-scanner.test.ts`

#### Patterns to follow

- `lib/db/project-statements.ts` for prepared statement factory style.
- `models/projects-crud.ts` for small exported model functions over prepared statements.
- Existing catalog row interfaces in `lib/types.ts`.

#### RED

Write failing tests first for:

- Adding a scan root stores `name`, `root_path`, `normalized_root_path`, timestamps, and `is_active = 1`.
- Adding duplicate normalized root fails or returns a clear error without duplicate rows.
- Listing roots returns active and inactive roots in stable order.
- Removing/deactivating a root marks it inactive rather than deleting catalog data.

Run:

```bash
npm test -- tests/catalog-scanner.test.ts
```

Expected RED: tests fail because root management functions/statements do not exist.

#### GREEN

Implement minimal root statement/model functions and wire them through `lib/db.ts` exports if needed.

#### REFACTOR

Clean up naming and shared helpers for path normalization/time formatting.

#### Verification

```bash
npm test -- tests/catalog-scanner.test.ts
npm run typecheck
```

#### Dependencies

None.

### Unit 2 — File classification, traversal, metadata, and hashing

#### Goal

Implement deterministic file discovery for supported file types without database side effects.

#### Files

Create/modify:

- `lib/catalog-scanner.ts`
- `tests/catalog-scanner.test.ts`

#### Patterns to follow

- Existing filesystem test mocking style in `tests/covers.test.ts` when mocking is needed.
- Prefer temp directories with real files for traversal/hash tests over deep mocks.

#### RED

Write failing tests first for:

- Supported extensions include `.3mf`, `.stl`, `.step`, `.stp`, `.obj`, `.f3d`, `.blend`, `.gcode`, case-insensitively.
- Archives such as `.zip`, `.rar`, `.7z` are skipped by default.
- Common noisy/system directories are skipped where specified by implementation, without leaving the configured root.
- Hashing returns stable SHA-256 for new/changed files.
- Unchanged files can be identified from size and modified time so callers can skip rehashing.

Run:

```bash
npm test -- tests/catalog-scanner.test.ts
```

Expected RED: tests fail because classifier/traversal/hash functions do not exist.

#### GREEN

Implement minimal classifier, recursive traversal, stat extraction, and streaming SHA-256 hashing.

#### REFACTOR

Separate pure extension classification from filesystem traversal to keep tests focused.

#### Verification

```bash
npm test -- tests/catalog-scanner.test.ts
npm run typecheck
```

#### Dependencies

Unit 1 may provide shared normalization helpers, but this unit should remain mostly independent.

### Unit 3 — Scan execution and history state machine

#### Goal

Implement scan behavior that upserts `catalog_files`, preserves rows, and records meaningful `file_history` events.

#### Files

Create/modify:

- `lib/catalog-scanner.ts`
- `lib/db/catalog-statements.ts`
- `tests/catalog-scanner.test.ts`

#### Patterns to follow

- `tests/catalog-schema.test.ts` for isolated SQLite setup.
- `lib/migrations.ts` and existing DB tests for better-sqlite3 transaction patterns.

#### RED

Write failing tests first for:

- First scan creates `catalog_files` rows and `file_history` discovered/indexed events.
- Second unchanged scan is idempotent: no duplicate rows and no duplicate history events.
- Changed file updates size, modified time, content hash, scan status, and records a changed event.
- Missing file marks existing row missing and records a missing event without deleting row.
- Restored file marks row active and records a restored event.
- Scan summary counts scanned, added, changed, unchanged, missing, restored, skipped, failed.

Run:

```bash
npm test -- tests/catalog-scanner.test.ts
```

Expected RED: tests fail because scan execution is not implemented.

#### GREEN

Implement the scan transaction/state machine with parameterized statements.

#### REFACTOR

Review event names and summary fields for consistency with requirements. Keep changes narrow and avoid product/asset logic.

#### Verification

```bash
npm test -- tests/catalog-scanner.test.ts
npm run typecheck
```

#### Dependencies

Units 1 and 2.

### Unit 4 — CLI entrypoint and package scripts

#### Goal

Expose root management and scanning through a CLI with concise output.

#### Files

Create/modify:

- `scan-catalog.ts`
- `package.json`
- `tests/catalog-cli.test.ts` or extend an existing package/CLI test if cleaner
- `README.md` or `TASKS.md` only if needed for discoverability

#### Patterns to follow

- `sync-configured-providers.ts` for simple local argument parsing.
- `tests/package-scripts.test.ts` for script assertions.
- Existing CLI entrypoints use `npx tsx <file>.ts` in package scripts.

#### RED

Write failing tests first for:

- Package script exists for catalog CLI/scanning.
- CLI rejects unknown commands with non-zero exit and helpful usage.
- CLI supports adding, listing, removing/deactivating roots.
- CLI scan command prints concise summary counts.

Run:

```bash
npm test -- tests/catalog-cli.test.ts tests/package-scripts.test.ts
```

Expected RED: tests fail because CLI/script does not exist.

#### GREEN

Implement minimal CLI parser and package scripts. Prefer simple commands such as:

```bash
npm run catalog -- roots add <path> [name]
npm run catalog -- roots list
npm run catalog -- roots remove <id-or-path>
npm run catalog -- scan
```

Exact names can be adjusted during implementation if tests document them first.

#### REFACTOR

Keep CLI output stable and concise. Avoid introducing a CLI dependency unless clearly justified.

#### Verification

```bash
npm test -- tests/catalog-cli.test.ts tests/package-scripts.test.ts
npm run typecheck
```

#### Dependencies

Units 1-3.

### Unit 5 — Final integration verification and documentation polish

#### Goal

Verify the feature end-to-end and document local usage if not already obvious.

#### Files

Create/modify:

- `README.md` or `docs/` usage note if needed
- `.superpowers/sdd/task-*` reports if executing with subagent-driven development

#### Patterns to follow

- Existing README command sections.
- Previous verification pattern: focused tests, lint, typecheck, full suite.

#### RED

No new production behavior should be added in this unit. If documentation examples are added, first add or update tests that assert package scripts/CLI usage where practical.

#### GREEN

Run final checks and make only documentation/cleanup changes required by review.

#### REFACTOR

Remove incidental debug output and ensure no local scan data or temp files are committed.

#### Verification

```bash
npm test -- tests/catalog-scanner.test.ts tests/catalog-cli.test.ts
npm run typecheck
npm run lint
npm test
```

#### Dependencies

Units 1-4.

## Verification strategy

During implementation:

- Each unit must start with RED tests and record the expected failing command/output.
- Each unit must pass its focused tests before moving on.
- Review after each implementation unit.

Final gate:

```bash
npm run typecheck
npm run lint
npm test
```

Additional manual smoke test after implementation, using a temporary directory and non-production DB:

```bash
BAMBU_DB=/tmp/printworks-catalog-smoke.sqlite npm run catalog -- roots add /tmp/catalog-root Smoke
BAMBU_DB=/tmp/printworks-catalog-smoke.sqlite npm run catalog -- roots list
BAMBU_DB=/tmp/printworks-catalog-smoke.sqlite npm run catalog -- scan
```

Expected result: concise counts summary and no copied/moved source files.
