# Agent Guidance — bambu-history-dump

## Ticket hygiene

`tickets/` contains work that has been identified but deferred. At the start of any
session where significant features or refactoring are discussed:

1. **Check tickets/** — scan the list and mention any that are directly relevant to
   the current work. If a ticket's work has been completed, delete the file.
2. **Create tickets** for any clearly useful work that comes up but isn't being
   done in the current session. Better to write it down than lose it.
3. Ticket files are plain Markdown. Keep them concise: background, proposed approach,
   open questions. Don't over-engineer them.

## Architecture overview

```
dump-bambu-history.ts   — CLI: fetch from Bambu API → insert → normalize → download covers
normalize.ts            — Session detection & job upsert (also importable)
api.ts                  — Hono HTTP server entry point
routes/                 — Hono route handlers (jobs, tasks, rates, summary, ui)
models/                 — DB query functions called by routes
lib/
  db.ts                 — Schema, migrations, prepared statements (better-sqlite3)
  fetch.ts              — Bambu API fetch with retry + pagination
  normalize.ts          — normalizeTask() — maps raw API shape to PrintTask
  covers.ts             — Local cover image cache (download + serve)
  pricing.ts            — Pure pricing functions (no DB access)
  types.ts              — Shared TypeScript interfaces
tickets/                — Deferred feature work (see above)
covers/                 — Cached cover PNGs (gitignored, populated by sync)
```

### Key data concepts

- **print_task**: one plate from one Bambu API task record. Raw API data stored in `raw_json`.
- **session**: group of plates from the same `(instanceId, deviceId)` printed within 4 hours
  of each other. `session_id` = the first task's Bambu API id.
- **job**: one row per session. The unit for pricing and customer tracking.
- **job_filaments**: AMS slot data per task (filament type, color hex, weight used).

### DB is synchronous

`better-sqlite3` is synchronous — no `await` needed for DB calls. All query functions
in `models/` are plain sync functions.

## Development workflow

```bash
npm run dev     # Hot-reload API server (tsx watch)
npm run sync    # Fetch from Bambu API + normalize + download covers
npm run typecheck
```

The API requires `API_KEY` env var. Sync requires `BAMBU_TOKEN` (or `~/.bambu_token`).

## Frontend architecture decision

The UI (`routes/ui.ts`) currently serves everything as a single HTML string from
a TypeScript template literal. This works but doesn't scale past ~3 pages.

**Current setup (done):**
- Frontend lives in `public/` — `index.html`, `app.js`, `app.css`
- `routes/ui.ts` is a thin server: injects `window.API_KEY` into the HTML shell,
  serves static files from `public/`, keeps `/data` and `/covers/:taskId` endpoints
- `app.js` uses **Preact 10 + htm** via ESM imports from `https://esm.sh`
  — no build step, browser caches modules after first load
  — requires internet on first load; subsequent loads use browser cache

**Adding new pages / features:**
- Add new components to `public/app.js` (or split into `public/components/`)
- Add new API endpoints in `routes/` and `models/` as needed
- Do NOT add React/Vue/Svelte/Vite — build pipeline overhead isn't worth it
- If `app.js` grows past ~600 lines, split into `public/components/*.js` modules

## Pricing config

Rates live in the DB (`material_rates`, `machine_rates`, `labor_config`).
The `machine_rate_per_hr` is a pre-computed sum:
  `purchase_price / lifetime_hrs + electricity_rate_per_hr + maintenance_buffer_per_hr`

If a job's filament type has no matching rate row, pricing falls back to PLA.
Known gap: `PLA-S` (Specialty PLA) has no rate row — see `tickets/specialty-pla-material-rate.md`.

## Cover images

Pre-signed S3 URLs expire 30 minutes after sync. `lib/covers.ts` downloads them
to `covers/{task_id}.png` during sync. Tasks not returned by the API (beyond the
fetch window) will have expired URLs — those covers are permanently unavailable
unless you increase `BAMBU_LIMIT` to capture them before expiry.
