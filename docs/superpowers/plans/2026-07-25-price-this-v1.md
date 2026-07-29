# Price This V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a usable Price-this flow that selects related jobs across providers, includes failed production costs, calculates direct/Etsy unit prices, and copies a concise quote summary.

**Architecture:** Refactor the existing batch calculator around one shared production-pricing primitive, then add a read-only quote model/API that resolves actual task-level material and printer costs for selected jobs. Add a `/price` frontend route that edits quantity/labor/extras, calls the quote API, displays the breakdown and warnings, and is reachable from every job card/row. This increment deliberately does not persist quotes or alter Projects.

**Tech Stack:** TypeScript, better-sqlite3, Hono, Preact 10 + htm, Vitest, existing pricing profiles and rate tables.

## Global Constraints

- Follow TDD: every production behavior must be preceded by a focused failing test that is observed failing for the expected reason.
- Keep imported jobs/tasks immutable; Price-this is a calculation over selected IDs.
- Include successful, failed, and cancelled task costs in manufacturing cost; report non-finished cost separately as production loss.
- Use printer-specific machine rates and filament-specific material rates when available.
- Surface every fallback as a warning in the quote response and UI.
- Direct and Etsy calculations share manufacturing cost; only channel fee assumptions differ.
- Do not add dependencies or replace Preact + htm.
- Do not modify or stage the unrelated existing changes in `.gitignore`, `eslint.config.js`, or `tests/media-urls.test.ts`.
- Run `npm run lint`, `npm run typecheck`, and `npm test` before completion.

## File structure

- Create `lib/production-pricing.ts` — shared pure manufacturing cost and channel recommendation contract.
- Modify `lib/batch-pricing.ts` — compatibility adapter for existing saved batch pricing.
- Create `models/price-quotes.ts` — selected-job validation, task-level cost resolution, warnings, and direct/Etsy quote assembly.
- Create `routes/price-quotes.ts` — Hono request validation for read-only quote calculation.
- Modify `api.ts` — mount `/api/price-quotes`.
- Create `frontend/components/price-this-helpers.ts` — query parsing, selection filtering, request construction, and copied summary formatting.
- Create `frontend/components/price-this-view.ts` — three-section Price-this form/result UI.
- Modify `frontend/lib/api.ts` — shared quote request/response types and API call.
- Modify `frontend/components/app-shell.ts` — `/price` route and view rendering.
- Modify `frontend/components/jobs-view.ts` — Price-this actions on job rows/cards.
- Modify `frontend/app.ts` — pass navigation callback to job views.
- Add focused tests under `tests/` for the pure calculator, quote model, route, helpers, and routing/action behavior.

---

### Task 1: Shared production-pricing primitive

**Files:**

- Create: `lib/production-pricing.ts`
- Modify: `lib/batch-pricing.ts`
- Test: `tests/production-pricing.test.ts`
- Test: `tests/batch-pricing.test.ts`

**Interfaces:**

- Consumes: numeric cost inputs already derived by a caller.
- Produces:

```ts
export interface ProductionPricingInput {
  sellableUnits: number;
  materialCost: number;
  machineCost: number;
  productionLossCost: number;
  laborHourlyRate: number;
  batchLaborMinutes: number;
  perUnitLaborMinutes: number;
  packagingCostPerUnit: number;
  extraCost: number;
  targetMarginPct: number;
  platformFeePct: number;
  fixedFeePerOrder: number;
  failureBufferPct: number;
  overheadBufferPct: number;
  minimumPrice: number | null;
}

export interface ProductionPricingBreakdown {
  sellableUnits: number;
  materialCost: number;
  machineCost: number;
  productionLossCost: number;
  batchLaborCost: number;
  perUnitLaborCost: number;
  packagingCost: number;
  extraCost: number;
  subtotalCost: number;
  bufferCost: number;
  totalCost: number;
  unitCost: number;
  minimumViablePrice: number;
  suggestedPrice: number;
  profitPerUnit: number;
  profitPerBatch: number;
  estimatedMarginPct: number;
}

export function calcProductionPricing(input: ProductionPricingInput): ProductionPricingBreakdown;
```

- `calcBatchPricing(input: BatchPricingInput)` remains source-compatible and delegates to `calcProductionPricing` after deriving material and machine costs.

- [ ] **Step 1: Write failing pure-calculator tests**

Add literal expectations proving that loss cost is informational but already included in material/machine totals, extras are included once, labor scales correctly, direct and Etsy preserve the same manufacturing cost, and zero units are rejected:

```ts
const manufacturing = {
  sellableUnits: 4,
  materialCost: 12,
  machineCost: 8,
  productionLossCost: 5,
  laborHourlyRate: 30,
  batchLaborMinutes: 10,
  perUnitLaborMinutes: 3,
  packagingCostPerUnit: 0.5,
  extraCost: 4,
  targetMarginPct: 0.5,
  platformFeePct: 0,
  fixedFeePerOrder: 0,
  failureBufferPct: 0,
  overheadBufferPct: 0,
  minimumPrice: null,
};

expect(calcProductionPricing(manufacturing)).toMatchObject({
  productionLossCost: 5,
  batchLaborCost: 5,
  perUnitLaborCost: 6,
  packagingCost: 2,
  extraCost: 4,
  totalCost: 37,
  unitCost: 9.25,
  minimumViablePrice: 9.25,
});
```

- [ ] **Step 2: Verify RED**

Run:

```bash
npx vitest run tests/production-pricing.test.ts tests/batch-pricing.test.ts
```

Expected: failure because `lib/production-pricing.ts` and `calcProductionPricing` do not exist.

- [ ] **Step 3: Implement the shared calculator**

Use the existing friendly `.99` recommendation and margin formula. Validate every numeric input as finite/nonnegative, require `sellableUnits` to be a positive integer, and require `targetMarginPct + platformFeePct < 0.95`. Compute:

```ts
const batchLaborCost = (input.batchLaborMinutes / 60) * input.laborHourlyRate;
const perUnitLaborCost =
  (input.sellableUnits * input.perUnitLaborMinutes * input.laborHourlyRate) / 60;
const packagingCost = input.sellableUnits * input.packagingCostPerUnit;
const subtotalCost =
  input.materialCost +
  input.machineCost +
  batchLaborCost +
  perUnitLaborCost +
  packagingCost +
  input.extraCost;
```

`productionLossCost` must not be added again because it is a subset of `materialCost + machineCost`.

- [ ] **Step 4: Convert batch pricing into an adapter**

In `calcBatchPricing`, derive `materialCost` and `machineCost` from its legacy weights/rates, call `calcProductionPricing`, and map `batchLaborCost` to `setupLaborCost` and `perUnitLaborCost` to `handlingLaborCost`. Existing `BatchPricingBreakdown` and all current tests remain unchanged.

- [ ] **Step 5: Verify GREEN**

Run:

```bash
npx vitest run tests/production-pricing.test.ts tests/batch-pricing.test.ts
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add lib/production-pricing.ts lib/batch-pricing.ts tests/production-pricing.test.ts tests/batch-pricing.test.ts
git commit -m "refactor: share production pricing calculations"
```

---

### Task 2: Resolve selected jobs into actual production costs

**Files:**

- Create: `models/price-quotes.ts`
- Test: `tests/price-quotes-model.test.ts`

**Interfaces:**

- Consumes:

```ts
export type PriceQuoteRequest = {
  job_ids: number[];
  sellable_units: number;
  batch_labor_minutes: number;
  per_unit_labor_minutes: number;
  packaging_cost_per_unit: number;
  extra_cost: number;
  channel: "direct" | "etsy";
  target_margin_pct?: number;
};
```

- Produces:

```ts
export type QuoteAttempt = {
  job_id: number;
  title: string;
  status: string;
  printer: string;
  material_cost: number;
  machine_cost: number;
  production_loss_cost: number;
};

export type PriceQuoteResult = {
  channel: "direct" | "etsy";
  assumptions: {
    labor_hourly_rate: number;
    target_margin_pct: number;
    platform_fee_pct: number;
    fixed_fee_per_order: number;
  };
  attempts: QuoteAttempt[];
  warnings: string[];
  breakdown: ProductionPricingBreakdown;
};

export class PriceQuoteValidationError extends Error {}

export function calculatePriceQuote(input: PriceQuoteRequest): PriceQuoteResult;
```

- [ ] **Step 1: Write failing model integration tests**

Use a temporary SQLite DB following `tests/batches-model.test.ts`. Seed two machine rates, PLA/PETG rates, one successful Bambu job, and one cancelled Moonraker job with print tasks and filament rows. Assert:

```ts
expect(result.attempts.map((attempt) => attempt.job_id)).toEqual([successJobId, failedJobId]);
expect(result.breakdown.productionLossCost).toBeGreaterThan(0);
expect(result.breakdown.materialCost + result.breakdown.machineCost).toBeGreaterThanOrEqual(
  result.breakdown.productionLossCost,
);
expect(result.warnings).toEqual([]);
```

Add cases for duplicate IDs being normalized, unknown IDs rejecting the whole request, zero units, mixed printer rates, filament fallback warnings, and missing machine-rate warnings.

- [ ] **Step 2: Verify RED**

Run:

```bash
npx vitest run tests/price-quotes-model.test.ts
```

Expected: failure because `models/price-quotes.ts` does not exist.

- [ ] **Step 3: Implement validation and deterministic ordering**

Normalize `job_ids` to unique positive integers while preserving input order. Reject an empty selection, non-integers, unknown jobs, non-positive `sellable_units`, negative labor/extras, and invalid margin overrides with `PriceQuoteValidationError`.

- [ ] **Step 4: Implement task-level cost resolution**

For each selected job, load all `print_tasks` in its session, including non-finished tasks. For each task:

1. Material cost: sum `job_filaments.weight_g × material_rates.cost_per_g` when filament rows exist.
2. Material fallback: when no usable filament rows exist, use `print_tasks.weight × PLA fallback rate` and append a warning naming the job/task.
3. Machine cost: use `print_tasks.costTime / 3600 × machine_rates.machine_rate_per_hr` matched by task/job printer model.
4. Machine fallback: use the existing fallback machine rate and append a warning naming the job/task.
5. Production loss: when task status is not `finish`, include that task's material + machine cost in `productionLossCost`.

Aggregate task costs into one `QuoteAttempt` per selected job and into the shared calculator input.

- [ ] **Step 5: Apply channel assumptions**

Use the `booth` profile's target margin as the direct default but force direct fees to zero. Use the `etsy` profile's target margin, percentage fee, and fixed fee for Etsy. Use `labor_config.hourly_rate` for labor. Pass a request `target_margin_pct` override when present.

- [ ] **Step 6: Verify GREEN**

Run:

```bash
npx vitest run tests/price-quotes-model.test.ts tests/production-pricing.test.ts tests/batch-pricing.test.ts
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add models/price-quotes.ts tests/price-quotes-model.test.ts
git commit -m "feat: calculate quotes from selected print attempts"
```

---

### Task 3: Price-quote HTTP API

**Files:**

- Create: `routes/price-quotes.ts`
- Modify: `api.ts`
- Test: `tests/price-quotes-routes.test.ts`

**Interfaces:**

- Endpoint: `POST /api/price-quotes/calculate`
- Body: `PriceQuoteRequest`
- Success: `200 { quote: PriceQuoteResult }`
- Validation failure: `400 { error: string }`

- [ ] **Step 1: Write failing route tests**

Mock `calculatePriceQuote` and assert a valid body is forwarded exactly. Add literal `400` cases for invalid JSON, unknown fields, empty/missing `job_ids`, invalid channel, and nonnumeric form values. Assert `PriceQuoteValidationError` maps to `400`.

- [ ] **Step 2: Verify RED**

Run:

```bash
npx vitest run tests/price-quotes-routes.test.ts
```

Expected: failure because the route does not exist.

- [ ] **Step 3: Implement route validation**

Allow exactly:

```ts
const PRICE_QUOTE_FIELDS = [
  "job_ids",
  "sellable_units",
  "batch_labor_minutes",
  "per_unit_labor_minutes",
  "packaging_cost_per_unit",
  "extra_cost",
  "channel",
  "target_margin_pct",
] as const;
```

Require arrays/numbers at the HTTP boundary; semantic bounds remain in the model. Never coerce strings to numbers.

- [ ] **Step 4: Mount the route**

Add:

```ts
import { priceQuotes } from "./routes/price-quotes.js";
// ...
app.route("/api/price-quotes", priceQuotes);
```

- [ ] **Step 5: Verify GREEN**

Run:

```bash
npx vitest run tests/price-quotes-routes.test.ts tests/price-quotes-model.test.ts
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add routes/price-quotes.ts api.ts tests/price-quotes-routes.test.ts
git commit -m "feat: expose price quote calculation API"
```

---

### Task 4: Frontend quote contracts and pure helpers

**Files:**

- Modify: `frontend/lib/api.ts`
- Create: `frontend/components/price-this-helpers.ts`
- Test: `tests/price-this-helpers.test.ts`

**Interfaces:**

- Export `PriceQuoteRequest`, `PriceQuoteResult`, and:

```ts
export async function calculatePriceQuote(
  input: PriceQuoteRequest,
): Promise<PriceQuoteResult | null>;
```

- Export helpers:

```ts
export function parsePriceJobIds(search: string): number[];
export function filterPriceCandidateJobs(
  jobs: Job[],
  query: string,
  selectedIds: Set<number>,
): Job[];
export function formatPriceQuoteForClipboard(quote: PriceQuoteResult): string;
```

- [ ] **Step 1: Write failing helper tests**

Use literal cases:

```ts
expect(parsePriceJobIds("?jobIds=12,7,12,nope")).toEqual([12, 7]);
expect(formatPriceQuoteForClipboard(quote)).toContain("Recommended Etsy price: $19.99 per unit");
expect(formatPriceQuoteForClipboard(quote)).toContain("Production loss: $3.25");
```

Assert filtering searches title/printer/status and excludes selected jobs.

- [ ] **Step 2: Verify RED**

Run:

```bash
npx vitest run tests/price-this-helpers.test.ts
```

Expected: failure because the helper module does not exist.

- [ ] **Step 3: Add API types and request helper**

`calculatePriceQuote` posts to `/api/price-quotes/calculate` with `postJsonOrToast`, returning `data.quote ?? null`.

- [ ] **Step 4: Implement pure helpers**

Keep clipboard output concise and spouse-friendly:

```text
Green Ranger Dagger
10 production attempts · 1 sellable unit
Manufacturing cost: $42.18 per unit
Production loss: $6.73
Recommended Etsy price: $89.99 per unit
Expected profit: $35.41 per unit (39.3% margin)
```

Use the first attempt title as the heading and include warnings only when present.

- [ ] **Step 5: Verify GREEN**

Run:

```bash
npx vitest run tests/price-this-helpers.test.ts
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add frontend/lib/api.ts frontend/components/price-this-helpers.ts tests/price-this-helpers.test.ts
git commit -m "feat: add price quote frontend contracts"
```

---

### Task 5: Price-this view and route

**Files:**

- Create: `frontend/components/price-this-view.ts`
- Modify: `frontend/components/app-shell.ts`
- Modify: `frontend/app.ts`
- Modify: `frontend/app.css`
- Test: `tests/app-shell-routes.test.ts`
- Test: `tests/price-this-view.test.ts`

**Interfaces:**

- Route: `/ui/price?jobIds=12,7`
- Component:

```ts
export function PriceThisView({
  jobs,
  initialJobIds,
  navigate,
}: {
  jobs: Job[];
  initialJobIds: number[];
  navigate: (path: string) => void;
});
```

- [ ] **Step 1: Write failing route tests**

Extend route tests so `/price` sets `isPrice: true`, does not require a numeric detail ID, and still requires dashboard bootstrap because the view consumes imported jobs.

- [ ] **Step 2: Write failing view-state tests**

Add these pure helpers to `price-this-helpers.ts` and test them without introducing a DOM test dependency:

```ts
export type PriceThisDraft = {
  selectedJobIds: number[];
  sellableUnits: number;
  batchLaborMinutes: number;
  perUnitLaborMinutes: number;
  packagingCostPerUnit: number;
  extraCost: number;
  channel: "direct" | "etsy";
};

export function initialPriceThisDraft(jobIds: number[]): PriceThisDraft;
export function canCalculatePriceQuote(draft: PriceThisDraft): boolean;
export function togglePriceJob(draft: PriceThisDraft, jobId: number): PriceThisDraft;
```

Assert initial IDs are preserved/deduplicated, add/remove is immutable, calculation requires at least one selected job and a positive integer quantity, and channel/input values are mapped into `PriceQuoteRequest`. Result/warning rendering and clipboard behavior remain covered by helper assertions plus the live verification in Task 6.

- [ ] **Step 3: Verify RED**

Run:

```bash
npx vitest run tests/app-shell-routes.test.ts tests/price-this-view.test.ts
```

Expected: failures because the route/component do not exist.

- [ ] **Step 4: Implement the three-section view**

Build one focused page with:

1. **Production attempts** — selected cards, remove controls, candidate search/add.
2. **Output and labor** — sellable units, batch labor, per-unit labor, packaging per unit, extras.
3. **Price result** — Direct/Etsy segmented control, calculate button, breakdown, warnings, and Copy price summary.

Use existing `toast()` and `copyTextToClipboard`; do not use `alert()` or `confirm()`.

- [ ] **Step 5: Wire routing**

Add `isPrice` to `RouteState`, render `PriceThisView` before the default Jobs route, parse `window.location.search` through `parsePriceJobIds`, and pass the bootstrapped `jobs` array.

- [ ] **Step 6: Add scoped responsive styles**

Add `.price-this-*` classes only. On narrow screens, stack attempt selection, inputs, and result cards; preserve visible labels and keyboard focus states.

- [ ] **Step 7: Verify GREEN**

Run:

```bash
npx vitest run tests/app-shell-routes.test.ts tests/price-this-view.test.ts tests/price-this-helpers.test.ts
```

Expected: all tests pass.

- [ ] **Step 8: Commit**

```bash
git add frontend/components/price-this-view.ts frontend/components/app-shell.ts frontend/app.ts frontend/app.css tests/app-shell-routes.test.ts tests/price-this-view.test.ts
git commit -m "feat: add price this workflow"
```

---

### Task 6: Job entry actions and end-to-end verification

**Files:**

- Modify: `frontend/components/jobs-view.ts`
- Modify: `frontend/components/app-shell.ts`
- Test: `tests/jobs-view.test.ts`
- Modify: `scripts/smoke-test.ts`

**Interfaces:**

- `TableView` and `GridView` receive `onPriceJob(job: Job): void`.
- Job action navigates to `/price?jobIds=<job.id>` without opening the job-detail modal.

- [ ] **Step 1: Write failing action tests**

Export one shared handler used by both row and card actions:

```ts
export function handlePriceJobAction(
  event: Pick<Event, "stopPropagation">,
  job: Job,
  onPriceJob: (job: Job) => void,
): void;
```

Using a real function spy for `stopPropagation` and `onPriceJob`, assert the handler stops row/card propagation and forwards the exact job once. Both rendered actions must call this shared handler; browser verification confirms the modal does not open.

- [ ] **Step 2: Verify RED**

Run:

```bash
npx vitest run tests/jobs-view.test.ts
```

Expected: failure because the Price-this actions and callback do not exist.

- [ ] **Step 3: Add row/card actions**

Add a compact **Price this** action next to existing copy/product actions. Pass:

```ts
onPriceJob={(job) => navigate(`/price?jobIds=${job.id}`)}
```

through `JobsRouteView`, `renderJobsBody`, `TableView`, and `GridView`.

- [ ] **Step 4: Extend smoke coverage**

Add a smoke request against `POST /api/price-quotes/calculate` using one existing job ID when available. Assert `quote.breakdown.unitCost` and `quote.breakdown.suggestedPrice` are finite positive numbers; skip with an explicit message only when the DB has no jobs.

- [ ] **Step 5: Run focused tests**

```bash
npx vitest run tests/production-pricing.test.ts tests/batch-pricing.test.ts tests/price-quotes-model.test.ts tests/price-quotes-routes.test.ts tests/price-this-helpers.test.ts tests/price-this-view.test.ts tests/app-shell-routes.test.ts tests/jobs-view.test.ts
```

Expected: all tests pass.

- [ ] **Step 6: Run proactive diagnostics**

Run LSP diagnostics on all changed TypeScript files before builds. Fix every error.

- [ ] **Step 7: Run required repository verification**

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 8: Perform live local verification**

With the existing dev server, open one known print, choose **Price this**, add related cross-provider jobs, set quantity/labor, compare Direct and Etsy, verify production loss is visible, and copy the summary. Confirm the Jobs and Projects routes still behave normally.

- [ ] **Step 9: Commit**

```bash
git add frontend/components/jobs-view.ts frontend/components/app-shell.ts tests/jobs-view.test.ts scripts/smoke-test.ts
git commit -m "feat: launch pricing from print history"
```

---

## Deferred follow-up plans

The following approved-spec work is intentionally outside this first executable slice and should receive its own plan after Price-this v1 is verified with real shop data:

1. Persist one-off quote snapshots and saved rate assumptions.
2. Save a quote as a Product production batch without recreating inputs.
3. Compare historical batch/unit costs for a Product.
4. Add reusable component/extras line-item defaults.
5. Demote Projects in primary navigation after pricing parity is proven.
6. Implement issue #44 project merging as cleanup tooling.
