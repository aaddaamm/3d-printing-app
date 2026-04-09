# Test coverage gaps for critical business logic

## Effort: Medium
## Benefit: High

## Background

Several paths with real money consequences or subtle invariants have no tests.
Listed in priority order.

### 1. `autoGroupByDesign` manual-assignment safety (highest priority)

No test verifies that running `POST /projects/auto-group` does not overwrite a
manually assigned `project_id`. This invariant has already broken once (it's what
`cleanupJunkProjects` exists to fix). Even after the consolidation ticket is
resolved, this regression test should exist.

```ts
// assign a job manually, run autoGroupByDesign, assert project_id unchanged
```

### 2. `upsertMaterialRate` round-trip

No test catches the `waste_buffer_pct` unit mismatch (see separate ticket).
A round-trip test would have caught it immediately:

```ts
upsertMaterialRate({ filament_type: "PLA", cost_per_g: 0.028, waste_buffer_pct: 0.10 });
const rate = stmts.getMaterialRate.get("PLA")!;
expect(rate.rate_per_g).toBeCloseTo(0.028 * 1.10);
```

### 3. `rates/rates.ts` NaN/Infinity validation

Tests for the `PATCH /rates/*` routes that confirm `NaN` and `Infinity` are
rejected with 400. These would directly guard the fix in the `rates-nan-validation`
ticket.

### 4. Project pricing: one-labor-charge invariant

`buildProjectPrice` applies one labor charge for a project regardless of how many
jobs it has. A 3-job project should not cost 3× the labor minimum vs a 1-job project.

```ts
// project with 3 jobs → price < 3 × (single-job price at same weight/time)
```

### 5. `patchJob` merge semantics

`patchJob` only updates fields that are present in the patch (using `"field" in patch`).
Passing `null` should clear a field; omitting the key should leave it unchanged.
This distinction is easy to break in a refactor.

```ts
// set customer = "Acme", then patch with {}, assert customer still "Acme"
// set customer = "Acme", then patch with {customer: null}, assert customer null
```

### 6. `getSummary` null handling

`total_plates`, `total_weight_g`, etc. can be null from the DB when there are no
finished plates. The reducer handles this with `?? 0`, but no test covers an
all-failed or empty dataset.

### 7. `getAllJobPrices` with no filament data

When a job has no `job_filaments` rows, `getAllJobPrices` falls back to `"PLA"`.
A test with a bare job (no filament rows) should confirm it doesn't throw and
returns a valid price.
