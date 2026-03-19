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
  auto-group.ts         — Auto-group unassigned jobs into projects (by designId or title)
  constants.ts          — Shared constants (session gap, API limits, timeouts)
  db.ts                 — Schema, migrations, prepared statements (better-sqlite3)
  fetch.ts              — Bambu API fetch with retry + pagination
  normalize.ts          — normalizeTask() — maps raw API shape to PrintTask
  covers.ts             — Local cover image cache (download + serve)
  pricing.ts            — Pure pricing functions (no DB access)
  types.ts              — Shared TypeScript interfaces
public/                 — Frontend (Preact + htm, no build step)
  index.html            — Shell HTML (API_KEY injected server-side)
  app.js                — Root component, routing, data fetching
  app.css               — All styles
  components/           — Preact components (atoms, modal, views, toast, router)
tickets/                — Deferred feature work (see above)
covers/                 — Cached cover PNGs (gitignored, populated by sync)
```

### Key data concepts

- **print_task**: one plate from one Bambu API task record. Raw API data stored in `raw_json`.
- **session**: group of plates from the same `(instanceId, deviceId)` printed within 4 hours
  of each other (configurable via `SESSION_GAP_S`). `session_id` = the first task's Bambu API id.
- **job**: one row per session. The unit for pricing and customer tracking.
- **project**: a group of related jobs. Auto-created by `autoGroupProjects` or created manually in the UI.
- **job_filaments**: AMS slot data per task (filament type, color hex, weight used).

### Auto-grouping logic

Jobs are auto-assigned to projects in two passes (see `lib/auto-group.ts`):

1. **MakerWorld designs** — jobs with a real `designId` (not `"0"` or empty) are grouped
   by `designId`. One project per unique design.
2. **User-imported models** — jobs where `designId` is `"0"`, empty, or null (i.e. models
   sliced locally in Bambu Studio, not from MakerWorld). These have no shared design ID,
   so they are grouped by **title prefix**:
   - Bambu Studio names tasks as `{project_name}_plate_{N}` or `{project_name}_{custom_plate_name}`.
   - First pass collects all known `_plate_N` base names.
   - Second pass maps named plates (e.g. `BD-1 - complete_Leg Lower - Right`) back to
     their parent project if the base prefix (before the last `_`) matches a known `_plate_` base.
   - `source_design_id` for title-based projects uses a `title:` prefix to avoid collisions
     with numeric MakerWorld design IDs.

### Pricing rules

- **Per-job pricing**: material + machine + labor (with minimum) + extra labor + markup.
- **Per-project pricing**: aggregates material + machine across all jobs, but applies
  only **one** labor charge (one setup, not per-job). This prevents a multi-plate print
  from being billed N× the labor minimum.
- Only **finished** plates count toward weight and time — failed/cancelled plates are
  excluded as production loss.
- If a job's filament type has no matching `material_rates` row, pricing falls back to PLA.

### DB is synchronous

`better-sqlite3` is synchronous — no `await` needed for DB calls. All query functions
in `models/` are plain sync functions.

## Code quality

```bash
npm run lint         # ESLint (typescript-eslint + eslint-config-prettier)
npm run lint:fix     # Auto-fix lint issues
npm run format       # Prettier (write)
npm run format:check # Prettier (check only)
npm run typecheck    # tsc --noEmit
npm test             # vitest run
```

**Always run `npm run lint` and `npm run typecheck` before committing.** The ESLint
config (`eslint.config.js`) uses flat config with `typescript-eslint/recommended` and
defers formatting to Prettier. The `public/` directory is excluded from ESLint (plain
JS, no TypeScript).

Prettier config (`.prettierrc.json`): double quotes, semicolons, trailing commas,
100-char print width, 2-space indent.

## Development workflow

```bash
npm run dev     # Hot-reload API server (tsx watch)
npm run sync    # Fetch from Bambu API + normalize + download covers
npm run typecheck
npm test
```

The API requires `API_KEY` env var. Sync requires `BAMBU_TOKEN` (or `~/.bambu_token`).

## Frontend architecture

The UI uses **Preact 10 + htm** via ESM imports from `https://esm.sh` — no build step,
no bundler. Browser caches modules after first load; requires internet on first load.

- `routes/ui.ts` is a thin server: injects `window.API_KEY` into the HTML shell,
  serves static files from `public/`, provides `/data` and `/covers/:taskId` endpoints.
- Components live in `public/components/` as plain `.js` modules.
- Use `toast()` from `public/components/toast.js` for user feedback — **never use
  `alert()` or `confirm()`** in the frontend.

**Adding new pages / features:**
- Add new components to `public/components/`
- Add new API endpoints in `routes/` and `models/` as needed
- Do NOT add React/Vue/Svelte/Vite — build pipeline overhead isn't worth it

## Cover images

Pre-signed S3 URLs expire 30 minutes after sync. `lib/covers.ts` downloads them
to `covers/{task_id}.png` during sync. Tasks not returned by the API (beyond the
fetch window) will have expired URLs — those covers are permanently unavailable
unless you increase `BAMBU_LIMIT` to capture them before expiry.

## Commit conventions

Use atomic commits with conventional-commit prefixes (`feat:`, `fix:`, `chore:`,
`refactor:`, `perf:`). Never `git add -A` — stage only files related to the change.
