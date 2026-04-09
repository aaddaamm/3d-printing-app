# Bug: waste_buffer_pct unit mismatch in upsertMaterialRate

## Effort: Small
## Benefit: Critical (financial correctness)

## Background

`models/rates.ts::upsertMaterialRate` computes:

```ts
const rate_per_g = data.cost_per_g * (1 + data.waste_buffer_pct / 100);
```

But the DB seeds in `lib/db.ts` store `waste_buffer_pct` as a **fraction** (e.g. `0.10`
for 10%), not a percent (`10`). The PLA-S seed added recently confirms this:

```ts
// lib/db.ts — seeds waste_buffer_pct = 0.10
.run(Number((0.034 * 1.1).toFixed(4)));  // 0.034 * (1 + 0.10)
```

So when a user calls `PATCH /rates/materials/PLA` with `{ waste_buffer_pct: 0.10 }`,
`upsertMaterialRate` computes:

```
rate_per_g = 0.028 * (1 + 0.10 / 100) = 0.028 * 1.001  // ≈ $0.02803/g
```

instead of the correct:

```
rate_per_g = 0.028 * (1 + 0.10)       = 0.028 * 1.10   // ≈ $0.03080/g
```

The material waste buffer contributes ~10% to filament cost. This bug silently drops
that buffer to ~0.1%, causing ~9% undercharging on every print after any material
rate is updated via the API.

## Fix

Remove the `/ 100` in `models/rates.ts:upsertMaterialRate`:

```ts
const rate_per_g = data.cost_per_g * (1 + data.waste_buffer_pct);
```

The convention is: `waste_buffer_pct` is a fraction (0.10 = 10%). This matches
the DB seeds, the manual seed math, and `lib/pricing.ts` which never divides by 100.

## Also update

- The `PATCH /rates/materials/:filament_type` docs (or a comment in `routes/rates.ts`)
  should note that `waste_buffer_pct` is a fraction, not a percent, to prevent
  future confusion.
- Add a round-trip test: seed a material rate, PATCH it, GET it back, assert
  `rate_per_g ≈ cost_per_g * (1 + waste_buffer_pct)`.
