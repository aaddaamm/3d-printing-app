# Pricing Profiles and Batch Runs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add practical pricing profiles and batch-run costing for Robinson PrintWorks booth/Etsy/personal production decisions without turning PrintWorks into an ERP.

**Architecture:** Keep existing job/project pricing as print-session cost estimates. Add product-level pricing defaults, sales-channel pricing profiles, and batch runs that allocate setup labor, per-unit handling, packaging, material, machine time, and buffers across sellable units. Expose batch data through a small API and card-based product/batch UI.

**Tech Stack:** SQLite via better-sqlite3 migrations, pure TypeScript pricing helpers, Hono routes, Preact + htm frontend, Vitest.

## Global Constraints

- Keep current jobs/projects pricing intact for historical print costs.
- Add batch/product pricing as a layer above products and linked jobs.
- Support near-term channels: `personal`, `booth`, `etsy`; include `custom` as a placeholder profile but do not build custom quote workflow yet.
- No inventory ledger, SKU system, purchase orders, or full ERP scope.
- Batch pricing must calculate cost per sellable unit from completed quantity, not planned quantity.
- Failed quantity must affect unit economics through sellable-unit allocation.
- Booth pricing should not include Etsy fees; Etsy pricing should include Etsy/platform fees.
- Personal/internal prints should not require labor minimum or margin.
- Always run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` before completion.

---

## File Structure

- Modify `lib/db.ts` and `lib/db/migrations-list.ts`: pricing profiles, product pricing fields, batch tables.
- Create `lib/batch-pricing.ts`: pure batch/unit price calculations.
- Create `tests/batch-pricing.test.ts`: cost/margin/channel formula tests.
- Create `models/batches.ts`: batch CRUD and computed summaries.
- Create `routes/batches.ts`: API routes under `/api/batches`.
- Modify `api.ts`: mount batch routes.
- Modify `models/products.ts`: include product pricing defaults in product summaries.
- Modify `routes/products.ts`: allow updating product pricing defaults.
- Add frontend components:
  - `frontend/components/batches-view.ts`
  - `frontend/components/batch-card.ts`
  - `frontend/components/batch-detail-view.ts`
  - `frontend/components/batch-price-breakdown.ts`
- Modify `frontend/lib/api.ts` and `frontend/components/app-shell.ts`: API helpers and routes.
- Modify `README.md`: explain pricing profiles and batch-run workflow.

---

### Task 1: Pricing/Batch Schema

**Files:**

- Modify: `lib/db.ts`
- Modify: `lib/db/migrations-list.ts`
- Modify: `tests/catalog-schema.test.ts` or create `tests/batch-schema.test.ts`

**Interfaces:**

- Produces `pricing_profiles`.
- Produces `product_batches`.
- Produces `product_batch_jobs`.
- Adds product defaults: `booth_price`, `etsy_price`, `packaging_cost`, `handling_minutes`, `target_margin_pct`, `pricing_notes`.

- [ ] **Step 1: Write failing schema tests**

Assert these tables exist:

```ts
expect(tableNames()).toEqual(
  expect.arrayContaining(["pricing_profiles", "product_batches", "product_batch_jobs"]),
);
```

Assert seeded profiles:

```ts
expect(profileIds()).toEqual(["personal", "booth", "etsy", "custom"]);
expect(profile("personal")).toMatchObject({ target_margin_pct: 0, platform_fee_pct: 0 });
expect(profile("booth")).toMatchObject({ target_margin_pct: 0.5, platform_fee_pct: 0.035 });
expect(profile("etsy")).toMatchObject({ target_margin_pct: 0.55, platform_fee_pct: 0.13 });
```

Assert product pricing columns:

```ts
expect(columnNames("products")).toEqual(
  expect.arrayContaining([
    "booth_price",
    "etsy_price",
    "packaging_cost",
    "handling_minutes",
    "target_margin_pct",
    "pricing_notes",
  ]),
);
```

- [ ] **Step 2: Verify red**

Run:

```bash
npx vitest run tests/catalog-schema.test.ts
```

Expected: fails because tables/columns do not exist.

- [ ] **Step 3: Implement schema**

Add:

```sql
CREATE TABLE pricing_profiles (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  target_margin_pct REAL NOT NULL,
  platform_fee_pct REAL NOT NULL DEFAULT 0,
  failure_buffer_pct REAL NOT NULL DEFAULT 0,
  overhead_buffer_pct REAL NOT NULL DEFAULT 0,
  default_packaging_cost REAL NOT NULL DEFAULT 0,
  default_setup_minutes REAL NOT NULL DEFAULT 0,
  default_handling_minutes REAL NOT NULL DEFAULT 0,
  minimum_price REAL,
  rounding_mode TEXT NOT NULL DEFAULT 'friendly_99',
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL
);
```

Add:

```sql
CREATE TABLE product_batches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  pricing_profile_id TEXT NOT NULL REFERENCES pricing_profiles(id),
  planned_quantity INTEGER NOT NULL DEFAULT 1,
  completed_quantity INTEGER NOT NULL DEFAULT 0,
  failed_quantity INTEGER NOT NULL DEFAULT 0,
  material_type TEXT,
  primary_color TEXT,
  printer_id INTEGER REFERENCES printers(id),
  total_filament_g REAL,
  total_print_time_s INTEGER,
  setup_minutes REAL,
  handling_minutes_per_unit REAL,
  packaging_cost_per_unit REAL,
  target_margin_pct REAL,
  platform_fee_pct REAL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

Add:

```sql
CREATE TABLE product_batch_jobs (
  batch_id INTEGER NOT NULL REFERENCES product_batches(id) ON DELETE CASCADE,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL DEFAULT 'production',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (batch_id, job_id)
);
```

Seed exact profiles:

```txt
personal: margin 0, fee 0, failure 0, overhead 0, packaging 0, setup 0, handling 0, minimum null
booth: margin .50, fee .035, failure .08, overhead .05, packaging .75, setup 10, handling 3, minimum 5
etsy: margin .55, fee .13, failure .08, overhead .05, packaging 1.00, setup 10, handling 4, minimum 9.99
custom: margin .55, fee 0, failure .12, overhead .05, packaging 1.00, setup 15, handling 5, minimum 20
```

- [ ] **Step 4: Verify green**

Run:

```bash
npx vitest run tests/catalog-schema.test.ts
npm run typecheck
```

- [ ] **Step 5: Commit**

```bash
git add lib/db.ts lib/db/migrations-list.ts tests/catalog-schema.test.ts
git commit -m "feat: add batch pricing schema"
```

---

### Task 2: Pure Batch Pricing Engine

**Files:**

- Create: `lib/batch-pricing.ts`
- Create: `tests/batch-pricing.test.ts`

**Interfaces:**

```ts
export interface BatchPricingInput {
  completedQuantity: number;
  failedQuantity: number;
  totalFilamentG: number;
  totalPrintTimeS: number;
  materialRatePerG: number;
  machineRatePerHr: number;
  laborHourlyRate: number;
  setupMinutes: number;
  handlingMinutesPerUnit: number;
  packagingCostPerUnit: number;
  targetMarginPct: number;
  platformFeePct: number;
  failureBufferPct: number;
  overheadBufferPct: number;
  minimumPrice: number | null;
}
export interface BatchPricingBreakdown {
  sellableUnits: number;
  materialCost: number;
  machineCost: number;
  setupLaborCost: number;
  handlingLaborCost: number;
  packagingCost: number;
  subtotalCost: number;
  bufferCost: number;
  totalCost: number;
  unitCost: number;
  suggestedPrice: number;
  estimatedMarginPct: number;
}
export function calcBatchPricing(input: BatchPricingInput): BatchPricingBreakdown;
```

- [ ] **Step 1: Write failing tests**

Tests must cover:

```ts
expect(calcBatchPricing({ completedQuantity: 0, ... })).toThrow(/completed/i);
expect(result.sellableUnits).toBe(completedQuantity);
expect(result.unitCost).toBeCloseTo(result.totalCost / completedQuantity, 2);
expect(booth.suggestedPrice).toBeLessThan(etsy.suggestedPrice);
expect(personal.suggestedPrice).toBeCloseTo(personal.unitCost, 2);
expect(minimumPriceResult.suggestedPrice).toBe(9.99);
```

- [ ] **Step 2: Verify red**

Run:

```bash
npx vitest run tests/batch-pricing.test.ts
```

- [ ] **Step 3: Implement calculator**

Rules:

```txt
materialCost = totalFilamentG × materialRatePerG
machineCost = totalPrintTimeS / 3600 × machineRatePerHr
setupLaborCost = setupMinutes / 60 × laborHourlyRate
handlingLaborCost = completedQuantity × handlingMinutesPerUnit / 60 × laborHourlyRate
packagingCost = completedQuantity × packagingCostPerUnit
subtotalCost = material + machine + setup labor + handling labor + packaging
bufferCost = subtotalCost × (failureBufferPct + overheadBufferPct)
totalCost = subtotalCost + bufferCost
unitCost = totalCost / completedQuantity
suggestedPrice = unitCost / (1 - targetMarginPct - platformFeePct)
```

If margin+fee is >= 0.95, throw validation error.

Round suggested price to friendly `.99` above raw price, unless personal profile inputs have margin and fee both 0; then suggested price equals unit cost rounded to cents.

- [ ] **Step 4: Verify green**

Run:

```bash
npx vitest run tests/batch-pricing.test.ts
npm run typecheck
```

- [ ] **Step 5: Commit**

```bash
git add lib/batch-pricing.ts tests/batch-pricing.test.ts
git commit -m "feat: add batch pricing calculator"
```

---

### Task 3: Batch Model and API

**Files:**

- Create: `models/batches.ts`
- Create: `routes/batches.ts`
- Create: `tests/batches-model.test.ts`
- Create: `tests/batches-routes.test.ts`
- Modify: `api.ts`
- Modify: `models/products.ts`, `routes/products.ts`, `tests/products-model.test.ts`, `tests/products-routes.test.ts`

**Interfaces:**

```ts
export interface BatchSummary {
  id: number;
  product_id: number;
  product_name: string;
  pricing_profile_id: string;
  pricing_profile_label: string;
  planned_quantity: number;
  completed_quantity: number;
  failed_quantity: number;
  material_type: string | null;
  primary_color: string | null;
  total_filament_g: number | null;
  total_print_time_s: number | null;
  unit_cost: number | null;
  suggested_price: number | null;
  estimated_margin_pct: number | null;
  notes: string | null;
}
export function listBatches(): BatchSummary[];
export function getBatch(id: number): BatchSummary | null;
export function createBatch(input: CreateBatchInput): BatchSummary;
export function updateBatch(id: number, input: UpdateBatchInput): BatchSummary | null;
```

Routes:

```txt
GET /api/batches
POST /api/batches
GET /api/batches/:id
PATCH /api/batches/:id
POST /api/batches/:id/jobs
DELETE /api/batches/:id/jobs/:jobId
```

- [ ] **Step 1: Write failing tests**

Cover:

- create batch from product/profile defaults
- completed quantity cannot be negative and must be positive for computed pricing
- linked jobs can populate or supplement total filament/time if explicit totals are null
- Etsy profile suggested price exceeds booth profile for same costs
- route validation returns 400 for unknown product/profile IDs

- [ ] **Step 2: Verify red**

Run:

```bash
npx vitest run tests/batches-model.test.ts tests/batches-routes.test.ts
```

- [ ] **Step 3: Implement model/routes**

Keep v1 simple:

- explicit batch totals win over linked jobs
- if explicit totals are null, sum linked jobs `total_weight_g` and `total_time_s`
- material rate defaults to product `default_material`, batch `material_type`, or PLA
- machine rate defaults to product preferred printer if available, otherwise linked job machine/fallback
- use labor hourly rate from `labor_config`

- [ ] **Step 4: Extend product model fields**

Include product defaults in product summaries:

```txt
booth_price, etsy_price, packaging_cost, handling_minutes, target_margin_pct, pricing_notes
```

Allow PATCH updates for those fields.

- [ ] **Step 5: Verify green**

Run:

```bash
npx vitest run tests/batches-model.test.ts tests/batches-routes.test.ts tests/products-model.test.ts tests/products-routes.test.ts
npm run typecheck
npm run lint
```

- [ ] **Step 6: Commit**

```bash
git add models/batches.ts routes/batches.ts api.ts models/products.ts routes/products.ts tests/batches-model.test.ts tests/batches-routes.test.ts tests/products-model.test.ts tests/products-routes.test.ts
git commit -m "feat: add product batch API"
```

---

### Task 4: Batch UI and Product Pricing Fields

**Files:**

- Create: `frontend/components/batches-view.ts`
- Create: `frontend/components/batch-card.ts`
- Create: `frontend/components/batch-detail-view.ts`
- Create: `frontend/components/batch-price-breakdown.ts`
- Modify: `frontend/lib/api.ts`
- Modify: `frontend/components/app-shell.ts`
- Modify: `frontend/components/product-detail-view.ts`
- Modify: `frontend/app.css`
- Modify tests for frontend helpers where practical.

**Routes:**

```txt
/ui/batches
/ui/batches/:id
```

- [ ] **Step 1: Add API client types/helpers**

Add batch types and helpers to `frontend/lib/api.ts`.

- [ ] **Step 2: Add batch list/cards**

Cards show product, channel/profile, completed/failed quantity, unit cost, suggested price, and margin.

- [ ] **Step 3: Add batch detail form**

Fields:

```txt
product, pricing profile, planned/completed/failed quantity, material, color, total grams, total time, setup minutes, handling minutes, packaging cost, notes
```

- [ ] **Step 4: Add product pricing defaults to product detail**

Add fields:

```txt
booth price, Etsy price, packaging cost, handling minutes, target margin, pricing notes
```

- [ ] **Step 5: Add nav**

Add a `Batches` nav item near Products.

- [ ] **Step 6: Verify**

Run:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend frontend/dist tests
git commit -m "feat: add batch pricing UI"
```

---

### Task 5: Documentation and Final Verification

**Files:**

- Modify: `README.md`

- [ ] **Step 1: Document pricing modes**

Add concise docs for:

```txt
personal/internal cost
booth pricing
Etsy pricing
batch run unit cost
custom placeholder
```

- [ ] **Step 2: Full verification**

Run:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add README.md frontend/dist
git commit -m "docs: describe pricing profiles and batch runs"
```

---

## Self-Review

- Scope stays focused on pricing profiles and batch production runs.
- Custom requests are represented only by a placeholder profile; no quote builder is included.
- No spool inventory, SKU ledger, purchase order, or accounting workflow is included.
- Batch pricing uses completed/sellable quantity for unit economics.
- Marketplace fees are channel-specific rather than globally applied.
- Existing job/project pricing remains intact.
