# Show Calculated Price in the UI

## Background

The API has GET /jobs/:id/price which returns a full price breakdown
(material_cost, machine_cost, labor_cost, base_price, final_price, is_override).
The UI table currently shows no pricing information at all.

## Work

Option A — Price column in the table:
- Add a "Price" column showing final_price
- Could fetch prices lazily (on row expand/click) to avoid N+1 on page load
- Or: compute price server-side and include it in the /ui/data response

Option B — Price in job detail modal:
- When a row is clicked, show the full breakdown in the modal
  (material $X + machine $Y + labor $Z = base $W → final $P)

Option B is lower risk since it avoids adding price computation to the bulk
data query. The modal already exists and opens on row click.

## Notes

The bulk price query needs pricing config to be complete. If material/machine/labor
rates aren't set up, the endpoint throws. The UI should handle this gracefully.
