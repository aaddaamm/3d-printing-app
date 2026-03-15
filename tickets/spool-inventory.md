# Spool Inventory Tracking

## Background

The original "3d Printing Business copy.numbers" spreadsheet has a spool inventory
sheet that tracks individual filament spools. Currently the system uses a per-material-
type flat rate (e.g. PLA = $0.0308/g) which averages across all spools of that type.
Spool inventory would allow exact cost tracking per spool.

## Spreadsheet fields (from the Numbers file)

- Spool ID (e.g. PINK-PLA-001)
- Brand (e.g. Overture, SANMATE)
- Material (e.g. Matte PLA, Glow PLA, Multi)
- Color
- Current Weight (g) — decremented as filament is used
- Cost per g
- Starting Weight (g)
- Total cost ($)
- Status (Open / finished)
- Notes

## Proposed implementation

### DB schema

```sql
CREATE TABLE spools (
  id            TEXT PRIMARY KEY,   -- e.g. "PINK-PLA-001"
  brand         TEXT,
  material      TEXT NOT NULL,      -- maps to material_rates.filament_type
  color         TEXT,
  starting_weight_g REAL NOT NULL,
  current_weight_g  REAL NOT NULL,
  cost_per_g    REAL NOT NULL,
  status        TEXT NOT NULL DEFAULT 'open',  -- open | finished | empty
  notes         TEXT
);
```

### Linking spools to jobs

The Bambu API returns AMS slot data per task (already stored in `job_filaments`).
`job_filaments.color` (hex) and `job_filaments.filament_type` could be used to
match a spool by color+material, but this is ambiguous when multiple spools of the
same color/material are loaded.

Better option: allow the user to manually assign a spool_id to a job_filament row
via the UI, or provide a default assignment based on the active spool for that slot
at job start time.

### Pricing impact

When a spool is assigned, use that spool's `cost_per_g` instead of the material_rates
flat rate. Decrement `current_weight_g` by the job's filament weight after assignment.

### UI

- Spool management page (list, add, edit, mark finished)
- Job detail view shows assigned spool(s) and exact cost
- Warning when a job's filament type has no matching open spool

### Open questions

- How to handle multi-material jobs (multiple spools)?
- Should spool assignment be automatic (best-guess by color) or always manual?
- What happens when a spool runs out mid-job?
