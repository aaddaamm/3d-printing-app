# Tasks & Improvements

## Open


- [ ] **Scheduled sync** — Set up a cron job or launchd plist to run `npm run sync` on a regular cadence (every 15 min?) so the DB stays current without manual runs.

- [ ] **API key rotation** — Currently a single static `API_KEY` env var. No mechanism to rotate without downtime. Low priority for internal use but worth noting.

- [x] **Update README** — Document the new `api.mjs` server, all routes, the `API_KEY` env var, and the business fields (`material_cost`, `labor_cost`, `price`, `notes`, `customer`).

## In Progress

<!-- Move items here when actively working on them -->

## Done

- [x] Fetch print history from Bambu Lab cloud API
- [x] Upsert into SQLite with WAL mode
- [x] Retry logic with exponential backoff (429/5xx)
- [x] Fetch timeout via `AbortSignal`
- [x] Token file JSON parsing (`{"token": "..."}` format)
- [x] Graceful SIGINT handler
- [x] New vs updated tracking per sync run
- [x] `sync_log` table — records every sync run with counts and errors
- [x] Business columns on `tasks` — `material_cost`, `labor_cost`, `price`, `notes`, `customer`
- [x] Internal HTTP API (`api.mjs`) — Hono, 5 routes, static bearer auth
- [x] Status code mapping (numeric → human-readable string)
- [x] Full history fetch — `BAMBU_LIMIT=1000` returns all records; default raised from 50 to 1000
