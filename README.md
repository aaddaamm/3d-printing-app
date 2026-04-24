# bambu-history-dump

Fetches Bambu Lab cloud print history into a local SQLite database, normalizes plates into jobs/projects, caches cover images, and serves an internal HTTP API plus a small no-build Preact UI for pricing and customer tracking.

Safe to re-run — Bambu task records are upserted by task ID, then jobs/projects are re-normalized.

## Requirements

- Node.js 18+
- `npm install`

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
npm run dev          # Hot-reload API server (tsx watch)
npm run api          # Start API server
npm run sync         # Fetch Bambu API → SQLite → normalize → download covers
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

Cover image URLs from Bambu are short-lived. Sync downloads them to `covers/{task_id}.png` while they are still available.

## API server and UI

```bash
# Set API_KEY in your shell or process manager first.
npm run api
# or during development
npm run dev
```

Open `http://localhost:3000/ui` for the browser UI.

### API environment variables

| Variable              | Default                        | Description                                     |
| --------------------- | ------------------------------ | ----------------------------------------------- |
| `API_KEY`             | _(required)_                   | Bearer token and UI login secret                |
| `PORT`                | `3000`                         | Server port                                     |
| `BAMBU_DB`            | `./bambu_print_history.sqlite` | SQLite database path                            |
| `SYNC_INTERVAL_HOURS` | `0`                            | If > 0, run sync 10s after startup and interval |

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

- **print_tasks**: one plate from one Bambu API task record. Raw API data is stored in `raw_json`.
- **jobs**: one row per detected session. Business fields live here: `customer`, `notes`, `price_override`, `status_override`, `extra_labor_minutes`, `project_id`.
- **job_filaments**: AMS slot/material usage per task.
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
