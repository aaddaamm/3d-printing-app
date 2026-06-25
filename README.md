# bambu-history-dump

Fetches 3D printer history into a local SQLite database, normalizes prints into jobs/projects, caches cover images, and serves an internal HTTP API plus a small Preact UI for pricing and customer tracking.

The app is moving in a **local-first** direction: run it on a machine inside the same LAN as your printers, keep SQLite/covers on persistent local disk, and avoid exposing local printer APIs publicly.

Safe to re-run — provider records are upserted, then jobs/projects are re-normalized.

## Requirements

- Node.js 18+
- `npm install`
- Local network access to LAN-only printer APIs such as Moonraker, when using those providers

See `docs/local-first-deployment.md` for the current local deployment direction.

## Authentication

### Bambu sync token

Store your Bambu Lab API token in `~/.bambu_token`:

```bash
echo "your-token-here" > ~/.bambu_token
chmod 600 ~/.bambu_token
```

The token file may also contain JSON such as:

```json
{ "region": "global", "token": "your-token-here" }
```

You can also pass the token with `BAMBU_TOKEN`.

### API/UI key

The API server requires a static `API_KEY` env var. API clients use:

```http
Authorization: Bearer <API_KEY>
```

The browser UI is available at `/ui` and stores a same-key session cookie after login.

## Scripts

```bash
npm run dev          # API watch + Vite UI together
npm run dev:api      # Hot-reload API server only (tsx watch)
npm run dev:ui       # Vite dev server for UI (HMR)
npm run api          # Start API server
npm run sync         # Fetch Bambu API → SQLite → normalize → download covers
npm run sync:moonraker # Fetch Moonraker/Snapmaker U1 history → SQLite → normalize
npm run normalize    # Rebuild sessions/jobs from existing print_tasks
npm test             # Vitest suite
npm run typecheck    # TypeScript check
npm run lint         # ESLint
npm run build        # Compile with tsconfig.build.json
```

## Sync

```bash
npm run sync
```

Fetches up to `BAMBU_LIMIT` tasks from the Bambu cloud API, upserts them into `print_tasks`, normalizes related plates into `jobs`, auto-groups jobs into `projects`, downloads currently available cover images, and records the run in `sync_log`.

For a Snapmaker U1 or other Moonraker-compatible printer:

```bash
MOONRAKER_BASE_URL=http://snapmaker-u1.local npm run sync:moonraker
```

Moonraker sync imports one history job as one app job/session. It uses slicer metadata for estimated filament weight when available; raw history payloads are retained in `print_tasks.raw_json`.

### Sync environment variables

| Variable           | Default                        | Description                            |
| ------------------ | ------------------------------ | -------------------------------------- |
| `BAMBU_TOKEN`      | _(reads `~/.bambu_token`)_     | API bearer token; overrides token file |
| `BAMBU_TOKEN_PATH` | `~/.bambu_token`               | Path to token file                     |
| `BAMBU_BASE_URL`   | `https://api.bambulab.com`     | API base URL; must use HTTPS           |
| `BAMBU_DEVICE_ID`  | _(all devices)_                | Filter history to one device           |
| `BAMBU_LIMIT`      | `1000`                         | Max tasks to fetch per sync            |
| `BAMBU_DB`         | `./bambu_print_history.sqlite` | SQLite database path                   |
| `BAMBU_DEBUG`      | _(unset)_                      | Print API debug info                   |

Scheduler variables:

| Variable                        | Default      | Description                                                 |
| ------------------------------- | ------------ | ----------------------------------------------------------- |
| `SYNC_INTERVAL_HOURS`           | `0`          | Legacy Bambu sync interval; shared fallback with providers  |
| `SYNC_PROVIDERS`                | _(auto)_     | Comma-separated scheduled providers, e.g. `bambu,moonraker` |
| `BAMBU_SYNC_INTERVAL_HOURS`     | legacy value | Bambu-specific API-server sync interval                     |
| `MOONRAKER_SYNC_INTERVAL_HOURS` | `0`          | Moonraker-specific API-server sync interval                 |

Moonraker/Snapmaker U1 variables:

| Variable                  | Default                        | Description                                           |
| ------------------------- | ------------------------------ | ----------------------------------------------------- |
| `MOONRAKER_BASE_URL`      | _(required)_                   | Local Moonraker URL, e.g. `http://snapmaker-u1.local` |
| `MOONRAKER_API_KEY`       | _(unset)_                      | Optional Moonraker API key                            |
| `MOONRAKER_PRINTER_ID`    | URL host                       | Stable provider printer id                            |
| `MOONRAKER_PRINTER_NAME`  | `Snapmaker U1`                 | Display name for the physical printer                 |
| `MOONRAKER_PRINTER_MODEL` | `Snapmaker U1`                 | Model name used by machine rates/pricing              |
| `MOONRAKER_LIMIT`         | `50`                           | History page size                                     |
| `BAMBU_DB`                | `./bambu_print_history.sqlite` | SQLite database path                                  |

Cover image URLs from Bambu are short-lived. Sync downloads them to `covers/{task_id}.png` while they are still available.

## Local API server and UI

This is the preferred operating mode for now. Run the API/UI on your Mac or another always-on machine on the same LAN as your printers.

```bash
# Set API_KEY in your shell or process manager first.
npm run api
# or during development
npm run dev
```

Open `http://localhost:3000/ui` for the browser UI.

Hosted/serverless deployment is not the target for the next phase because local printer URLs such as `http://snapmaker-u1.local` are not reachable from a cloud function, and SQLite/covers need persistent disk.

### Vite UI dev (HMR)

```bash
npm run dev
```

Open `http://localhost:5173/ui/` for HMR UI development.
Vite proxies API/UI data routes to `http://localhost:3000` by default.
Override target with `VITE_API_PROXY_TARGET` if needed.

### API environment variables

| Variable                        | Default                        | Description                                                 |
| ------------------------------- | ------------------------------ | ----------------------------------------------------------- |
| `API_KEY`                       | _(required)_                   | Bearer token and UI login secret                            |
| `PORT`                          | `3000`                         | Server port                                                 |
| `BAMBU_DB`                      | `./bambu_print_history.sqlite` | SQLite database path                                        |
| `SYNC_INTERVAL_HOURS`           | `0`                            | Legacy Bambu sync interval; shared fallback with providers  |
| `SYNC_PROVIDERS`                | _(auto)_                       | Comma-separated scheduled providers, e.g. `bambu,moonraker` |
| `BAMBU_SYNC_INTERVAL_HOURS`     | legacy value                   | Bambu-specific scheduled sync interval                      |
| `MOONRAKER_SYNC_INTERVAL_HOURS` | `0`                            | Moonraker-specific scheduled sync interval                  |

## Routes

All non-public routes require bearer auth or the UI session cookie.

### Health/UI

| Method | Path                 | Description                         |
| ------ | -------------------- | ----------------------------------- |
| `GET`  | `/health`            | DB health and latest sync run       |
| `GET`  | `/ui`                | Browser UI                          |
| `GET`  | `/ui/data`           | UI bootstrap payload                |
| `GET`  | `/ui/covers/:taskId` | Cached cover image                  |
| `POST` | `/ui/login`          | UI login with `{ "apiKey": "..." }` |
| `GET`  | `/ui/logout`         | Clear UI session                    |

### Tasks

`print_tasks` are the raw per-plate Bambu API records after light normalization.

| Method | Path         | Description  |
| ------ | ------------ | ------------ |
| `GET`  | `/tasks`     | List tasks   |
| `GET`  | `/tasks/:id` | Get one task |

`GET /tasks` supports query filters: `status`, `device`, `customer`, `from`, `to`.

### Jobs

A job is one print session: plates from the same `(instanceId, deviceId)` printed within `SESSION_GAP_S`.

| Method  | Path               | Description                    |
| ------- | ------------------ | ------------------------------ |
| `GET`   | `/jobs`            | List jobs                      |
| `GET`   | `/jobs/prices`     | Price map for all jobs         |
| `GET`   | `/jobs/export.csv` | CSV export                     |
| `GET`   | `/jobs/:id`        | Job with task/filament details |
| `PATCH` | `/jobs/:id`        | Update business fields         |
| `GET`   | `/jobs/:id/price`  | Pricing breakdown for one job  |

`GET /jobs` and `/jobs/export.csv` support query filters: `status`, `device`, `customer`, `from`, `to`.

`PATCH /jobs/:id` accepts:

```json
{
  "customer": "Acme",
  "notes": "Rush order",
  "price_override": 24.99,
  "status_override": "paid",
  "project_id": 1,
  "extra_labor_minutes": 10
}
```

Each field is optional and may be set to `null` where appropriate.

### Printers

Printers are physical machines discovered from provider syncs. Retired printers stay available for historical reporting and pricing.

| Method  | Path            | Description                                  |
| ------- | --------------- | -------------------------------------------- |
| `GET`   | `/printers`     | List printer inventory and historical totals |
| `GET`   | `/printers/:id` | Get one printer                              |
| `PATCH` | `/printers/:id` | Update display/lifecycle fields              |

`GET /printers?include_retired=0` returns active inventory only.

`PATCH /printers/:id` accepts `name`, `model`, `serial`, `notes`, and `is_active`. Set `is_active` to `false` to retire a printer without deleting its history.

### Projects

Projects group related jobs. Auto-grouping creates projects by MakerWorld `designId`, or by Bambu Studio title prefixes for locally sliced models.

| Method   | Path                     | Description                        |
| -------- | ------------------------ | ---------------------------------- |
| `GET`    | `/projects`              | List projects                      |
| `GET`    | `/projects/prices`       | Price map for all projects         |
| `POST`   | `/projects/auto-group`   | Auto-assign unassigned jobs        |
| `POST`   | `/projects/cleanup-junk` | Remove empty/junk auto projects    |
| `POST`   | `/projects`              | Create a project                   |
| `GET`    | `/projects/:id`          | Project with jobs                  |
| `PATCH`  | `/projects/:id`          | Update `name`, `customer`, `notes` |
| `DELETE` | `/projects/:id`          | Delete project                     |
| `GET`    | `/projects/:id/price`    | Project pricing breakdown          |

### Rates and summary

| Method  | Path                              | Description                        |
| ------- | --------------------------------- | ---------------------------------- |
| `GET`   | `/rates`                          | Labor, machine, and material rates |
| `PATCH` | `/rates/labor`                    | Update labor config                |
| `PATCH` | `/rates/machines/:device_model`   | Upsert machine rate                |
| `PATCH` | `/rates/materials/:filament_type` | Upsert material rate               |
| `GET`   | `/summary`                        | Aggregate totals                   |

## Data model

- **providers** and **printers**: integration families and physical printer identities. Historical printers can remain in the database after you retire or replace the machine.
- **print_tasks**: one imported provider history record. Bambu records are plates; Moonraker records are completed history jobs. Raw provider data is stored in `raw_json`.
- **jobs**: one row per detected session. Bambu keeps plate grouping; generic providers default to one history record per job. Business fields live here: `customer`, `notes`, `price_override`, `status_override`, `extra_labor_minutes`, `project_id`.
- **job_filaments**: material usage per task when the provider/slicer exposes usable weight data.
- **projects**: manually-created or auto-grouped collections of jobs.
- **machine_rates**, **material_rates**, **labor_config**: pricing inputs.
- **sync_log**: sync run history.
- **schema_migrations**: applied numbered migrations.

Pricing rules:

- Per-job pricing = material + machine + labor minimum/actual + extra labor + markup.
- Per-project pricing aggregates material and machine across jobs but applies only one setup labor charge.
- Only finished plates count toward production weight/time.
- Missing material rates fall back to PLA.

## Example SQL queries

```sql
-- Recent jobs
SELECT id, startTime, designTitle, customer, status
FROM jobs
ORDER BY startTime DESC
LIMIT 20;

-- Prints by status
SELECT status, COUNT(*) AS n
FROM print_tasks
GROUP BY status
ORDER BY n DESC;

-- Revenue overrides by customer
SELECT customer, COUNT(*) AS jobs, ROUND(SUM(price_override), 2) AS revenue
FROM jobs
WHERE customer IS NOT NULL
GROUP BY customer
ORDER BY revenue DESC;

-- Sync history
SELECT started_at, ended_at, inserted, updated, error
FROM sync_log
ORDER BY id DESC
LIMIT 10;
```
