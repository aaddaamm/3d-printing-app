# CSV Export

## Background

For invoicing and bookkeeping it's useful to export the job list (optionally
filtered by date range or customer) as a CSV that can be opened in Numbers/Excel.

## Work

Add GET /jobs/export.csv (or /ui/export.csv) that accepts the same filters
as GET /jobs and returns a CSV with columns:

  date, title, printer, customer, status, filament_g, time_hrs, plates,
  material_cost, machine_cost, labor_cost, final_price, notes

The endpoint should set Content-Disposition: attachment; filename="jobs.csv"
so the browser downloads it directly.

## UI

Add an "Export CSV" button to the UI that constructs the URL with current
active filters applied so you get exactly what you're looking at.
