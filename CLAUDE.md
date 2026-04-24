# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> See also `AGENTS.md` for extended architecture notes, auto-grouping logic details, pricing rules, and frontend conventions.

## Commands

```bash
npm run dev          # Hot-reload API server (tsx watch)
npm run sync         # Fetch from Bambu API + normalize + download covers
npm run api          # Start API server (requires API_KEY env var)
npm test             # vitest run (all tests)
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier write
npm run format:check # Prettier check
```

Run a single test file: `npx vitest run tests/pricing.test.ts`

**Always run `npm run lint`, `npm run typecheck`, and `npm test` before committing.**

## Architecture

```
dump-bambu-history.ts   CLI: fetch Bambu API → upsert tasks → normalize → download covers
normalize.ts            Session detection & job upsert (importable)
api.ts                  Hono HTTP server entry point
routes/                 Hono route handlers (jobs, projects, rates, summary, tasks, ui)
models/                 Sync DB query functions called by routes (better-sqlite3, no await)
lib/
  db.ts                 Schema, prepared statements, migration registration
  migrations.ts         Numbered migration helpers and schema_migrations bookkeeping
  normalize.ts          normalizeTask() — maps raw API shape to PrintTask
  session-detection.ts  Shared session grouping logic
  auto-group.ts         Auto-group unassigned jobs into projects
  pricing.ts            Pure pricing functions (no DB access)
  covers.ts             Local cover image cache (download + serve)
  colors.ts             ANSI color helpers for CLI/server logs
  types.ts              Shared TypeScript interfaces
  constants.ts          SESSION_GAP_S and other shared constants
  util.ts               Route/model utility helpers
public/                 Preact 10 + htm frontend — no build step, ESM from esm.sh
  app.js                Root component, routing, data fetching
  components/           Preact components (atoms, modal, views, toast, router)
```

## Key data model

- **print_task**: one plate from one Bambu API task. Raw API data stored in `raw_json`.
- **session**: plates from the same `(instanceId, deviceId)` within `SESSION_GAP_S` (4h). `session_id` = first task's Bambu API id.
- **job**: one row per session — the unit for pricing and customer tracking.
- **project**: group of related jobs. Auto-created by `autoGroupProjects` or manually via UI.
- **job_filaments**: AMS slot data per task (filament type, color hex, weight used).

## Important conventions

- `better-sqlite3` is synchronous — no `await` on DB calls.
- Frontend uses `toast()` from `public/components/toast.js` — never `alert()`/`confirm()`.
- `public/` is excluded from ESLint (plain JS, no TypeScript).
- Do not add React/Vue/Svelte/Vite to the frontend.
- Pricing: per-project applies one labor charge across all jobs; only **finished** plates count toward weight/time.
- GitHub Issues are the source of truth for deferred work; check relevant open issues before significant changes.
- Commit with conventional-commit prefixes (`feat:`, `fix:`, `chore:`, `refactor:`, `perf:`). Stage only related files — never `git add -A`.
