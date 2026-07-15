# PrintWorks

PrintWorks is a local-first 3D print history, pricing, and catalog app. It syncs provider history into SQLite, normalizes prints into jobs/projects, caches cover images, and serves an internal HTTP API plus a small Preact UI for pricing and customer tracking.

The app is moving in a **local-first** direction: run it on a machine inside the same LAN as your printers, keep SQLite/covers on persistent local disk, and avoid exposing local printer APIs publicly.

Safe to re-run — provider records are upserted, then jobs/projects are re-normalized.

## Requirements

- Node.js 18+
- `npm install`
- Local network access to LAN-only printer APIs such as Moonraker, when using those providers

See `docs/local-first-deployment.md` for the current local deployment direction.

## Authentication

### Bambu Cloud token

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

### Local API/UI access

The API server and browser UI are intended to run on a trusted local machine or LAN.
The local app does not require an application-level login; keep the service behind your
local network or another trusted access layer.

## Scripts

```bash
npm run dev          # API watch + Vite UI together
npm run dev:api      # Hot-reload API server only (tsx watch)
npm run dev:ui       # Vite dev server for UI (HMR)
npm run api          # Start API server
npm run sync         # Fetch all configured providers → SQLite → normalize → covers
npm run sync:bambu   # Fetch Bambu Cloud provider only → SQLite → normalize → download covers
npm run sync:moonraker # Fetch Moonraker/Snapmaker U1 history only → SQLite → normalize
npm run catalog      # Manage catalog scan roots and index local model/G-code files
npm run normalize    # Rebuild sessions/jobs from existing print_tasks
npm test             # Vitest suite
npm run typecheck    # TypeScript check
npm run lint         # ESLint
npm run build        # Compile with tsconfig.build.json
npm run smoke        # Full gates + isolated API/product/batch workflow smoke test
```

`npm run smoke` copies the configured SQLite DB to a temporary file, starts the API on a temporary local port, exercises the UI/API/product/batch workflows against that copy, then deletes the temp DB. It does not mutate your real app database.

## Provider sync

```bash
npm run sync
```

Runs every provider in `printworks.config.json`, such as Bambu Cloud and Moonraker/Snapmaker U1, then normalizes jobs, auto-groups projects, downloads available covers, and records runs in `sync_log`.

To run only the Bambu Cloud provider sync:

```bash
npm run sync:bambu
```

This fetches up to `BAMBU_LIMIT` tasks from Bambu Cloud, upserts them into `print_tasks`, normalizes related plates into `jobs`, auto-groups jobs into `projects`, downloads currently available cover images, and records the run in `sync_log`. The `sync:bambu` script remains as a provider-specific compatibility command.

For only a Snapmaker U1 or other Moonraker-compatible printer:

```bash
MOONRAKER_BASE_URL=http://snapmaker-u1.local npm run sync:moonraker
```

Moonraker sync imports one history job as one app job/session. It uses slicer metadata for estimated filament weight when available; raw history payloads are retained in `print_tasks.raw_json`.

### Sync environment variables

Some environment variable names retain `BAMBU_` prefixes for backward compatibility with existing local installs. They are provider-specific or legacy compatibility names, not the app name.

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
| `SYNC_INTERVAL_HOURS`           | `0`          | Shared fallback sync interval for configured providers      |
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

## Catalog file scanner

The catalog scanner is index-first: it records local file paths and metadata in SQLite without copying or moving files. In the local UI, use the Catalog tab to manage scan roots, run a synchronous scan, triage newly discovered files, browse indexed files, view embedded 3MF previews, and review exact-content duplicate groups.

```bash
npm run catalog -- roots add /path/to/models Models
npm run catalog -- roots list
npm run catalog -- scan
npm run catalog -- roots remove 1
```

The scanner indexes common 3D/source/G-code files (`.3mf`, `.stl`, `.step`, `.stp`, `.obj`, `.f3d`, `.blend`, `.gcode`) and skips archives, images, PDFs, symlinks, and unsupported files. New or changed files are SHA-256 hashed; embedded PNG/JPEG previews are cached from 3MF archives when available. Scan output is a concise counts summary.

Current boundaries:

- File identity is path-based. Moving or renaming a file creates a new indexed path and leaves the old record marked missing; matching hashes are reported as duplicates but do not reconcile moves.
- Scans run in the API request/CLI process and hash files sequentially; there is no background queue or filesystem watcher. The API rejects overlapping scan requests.
- Deactivating a root preserves its records, but there is no reactivation action yet.
- Newly discovered files enter the inbox as design candidates. Files in one package folder are grouped together; generic `STL`/`3MF` subfolders fold into their parent package, while loose root files group only by matching filename stem.
- Candidate adoption links every grouped file to one new or existing product, uses a likely primary file (favoring 3MF), and never moves the originals. “Review separately” exposes the existing per-file adoption and ignore actions when a grouping is not useful.
- Review transitions are enforced: only inbox files can be ignored, only ignored files can return to the inbox, and product-linked files cannot enter either triage state.
- Files that predate the inbox migration are marked `indexed` rather than flooding the inbox.
- The file gallery loads 48 records at a time and supports filename/folder search plus scan-state and review-state filters.
- Exact-duplicate analysis is loaded on demand and paginated at 25 groups per request.
- Catalog, Products, Batches, and Rates/Admin routes load independently from the print-history dashboard bootstrap. Jobs, Projects, and Printers still load shared history, summary, and pricing data.
- Managed copy/move operations are not implemented yet; all current adoptions are references to files in place.
- An unreadable root or subtree is reported as an incomplete scan with path-level errors. Missing-file detection is skipped for that root until a complete traversal succeeds.

## Product Pipeline

The Product Pipeline is a lightweight product catalog for Robinson PrintWorks. It is intentionally card-based rather than spreadsheet-like: use it to decide what to add, test, photograph, list, keep active, restock, or retire.

Product statuses are:

- Idea
- Downloaded / Designed
- Test Print
- Needs Tuning
- Ready for Photos
- Listed
- Active
- Selling Well
- Retired

License and sellability are shown as a red/yellow/green indicator:

- Green: OK to sell, including commercial-allowed, Hive Community, Hive+, and original Robinson PrintWorks designs.
- Yellow: sell with conditions, such as attribution required.
- Red: do not list, including Personal Use Only and Unknown / Verify.

Hive Community products are allowed for physical-print sales, but the app warns not to redistribute STL/model files. Original Robinson PrintWorks products are marked with the highest sellability confidence.

Product cards can link to local catalog files, photos, Etsy/model URLs, preferred printer, material/color notes, target sale price, and estimated print time/filament. Print jobs remain the production/pricing source of truth; products are the workflow and listing layer above jobs/projects.

Main UI views:

- Product Pipeline: Kanban columns by status.
- Product Catalog: searchable card grid.
- Product Detail: sellability, notes, URLs, estimates, and editable product fields.
- Print Next: active/selling-well products with restock priority.

## Pricing profiles and batch runs

PrintWorks separates print-session costs from product pricing decisions:

- **Personal**: internal cost only. No labor minimum, margin, or platform fee is required.
- **Booth**: in-person selling price for fairs/booths. Includes batch setup labor, per-unit handling, packaging, card/payment fee, failure buffer, overhead, and target margin.
- **Etsy**: online listing price. Uses the same unit-cost basis as booth pricing but adds Etsy/platform fees, a fixed per-order fee, and a higher default minimum price.
- **Custom**: placeholder profile for future custom requests. It is available for batch estimates, but the app does not yet include a full quote/deposit/revision workflow.

A batch run represents one production run for a product. It tracks planned/completed/failed quantities, material/color, printer, total filament, total print time, setup minutes, per-unit handling minutes, packaging cost, and notes. Batch pricing uses completed quantity as the sellable unit count, so failed prints raise the cost per sellable item instead of being ignored.

Batch unit cost is calculated from:

```txt
material + machine time + setup labor + per-unit handling labor + packaging + buffers
```

Suggested sale price then applies the selected pricing profile's target margin, platform fee, and fixed per-order fee. The default Etsy profile includes a $0.45 fixed fee to account for the $0.20 listing fee plus the US Etsy Payments flat processing fee. Product detail pages can store booth/Etsy target prices and default packaging/handling assumptions, while batch pages show the actual unit cost and suggested price for a real production run.

## Local API server and UI

This is the preferred operating mode for now. Run the API/UI on your Mac or another always-on machine on the same LAN as your printers.

```bash
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
| `PORT`                          | `3000`                         | Server port                                                 |
| `BAMBU_DB`                      | `./bambu_print_history.sqlite` | SQLite database path                                        |
| `SYNC_INTERVAL_HOURS`           | `0`                            | Shared fallback sync interval for configured providers      |
| `SYNC_PROVIDERS`                | _(auto)_                       | Comma-separated scheduled providers, e.g. `bambu,moonraker` |
| `BAMBU_SYNC_INTERVAL_HOURS`     | legacy value                   | Bambu-specific scheduled sync interval                      |
| `MOONRAKER_SYNC_INTERVAL_HOURS` | `0`                            | Moonraker-specific scheduled sync interval                  |

## Routes

Routes are intended for trusted local/LAN access. There is no application-level auth
gate in the local-first mode.

### Health/UI

| Method | Path                 | Description                   |
| ------ | -------------------- | ----------------------------- |
| `GET`  | `/health`            | DB health and latest sync run |
| `GET`  | `/ui`                | Browser UI                    |
| `GET`  | `/ui/data`           | UI bootstrap payload          |
| `GET`  | `/ui/covers/:taskId` | Cached cover image            |

### Products

| Method  | Path                       | Description                    |
| ------- | -------------------------- | ------------------------------ |
| `GET`   | `/api/products`            | Product catalog summaries      |
| `POST`  | `/api/products`            | Create a product               |
| `GET`   | `/api/products/print-next` | Products queued for restock    |
| `GET`   | `/api/products/:id`        | Product detail/summary fields  |
| `PATCH` | `/api/products/:id`        | Update product workflow fields |

### Batches

| Method   | Path                           | Description                     |
| -------- | ------------------------------ | ------------------------------- |
| `GET`    | `/api/batches`                 | List production batches         |
| `POST`   | `/api/batches`                 | Create a batch                  |
| `GET`    | `/api/batches/:id`             | Batch detail and price summary  |
| `PATCH`  | `/api/batches/:id`             | Update batch quantities/costs   |
| `POST`   | `/api/batches/:id/jobs`        | Link a print job to a batch     |
| `DELETE` | `/api/batches/:id/jobs/:jobId` | Remove a print job from a batch |

### Catalog

| Method   | Path                        | Description                                      |
| -------- | --------------------------- | ------------------------------------------------ |
| `GET`    | `/catalog/files`            | List indexed catalog-file summaries              |
| `GET`    | `/catalog/inbox`            | List present files awaiting review               |
| `GET`    | `/catalog/duplicates`       | Group exact-content matches by SHA-256 hash      |
| `GET`    | `/catalog/previews/:file`   | Serve a cached embedded 3MF preview              |
| `POST`   | `/catalog/files/:id/adopt`  | Link a file to a new or existing product         |
| `POST`   | `/catalog/files/:id/ignore` | Remove a discovery from the inbox                |
| `POST`   | `/catalog/files/:id/inbox`  | Return an indexed file to the review inbox       |
| `GET`    | `/catalog/roots`            | List active and inactive scan roots              |
| `POST`   | `/catalog/roots`            | Add an existing server-local directory           |
| `DELETE` | `/catalog/roots/:id`        | Deactivate a root without deleting indexed files |
| `POST`   | `/catalog/scan`             | Synchronously scan every active root             |

### Tasks

`print_tasks` are raw imported provider history records after light normalization. Bambu records are usually per-plate; Moonraker records are completed history jobs.

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
- **scan_roots**, **catalog_files**, **file_history**: allowed local directories, indexed file metadata/hashes, review state, and scan/adoption history.
- **products**: sellable-design workflow records that may reference catalog files and production defaults.
- **production_batches**, **batch_jobs**: production runs and their linked print jobs.
- **pricing_profiles**: channel-specific margin, fee, labor, packaging, and minimum-price assumptions.
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
