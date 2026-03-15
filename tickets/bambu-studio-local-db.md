# Bambu Studio Local Database Import

## Background

Bambu Studio (the desktop slicer) caches print history locally in a SQLite
database at:
  macOS:   ~/Library/Application Support/BambuStudio/user/{userId}/
  Windows: %APPDATA%\BambuStudio\user\{userId}\

The local DB contains historical records including jobs that may predate your
cloud API fetch window — potentially recovering prints whose cover URLs have
long expired.

## Effort: Low-Medium
## Benefit: Medium

The schema is undocumented but SQLite is easy to inspect. Main value is
recovering older print records and filling gaps in cloud history.

## Use cases

- Recover prints older than the cloud API's retention window
- Works as a one-time historical import to backfill the DB
- No token/auth required — just read the local file
- Could run as `npm run import-studio` alongside the normal sync

## Proposed approach

1. Add `import-bambu-studio.ts` CLI script
2. Accept a path to the Bambu Studio DB file (or auto-detect default location)
3. Map Bambu Studio's schema to `print_tasks` / `jobs` — use upsert so it's
   safe to re-run
4. Run `runNormalize()` after import, same as the cloud sync

## Open questions

- Studio's local schema may differ from the cloud API response shape —
  needs hands-on inspection with a SQLite browser first
- Cover images in the local DB may be stored as local file paths rather than
  S3 URLs — need to check if they're accessible
- Studio's schema could change between app versions with no notice

## How to start

Open Bambu Studio's DB in DB Browser for SQLite and inspect the tables before
writing any code. The task/print table structure will determine how much
mapping work is needed.
