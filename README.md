# bambu-history-dump

Fetches your full Bambu Lab print history from the cloud API and saves it to a local SQLite database. Includes an internal HTTP API for pricing and job management.

Safe to re-run — records are upserted by task ID.

## Requirements

- Node.js 18+
- `npm install`

## Authentication

You need a Bambu Lab API token. Store it in `~/.bambu_token`:

```bash
echo "your-token-here" > ~/.bambu_token
chmod 600 ~/.bambu_token
```

The token file may also contain the JSON format returned by some Bambu tools:

```json
{"region": "global", "token": "your-token-here"}
```

Both formats are handled automatically. Alternatively, pass the token via the `BAMBU_TOKEN` env var (see below).

## Scripts

```bash
npm run sync    # Fetch print history and upsert into SQLite
npm run api     # Start the HTTP API server
npm run check   # Syntax-check both files without running them
```

---

## Sync

### Usage

```bash
npm run sync
# or
node dump-bambu-history.mjs
```

Fetches up to `BAMBU_LIMIT` tasks from the Bambu cloud API and upserts them into the local SQLite database. Each run is recorded in the `sync_log` table.

### Environment variables

| Variable           | Default                        | Description                                      |
|--------------------|--------------------------------|--------------------------------------------------|
| `BAMBU_TOKEN`      | _(reads `~/.bambu_token`)_     | API bearer token (overrides token file)          |
| `BAMBU_TOKEN_PATH` | `~/.bambu_token`               | Path to token file                               |
| `BAMBU_BASE_URL`   | `https://api.bambulab.com`     | API base URL (must use https)                    |
| `BAMBU_DEVICE_ID`  | _(all devices)_                | Filter history to a single device                |
| `BAMBU_LIMIT`      | `1000`                         | Max tasks to fetch per sync (1000 returns all)   |
| `BAMBU_DB`         | `./bambu_print_history.sqlite` | SQLite database path                             |
| `BAMBU_DEBUG`      | _(unset)_                      | Set to any value to print API debug info         |

---

## API server

### Usage

```bash
API_KEY=your-secret-key npm run api
# or
API_KEY=your-secret-key node api.mjs
```

All routes require a static bearer token:

```
Authorization: Bearer <API_KEY>
```

### Environment variables

| Variable   | Default                        | Description                     |
|------------|--------------------------------|---------------------------------|
| `API_KEY`  | _(required)_                   | Bearer token for all API routes |
| `PORT`     | `3000`                         | Port to listen on               |
| `BAMBU_DB` | `./bambu_print_history.sqlite` | SQLite database path            |

### Routes

#### `GET /health`

Returns database status and most recent sync run.

```json
{
  "ok": true,
  "db": "./bambu_print_history.sqlite",
  "last_sync": {
    "id": 42,
    "started_at": "2024-01-15T10:00:00.000Z",
    "ended_at": "2024-01-15T10:00:03.200Z",
    "inserted": 5,
    "updated": 12,
    "error": null
  }
}
```

#### `GET /tasks`

Returns all tasks, optionally filtered.

**Query params:**

| Param      | Description                              |
|------------|------------------------------------------|
| `status`   | Filter by status (e.g. `finish`, `failed`) |
| `device`   | Filter by `deviceModel` (e.g. `Bambu Lab X1C`) |
| `customer` | Filter by customer name                  |
| `from`     | Filter `startTime >=` (ISO 8601)         |
| `to`       | Filter `startTime <=` (ISO 8601)         |

```bash
curl -H "Authorization: Bearer $API_KEY" \
  "http://localhost:3000/tasks?status=finish&customer=Acme"
```

```json
{ "count": 12, "tasks": [ ... ] }
```

#### `GET /tasks/:id`

Returns a single task by ID, or `404`.

```json
{ "task": { "id": "...", "status": "finish", ... } }
```

#### `PATCH /tasks/:id`

Updates the business fields on a task. Only the following fields are accepted — all are optional and the update is merged with the existing row:

| Field           | Type           | Description              |
|-----------------|----------------|--------------------------|
| `material_cost` | number or null | Cost of filament used     |
| `labor_cost`    | number or null | Labor cost for the job    |
| `price`         | number or null | Price charged to customer |
| `notes`         | string or null | Free-form notes           |
| `customer`      | string or null | Customer name             |

```bash
curl -X PATCH \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"price": 24.99, "customer": "Acme", "notes": "Rush order"}' \
  "http://localhost:3000/tasks/12345"
```

Returns the updated task:

```json
{ "task": { "id": "12345", "price": 24.99, "customer": "Acme", ... } }
```

#### `GET /summary`

Returns aggregated totals across all tasks, broken down by device.

```json
{
  "totals": {
    "total_prints": 634,
    "total_weight_g": 12450.5,
    "total_cost_time_s": 9823400,
    "total_material_cost": 187.30,
    "total_labor_cost": 420.00,
    "total_price": 980.00
  },
  "by_device": [
    {
      "deviceId": "...",
      "deviceName": "My Printer",
      "total_prints": 312,
      "total_weight_g": 6200.0,
      "total_cost_time_s": 4900000,
      "total_material_cost": 93.60,
      "total_labor_cost": 210.00,
      "total_price": 490.00
    }
  ]
}
```

---

## Database schema

### `tasks`

| Column          | Type      | Description                        |
|-----------------|-----------|------------------------------------|
| `id`            | TEXT PK   | Task ID                            |
| `deviceId`      | TEXT      | Printer device ID                  |
| `deviceName`    | TEXT      | Printer display name               |
| `designId`      | TEXT      | Design ID                          |
| `designTitle`   | TEXT      | Design title                       |
| `modelId`       | TEXT      | Model ID                           |
| `profileId`     | TEXT      | Profile ID                         |
| `status`        | TEXT      | Print status (see below)           |
| `weight`        | REAL      | Filament weight (grams)            |
| `length`        | REAL      | Filament length (mm)               |
| `costTime`      | INTEGER   | Print duration (seconds)           |
| `startTime`     | TEXT      | Print start timestamp              |
| `endTime`       | TEXT      | Print end timestamp                |
| `cover`         | TEXT      | Cover image URL                    |
| `thumbnail`     | TEXT      | Thumbnail image URL                |
| `raw_json`      | TEXT      | Full API response for this task    |
| `material_cost` | REAL      | Cost of filament (business field)  |
| `labor_cost`    | REAL      | Labor cost (business field)        |
| `price`         | REAL      | Price charged (business field)     |
| `notes`         | TEXT      | Free-form notes (business field)   |
| `customer`      | TEXT      | Customer name (business field)     |

Indexes: `deviceId`, `startTime`, `customer`.

**Status values:** `created`, `running`, `pause`, `finish`, `failed`, `cancel`.

### `sync_log`

Records every sync run.

| Column       | Type    | Description                      |
|--------------|---------|----------------------------------|
| `id`         | INTEGER | Auto-increment primary key       |
| `started_at` | TEXT    | Run start timestamp (ISO 8601)   |
| `ended_at`   | TEXT    | Run end timestamp                |
| `inserted`   | INTEGER | New tasks added                  |
| `updated`    | INTEGER | Existing tasks updated           |
| `error`      | TEXT    | Error message if the run failed  |

---

## Example SQL queries

```sql
-- Total prints and filament used
SELECT COUNT(*) AS prints, ROUND(SUM(weight), 1) AS grams FROM tasks;

-- Prints per printer
SELECT deviceName, COUNT(*) AS n FROM tasks GROUP BY deviceName ORDER BY n DESC;

-- Prints by status
SELECT status, COUNT(*) AS n FROM tasks GROUP BY status ORDER BY n DESC;

-- Recent prints
SELECT startTime, deviceName, designTitle, status FROM tasks ORDER BY startTime DESC LIMIT 20;

-- Revenue by customer
SELECT customer, COUNT(*) AS jobs, ROUND(SUM(price), 2) AS revenue
FROM tasks WHERE customer IS NOT NULL
GROUP BY customer ORDER BY revenue DESC;

-- Sync history
SELECT started_at, ended_at, inserted, updated, error FROM sync_log ORDER BY id DESC LIMIT 10;
```
