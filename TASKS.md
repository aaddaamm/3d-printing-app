# Tasks & Improvements

GitHub Issues are the source of truth for open deferred work. Current open backlog:

- [#43 Build hybrid catalog inbox and managed design library](https://github.com/aaddaamm/3d-printing-app/issues/43)
- [#42 Add optional auth for non-local deployments](https://github.com/aaddaamm/3d-printing-app/issues/42)
- [#35 Roadmap: printer replacement and multi-printer management](https://github.com/aaddaamm/3d-printing-app/issues/35)
- [#34 Investigate Elegoo Centauri Carbon 2 history/pricing integration](https://github.com/aaddaamm/3d-printing-app/issues/34)
- [#33 Package app for local persistent deployment](https://github.com/aaddaamm/3d-printing-app/issues/33)
- [#31 Update docs and app naming for generalized 3D printing history/pricing](https://github.com/aaddaamm/3d-printing-app/issues/31)
- [#30 Make Jobs and Printers UI provider-aware](https://github.com/aaddaamm/3d-printing-app/issues/30)
- [#29 Investigate Flashforge Creator 5 history/pricing integration](https://github.com/aaddaamm/3d-printing-app/issues/29)
- [#22 Migrate repo to TypeScript-only architecture (backend + frontend + shared contracts)](https://github.com/aaddaamm/3d-printing-app/issues/22)
- [#18 Define manual project adoption matching rules](https://github.com/aaddaamm/3d-printing-app/issues/18)
- [#4 Spool Inventory Tracking](https://github.com/aaddaamm/3d-printing-app/issues/4)
- [#3 MQTT Real-Time Print Capture](https://github.com/aaddaamm/3d-printing-app/issues/3)
- [#1 Bambu Studio Local Database Import](https://github.com/aaddaamm/3d-printing-app/issues/1)

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
- [x] Internal HTTP API (`api.ts`) for trusted local/LAN use (no application-level auth)
- [x] Browser UI at `/ui`
- [x] Scheduled sync via `SYNC_INTERVAL_HOURS`
- [x] Numbered schema migrations with `schema_migrations`
- [x] README updated for current TypeScript API, UI, jobs/projects, and rates
- [x] Moonraker/Snapmaker U1 history sync MVP
- [x] Printer inventory lifecycle fields for active/retired printers
