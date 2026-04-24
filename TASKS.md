# Tasks & Improvements

GitHub Issues are the source of truth for open deferred work. Current open backlog:

- [#1 Bambu Studio Local Database Import](https://github.com/aaddaamm/3d-printing-app/issues/1)
- [#3 MQTT Real-Time Print Capture](https://github.com/aaddaamm/3d-printing-app/issues/3)
- [#4 Spool Inventory Tracking](https://github.com/aaddaamm/3d-printing-app/issues/4)

## Historical completed work

- [x] Fetch print history from Bambu Lab cloud API
- [x] Upsert into SQLite with WAL mode
- [x] Retry logic with exponential backoff for 429/5xx and network failures
- [x] Fetch timeout via `AbortSignal`
- [x] Token file JSON parsing (`{"token":"..."}` format)
- [x] Graceful SIGINT handler
- [x] New vs updated tracking per sync run
- [x] `sync_log` table records every sync run with counts and errors
- [x] Normalize raw `print_tasks` into session-based `jobs`
- [x] Track AMS/material usage in `job_filaments`
- [x] Pricing config for labor, machine rates, and material rates
- [x] Project grouping and per-project pricing
- [x] Auto-group MakerWorld designs by `designId`
- [x] Auto-group local Bambu Studio plates by title prefix
- [x] Local cover-image cache
- [x] Internal HTTP API (`api.ts`) with bearer auth
- [x] Browser UI at `/ui`
- [x] Scheduled sync via `SYNC_INTERVAL_HOURS`
- [x] Numbered schema migrations with `schema_migrations`
- [x] README updated for current TypeScript API, UI, jobs/projects, and rates
