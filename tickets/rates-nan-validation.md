# Bug: NaN/Infinity bypass numeric validation in rates routes

## Effort: Small
## Benefit: Medium (data integrity)

## Background

All three rate PATCH handlers in `routes/rates.ts` validate numeric inputs with:

```ts
typeof v !== "number" || v < 0
```

`typeof NaN === "number"` is true, and `NaN < 0` is false, so `NaN` passes this
check. Same for `Infinity`. Both get written to the DB, and all subsequent pricing
calls silently return `NaN` for every job.

Affected routes:
- `PATCH /rates/labor` — `hourly_rate`, `minimum_minutes`, `profit_markup_pct`
- `PATCH /rates/machines/:device_model` — `purchase_price`, `lifetime_hrs`,
  `electricity_rate`, `maintenance_buffer`
- `PATCH /rates/materials/:filament_type` — `cost_per_g`, `waste_buffer_pct`

## Fix

Replace `typeof v !== "number"` with `!Number.isFinite(v)` in all three handlers.
`Number.isFinite` rejects `NaN`, `Infinity`, and `-Infinity`, and also rejects
non-numbers (returns false for strings, objects, etc.), so it subsumes the
`typeof` check:

```ts
// before
typeof hourly_rate !== "number" || hourly_rate < 0

// after
!Number.isFinite(hourly_rate) || hourly_rate < 0
```

## Also consider

Adding a reasonable upper bound (e.g. `hourly_rate > 10_000`) to catch fat-finger
inputs before they reach the DB.
