# Numbered Migration System for lib/db.ts

## Effort: Medium
## Benefit: Medium

## Background

`lib/db.ts` currently has two distinct patterns mixed together:

1. **Schema creation** — `CREATE TABLE IF NOT EXISTS` for each table. These are
   idempotent and fine as-is.

2. **Ad-hoc migrations** — a growing block of try/catch `ALTER TABLE ADD COLUMN`,
   column-presence checks via `PRAGMA table_info`, and table-rename guards. There
   are currently ~9 separate migration operations spread across ~90 lines. Each one
   uses a different detection strategy:
   - `PRAGMA table_info` to check for a column
   - `SELECT 1 FROM sqlite_master` to check for a table
   - try/catch around `ALTER TABLE` (column already exists → exception → silently ignored)
   - Version-gated `ALTER TABLE DROP COLUMN` (requires SQLite ≥ 3.35.0)

The problems this causes:
- **No audit trail.** There's no record of which migrations have run or when.
  `git log` is the only way to know what changed.
- **No ordering guarantee.** Migrations are scattered inline; a future developer
  might add a migration before a dependency it needs.
- **Try/catch swallows real errors.** If `ALTER TABLE` fails for a reason other
  than "column already exists" (e.g. a typo in the column type), the error is
  silently ignored.
- **Growing noise.** Every new schema change adds more one-off guard code. Some
  migrations are now permanently no-ops on any DB created in the last 6 months
  but can't be safely removed without knowing every user's DB state.

## Proposed approach

Add a `schema_migrations` table and a small migration runner. Each migration
is a numbered entry — either a SQL string or a function for multi-step work.
The runner checks which IDs have already been applied and runs only the new ones,
each wrapped in a transaction.

```typescript
// lib/migrations.ts

interface Migration {
  id: number;
  up: string | ((db: Database) => void);
}

export function runMigrations(db: Database, migrations: Migration[]): void {
  db.prepare(`CREATE TABLE IF NOT EXISTS schema_migrations (
    id INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL
  )`).run();

  const applied = new Set(
    (db.prepare("SELECT id FROM schema_migrations").all() as { id: number }[])
      .map(r => r.id)
  );

  for (const m of migrations) {
    if (applied.has(m.id)) continue;
    db.transaction(() => {
      if (typeof m.up === "string") {
        db.prepare(m.up).run();
      } else {
        m.up(db);
      }
      db.prepare("INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)")
        .run(m.id, new Date().toISOString());
    })();
  }
}
```

### Migration list (representative — needs full audit of current ad-hoc block)

```typescript
const MIGRATIONS: Migration[] = [
  { id: 1, up: "ALTER TABLE print_tasks ADD COLUMN session_id TEXT" },
  { id: 2, up: "ALTER TABLE print_tasks ADD COLUMN instanceId INTEGER" },
  // ... remaining ADD COLUMN migrations for print_tasks ...
  { id: 3, up: "ALTER TABLE jobs ADD COLUMN project_id INTEGER REFERENCES projects(id)" },
  { id: 4, up: "ALTER TABLE jobs ADD COLUMN status_override TEXT" },
  { id: 5, up: "ALTER TABLE jobs ADD COLUMN extra_labor_minutes REAL" },
  { id: 6, up: "ALTER TABLE projects ADD COLUMN source_design_id TEXT" },
  { id: 7, up: `CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_source_design_id
                ON projects(source_design_id) WHERE source_design_id IS NOT NULL` },
  // DROP COLUMN requires SQLite >= 3.35 — handle as a function with version check
  { id: 8, up: (db) => { /* drop legacy columns from print_tasks if SQLite supports it */ } },
];
```

## What to keep vs. replace

- **Keep** `CREATE TABLE IF NOT EXISTS` blocks — they're already idempotent and
  serve as the canonical schema definition.
- **Keep** the seed data blocks (`INSERT OR IGNORE INTO machine_rates ...`) —
  these are data seeds, not schema changes, and are fine as-is.
- **Replace** the entire ad-hoc migration block (~lines 125–224 of current db.ts)
  with `runMigrations(db, MIGRATIONS)`.

## Open questions

- The old try/catch migrations have already run on the production DB. The new
  numbered migrations need to cover the same ground so a *fresh* DB gets the same
  schema. But they should NOT re-run on an existing DB. Since no `schema_migrations`
  table exists yet, the first deploy will apply all migrations — which is only safe
  if each migration is idempotent or the runner catches and logs errors (rather
  than silently swallowing them).
- The jobs-table rebuild migration (drop + recreate) is destructive. It was written
  when there was "no user data to preserve yet" — that's no longer true. This
  migration should be retired; it's a no-op on any DB that already has a
  `session_id` column.
- Assign migrations IDs that reflect their insertion order in git history, not the
  order they were added to the list. Gaps are fine; monotonically increasing is
  what matters.
