# Rates / Settings Page in the UI

## Background

Material rates, machine rates, and labor config live in the DB and can only be
changed via direct SQL or the REST API. There's no UI for it.

## Work

Add a settings page (or modal) at /ui/settings with:

### Material rates table
- filament_type, cost_per_g, waste_buffer_pct, rate_per_g (computed, read-only)
- Add / edit / delete rows

### Machine rates table  
- device_model, purchase_price, lifetime_hrs, electricity_rate ($/hr),
  maintenance_buffer ($/hr), machine_rate_per_hr (computed, read-only)
- Add / edit rows (Bambu printers show up automatically from print history,
  but their rates need to be set manually)

### Labor config
- hourly_rate, minimum_minutes, profit_markup_pct
- Single editable row

## API work needed

The rates route (GET /rates) exists for reading. Need to add:
- PUT /rates/materials/:type
- PUT /rates/machines/:model  
- PUT /rates/labor
- DELETE /rates/materials/:type (for cleanup)
