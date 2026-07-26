# Saved Product Pricing and Identification Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Save Price-this calculations as immutable Direct/Etsy Product batch snapshots and give each publishable Product an automatically ranked, manually overridable identification image.

**Architecture:** A transactional `saved-product-pricing` model recalculates both channels from trusted inputs, writes one production Batch plus two immutable snapshots, and projects current prices onto the Product. A separate Product-image domain ranks persisted/manual media, source images, catalog previews, generated contact sheets, and print covers; app-owned image processing uses Sharp and remains non-blocking relative to pricing persistence.

**Tech Stack:** TypeScript, Node.js 24, Hono, better-sqlite3, Preact 10 + htm, Vite, Sharp, Vitest, ESLint, Prettier.

## Global Constraints

- Only pricing explicitly saved to a Product is eligible for the Sales Companion.
- `sales_companion_visible` defaults to false and requires explicit user action.
- The backend receives pricing inputs and identifiers only; it never trusts client-calculated totals.
- Every saved Batch contains immutable Direct and Etsy snapshots from the same manufacturing inputs.
- Existing `main_photo_id` values migrate to Manual mode and are never silently replaced.
- Auto image priority is manual upload, supported public source hero, catalog/3MF preview, multi-plate contact sheet, single cached print cover, placeholder.
- Image enrichment failure must not roll back or block a valid pricing save.
- Remote enrichment supports public HTTPS provider pages only; no authenticated Cubee scraping.
- Product images are private identification media, not Etsy marketing approval.
- Frontend feedback uses `toast()` and never `alert()` or `confirm()`.
- Preserve unrelated working-tree changes in `.gitignore`, `docs/superpowers/plans/2026-07-25-price-this-v1.md`, `eslint.config.js`, and `tests/media-urls.test.ts`.
- Before the final commit, run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.

---

## File Structure

### New backend files

- `models/saved-product-pricing.ts` — validate a save request, calculate both channels, persist Product/Batch/jobs/snapshots transactionally, and query immutable pricing history.
- `models/product-images.ts` — discover/rank image candidates, persist candidate provenance, and enforce Auto/Manual selection.
- `lib/product-image-files.ts` — safe app-owned paths, Sharp re-encoding, upload storage, and deterministic contact-sheet generation.
- `lib/remote-product-images.ts` — supported-provider page metadata resolution, SSRF-safe public fetching, and source-image caching.

### New frontend files

- `frontend/components/save-price-to-product-modal.ts` — existing/new Product choice and save submission.
- `frontend/components/product-pricing-history.ts` — latest Direct/Etsy cards and immutable Batch history.
- `frontend/components/product-image-panel.ts` — current image, provenance, candidate picker, upload, Auto/Manual controls.

### Existing files changed

- `lib/db.ts`, `lib/db/migrations-list.ts` — migration 20 and fresh-schema parity.
- `models/price-quotes.ts` — include complete buffer and resolved-rate assumptions.
- `models/products.ts` — expose designer, image/publication fields, and current image provenance.
- `routes/price-quotes.ts`, `routes/products.ts`, `routes/ui.ts` — save/history/image/media endpoints.
- `frontend/lib/api.ts` — shared request/response contracts and API calls.
- `frontend/components/price-this-view.ts` — Save to Product action.
- `frontend/components/product-detail-view.ts` — pricing, image, and publication sections.
- `frontend/app.css` — responsive modal, pricing cards, candidate picker, and image states.
- `package.json`, `package-lock.json` — Sharp dependency.
- `scripts/smoke-test.ts`, `README.md` — integration proof and local image-storage documentation.

---

### Task 1: Add the saved-pricing and image-selection schema

**Files:**

- Modify: `lib/db.ts`
- Modify: `lib/db/migrations-list.ts`
- Create: `tests/product-foundation-schema.test.ts`
- Modify: `tests/migrations.test.ts`

**Interfaces:**

- Produces: migration `20`, `product_price_snapshots`, Product publication/image-mode columns, Batch source/extra columns, and Product-photo provenance columns.
- Consumes: `addColumnIfMissing(database, table, column, definition)` and existing numbered migration runner.

- [ ] **Step 1: Write the failing schema tests**

Create a temporary SQLite DB through the same fresh-module pattern used by `tests/products-model.test.ts`, then assert:

```ts
const productColumns = db.prepare("PRAGMA table_info(products)").all() as Array<{ name: string }>;
expect(productColumns.map(({ name }) => name)).toEqual(
  expect.arrayContaining(["sales_companion_visible", "image_selection_mode"]),
);

const snapshotSql = db
  .prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'product_price_snapshots'")
  .get() as { sql: string };
expect(snapshotSql.sql).toContain("UNIQUE (batch_id, channel)");

const product = db
  .prepare("SELECT sales_companion_visible, image_selection_mode FROM products LIMIT 1")
  .get();
expect(product).toMatchObject({ sales_companion_visible: 0, image_selection_mode: "auto" });
```

Add a migration fixture with a pre-existing Product whose `main_photo_id` is non-null and assert migration 20 sets only that Product to `image_selection_mode = 'manual'`.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- tests/product-foundation-schema.test.ts tests/migrations.test.ts`

Expected: FAIL because migration 20 and the new columns/table do not exist.

- [ ] **Step 3: Implement migration 20 and fresh-schema parity**

Add these Product columns:

```sql
sales_companion_visible INTEGER NOT NULL DEFAULT 0 CHECK (sales_companion_visible IN (0, 1))
image_selection_mode TEXT NOT NULL DEFAULT 'auto' CHECK (image_selection_mode IN ('auto', 'manual'))
```

Add these Batch columns:

```sql
source_type TEXT NOT NULL DEFAULT 'planned' CHECK (source_type IN ('planned', 'price_quote'))
extra_cost REAL NOT NULL DEFAULT 0
```

Add these `product_photos` columns:

```sql
source_type TEXT NOT NULL DEFAULT 'manual_upload'
source_ref TEXT
candidate_key TEXT
is_app_owned INTEGER NOT NULL DEFAULT 0 CHECK (is_app_owned IN (0, 1))
content_type TEXT
width INTEGER
height INTEGER
```

Create the immutable table:

```sql
CREATE TABLE IF NOT EXISTS product_price_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  batch_id INTEGER NOT NULL REFERENCES product_batches(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('direct', 'etsy')),
  snapshot_version INTEGER NOT NULL DEFAULT 1,
  target_margin_pct REAL NOT NULL,
  platform_fee_pct REAL NOT NULL,
  fixed_fee_per_order REAL NOT NULL,
  labor_hourly_rate REAL NOT NULL,
  material_cost REAL NOT NULL,
  machine_cost REAL NOT NULL,
  production_loss_cost REAL NOT NULL,
  batch_labor_cost REAL NOT NULL,
  per_unit_labor_cost REAL NOT NULL,
  packaging_cost REAL NOT NULL,
  extra_cost REAL NOT NULL,
  subtotal_cost REAL NOT NULL,
  buffer_cost REAL NOT NULL,
  total_cost REAL NOT NULL,
  unit_cost REAL NOT NULL,
  minimum_viable_price REAL NOT NULL,
  suggested_price REAL NOT NULL,
  profit_per_unit REAL NOT NULL,
  profit_per_batch REAL NOT NULL,
  estimated_margin_pct REAL NOT NULL,
  input_json TEXT NOT NULL,
  assumptions_json TEXT NOT NULL,
  warnings_json TEXT NOT NULL,
  breakdown_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (batch_id, channel)
)
```

Create indexes:

```sql
CREATE INDEX IF NOT EXISTS idx_products_sales_companion_visible
  ON products(sales_companion_visible) WHERE sales_companion_visible = 1;
CREATE INDEX IF NOT EXISTS idx_product_price_snapshots_batch_created
  ON product_price_snapshots(batch_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_photos_candidate
  ON product_photos(product_id, candidate_key) WHERE candidate_key IS NOT NULL;
```

After adding `image_selection_mode`, run:

```sql
UPDATE products
SET image_selection_mode = 'manual'
WHERE main_photo_id IS NOT NULL;
```

Mirror the resulting schema in `lib/db.ts`; keep migration 20 idempotent with `addColumnIfMissing`.

- [ ] **Step 4: Run schema tests**

Run: `npm test -- tests/product-foundation-schema.test.ts tests/migrations.test.ts`

Expected: PASS, including fresh database, upgrade, existing-photo preservation, and second-run idempotency cases.

- [ ] **Step 5: Commit**

```bash
git add lib/db.ts lib/db/migrations-list.ts tests/product-foundation-schema.test.ts tests/migrations.test.ts
git commit -m "feat: add saved product pricing schema"
```

---

### Task 2: Preserve complete quote assumptions

**Files:**

- Modify: `models/price-quotes.ts`
- Modify: `frontend/lib/api.ts`
- Modify: `tests/price-quotes-model.test.ts`
- Modify: `tests/price-quotes-routes.test.ts`

**Interfaces:**

- Produces: `PriceQuoteRateAssumption` and expanded `PriceQuoteResult.assumptions`.
- Consumes: existing `calculatePriceQuote(input: PriceQuoteRequest): PriceQuoteResult`.

Define:

```ts
export type PriceQuoteRateAssumption = {
  job_id: number;
  task_id: string;
  material_type: string;
  material_rate_per_kg: number;
  printer: string;
  machine_rate_per_hr: number;
  used_material_fallback: boolean;
  used_machine_fallback: boolean;
};
```

Expand assumptions with:

```ts
failure_buffer_pct: number;
overhead_buffer_pct: number;
resolved_rates: PriceQuoteRateAssumption[];
```

- [ ] **Step 1: Write failing quote-model assertions**

In the mixed-provider quote test, assert exact rate provenance:

```ts
expect(result.assumptions).toMatchObject({
  failure_buffer_pct: 0.1,
  overhead_buffer_pct: 0.05,
});
expect(result.assumptions.resolved_rates).toEqual(
  expect.arrayContaining([
    expect.objectContaining({
      job_id: 1,
      task_id: "task-1",
      material_type: "PLA",
      used_material_fallback: false,
      used_machine_fallback: false,
    }),
  ]),
);
```

Add one assertion for PLA fallback and one for fallback printer rate.

- [ ] **Step 2: Run the quote tests to verify failure**

Run: `npm test -- tests/price-quotes-model.test.ts tests/price-quotes-routes.test.ts`

Expected: FAIL because the assumptions do not include buffers or resolved rates.

- [ ] **Step 3: Return rate provenance from task resolution**

Extend the internal resolved-task result with rate metadata, append one `PriceQuoteRateAssumption` per priced task, and include the buffer percentages from `loadRatesConfig()` in `PriceQuoteResult.assumptions`. Keep all existing cost math unchanged.

Mirror the exact TypeScript fields in `frontend/lib/api.ts` and update route fixtures to include them.

- [ ] **Step 4: Run quote tests and typecheck**

Run: `npm test -- tests/price-quotes-model.test.ts tests/price-quotes-routes.test.ts && npm run typecheck`

Expected: PASS with unchanged prior quote totals.

- [ ] **Step 5: Commit**

```bash
git add models/price-quotes.ts frontend/lib/api.ts tests/price-quotes-model.test.ts tests/price-quotes-routes.test.ts
git commit -m "feat: snapshot resolved quote assumptions"
```

---

### Task 3: Save dual-channel Product pricing transactionally

**Files:**

- Create: `models/saved-product-pricing.ts`
- Create: `tests/saved-product-pricing.test.ts`
- Modify: `models/products.ts`
- Modify: `tests/products-model.test.ts`

**Interfaces:**

- Consumes: `calculatePriceQuote`, `createProduct`, `ProductSummary`, and the schema from Task 1.
- Produces:

```ts
export type SaveProductPricingRequest = {
  job_ids: number[];
  sellable_units: number;
  batch_labor_minutes: number;
  per_unit_labor_minutes: number;
  packaging_cost_per_unit: number;
  extra_cost: number;
  target_margin_pct?: number;
  product_id?: number;
  new_product?: {
    name: string;
    designer?: string | null;
    source_id?: string | null;
    license_id?: string | null;
    model_url?: string | null;
    notes?: string | null;
  };
  notes?: string | null;
};

export type SavedPriceSnapshot = {
  id: number;
  batch_id: number;
  channel: "direct" | "etsy";
  created_at: string;
  quote: PriceQuoteResult;
};

export type SavedProductPricing = {
  product: ProductSummary;
  batch_id: number;
  snapshots: { direct: SavedPriceSnapshot; etsy: SavedPriceSnapshot };
};

export type SavedProductPricingBatch = {
  batch_id: number;
  created_at: string;
  sellable_units: number;
  job_ids: number[];
  notes: string | null;
  snapshots: { direct: SavedPriceSnapshot; etsy: SavedPriceSnapshot };
};

export function saveProductPricing(input: SaveProductPricingRequest): SavedProductPricing;
export function listProductPricingHistory(productId: number): SavedProductPricingBatch[];
```

- [ ] **Step 1: Write failing transactional model tests**

Cover existing and new Products with real temporary SQLite fixtures:

```ts
const saved = saveProductPricing({
  product_id: product.id,
  job_ids: [successfulJobId, failedJobId],
  sellable_units: 3,
  batch_labor_minutes: 12,
  per_unit_labor_minutes: 2,
  packaging_cost_per_unit: 0.75,
  extra_cost: 4.5,
});

expect(saved.snapshots.direct.quote.breakdown.totalCost).toBe(
  saved.snapshots.etsy.quote.breakdown.totalCost,
);
expect(saved.snapshots.direct.quote.breakdown.suggestedPrice).not.toBe(
  saved.snapshots.etsy.quote.breakdown.suggestedPrice,
);
expect(db.prepare("SELECT COUNT(*) AS count FROM product_batch_jobs WHERE batch_id = ?").get(saved.batch_id))
  .toEqual({ count: 2 });
```

Also assert:

- exactly one of `product_id` and `new_product` is required;
- duplicate job IDs link once in first-seen order;
- `source_type = 'price_quote'`, planned/completed quantity equals sellable units, and `extra_cost` persists;
- changing material/labor rates after save does not alter history results;
- Product `booth_price`, `etsy_price`, and `target_sale_price` project the latest snapshot;
- deleting a Product cascades its Batch, job links, and price snapshots without touching unrelated Products;
- a temporary `BEFORE INSERT ON product_price_snapshots` trigger using `RAISE(ABORT, 'snapshot failure')` rolls back a newly created Product, Batch, and links.

- [ ] **Step 2: Run the model test to verify failure**

Run: `npm test -- tests/saved-product-pricing.test.ts`

Expected: FAIL because the model and exported interfaces do not exist.

- [ ] **Step 3: Implement normalization and dual calculation**

Normalize identifiers and numeric fields using the same invariants as `PriceQuoteRequest`. Reject invalid Product/new-Product combinations with `SavedProductPricingValidationError`.

Calculate before writing:

```ts
const quoteInput = {
  job_ids: normalized.jobIds,
  sellable_units: normalized.sellableUnits,
  batch_labor_minutes: normalized.batchLaborMinutes,
  per_unit_labor_minutes: normalized.perUnitLaborMinutes,
  packaging_cost_per_unit: normalized.packagingCostPerUnit,
  extra_cost: normalized.extraCost,
  ...(normalized.targetMarginPct === undefined
    ? {}
    : { target_margin_pct: normalized.targetMarginPct }),
};
const direct = calculatePriceQuote({ ...quoteInput, channel: "direct" });
const etsy = calculatePriceQuote({ ...quoteInput, channel: "etsy" });
```

- [ ] **Step 4: Implement the transaction and history mapper**

Use one `db.transaction()` to create/select the Product, insert the Batch, insert unique job links, insert both channel snapshots, and update Product projections. Store `input_json`, `assumptions_json`, `warnings_json`, and `breakdown_json` with `JSON.stringify()`.

Add `designer` to `ProductSummary`, `CreateProductInput`, the Product SELECT, normalization, creation, and update paths because the save dialog captures it from the approved design.

Map history by Batch with exact `{ direct, etsy }` snapshots; reject corrupt/incomplete saved-quote Batches rather than silently presenting one channel.

- [ ] **Step 5: Run model tests**

Run: `npm test -- tests/saved-product-pricing.test.ts tests/products-model.test.ts tests/price-quotes-model.test.ts`

Expected: PASS, including rollback and historical immutability.

- [ ] **Step 6: Commit**

```bash
git add models/saved-product-pricing.ts models/products.ts tests/saved-product-pricing.test.ts tests/products-model.test.ts
git commit -m "feat: save product price snapshots"
```

---

### Task 4: Expose save and pricing-history APIs

**Files:**

- Modify: `routes/price-quotes.ts`
- Modify: `routes/products.ts`
- Modify: `frontend/lib/api.ts`
- Modify: `tests/price-quotes-routes.test.ts`
- Modify: `tests/products-routes.test.ts`

**Interfaces:**

- Consumes: `saveProductPricing()` and `listProductPricingHistory()` from Task 3.
- Produces:
  - `POST /api/price-quotes/save-to-product`
  - `GET /api/products/:id/pricing-history`
  - `savePriceQuoteToProduct(input)` and `fetchProductPricingHistory(productId)` frontend functions.

- [ ] **Step 1: Write failing route tests**

Mock the Task 3 functions and assert:

```ts
const res = await app.request("/api/price-quotes/save-to-product", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(validSaveBody),
});
expect(res.status).toBe(201);
expect(mockSaveProductPricing).toHaveBeenCalledWith(validSaveBody);
expect(await res.json()).toEqual({ saved: sampleSavedPricing, image_warnings: [] });
```

Add 400 cases for unknown fields, empty jobs, invalid number fields, both/neither Product selectors, and model validation errors. Add 404 and successful history cases for `/api/products/:id/pricing-history`.

- [ ] **Step 2: Run route tests to verify failure**

Run: `npm test -- tests/price-quotes-routes.test.ts tests/products-routes.test.ts`

Expected: FAIL with 404/unregistered functions.

- [ ] **Step 3: Implement strict route contracts**

Create separate field allowlists for calculation and save requests. Validate request shape before casting; leave numeric range and Product existence checks to the model.

Add frontend types mirroring Task 3 and these functions:

```ts
export type SavedProductPricingResponse = {
  saved: SavedProductPricing;
  image_warnings: string[];
};

export async function savePriceQuoteToProduct(
  input: SaveProductPricingRequest,
): Promise<SavedProductPricingResponse | null> {
  return postJsonOrToast(
    "/api/price-quotes/save-to-product",
    input,
    "Failed to save product pricing.",
  );
}

export async function fetchProductPricingHistory(
  productId: number,
): Promise<SavedProductPricingBatch[]>;
```

Add `designer` to `ProductSummary`/`ProductInput` and the Product route mutable-field allowlist.

- [ ] **Step 4: Run route tests and typecheck**

Run: `npm test -- tests/price-quotes-routes.test.ts tests/products-routes.test.ts && npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add routes/price-quotes.ts routes/products.ts frontend/lib/api.ts tests/price-quotes-routes.test.ts tests/products-routes.test.ts
git commit -m "feat: expose saved product pricing APIs"
```

---

### Task 5: Add Save to Product to Price-this

**Files:**

- Create: `frontend/components/save-price-to-product-modal.ts`
- Modify: `frontend/components/price-this-view.ts`
- Modify: `frontend/components/price-this-helpers.ts`
- Modify: `frontend/app.css`
- Create: `tests/save-price-to-product-modal.test.ts`
- Modify: `tests/price-this-view.test.ts`

**Interfaces:**

- Consumes: `ProductSummary`, `SaveProductPricingRequest`, `savePriceQuoteToProduct()`, `fetchProducts()`, and the current `PriceThisDraft`.
- Produces:

```ts
export function suggestedProductName(jobs: Array<Job | undefined>): string;
export function buildSaveProductPricingRequest(
  draft: PriceThisDraft,
  selection: ExistingOrNewProductSelection,
): SaveProductPricingRequest;
```

- [ ] **Step 1: Write failing pure-helper tests**

Assert request mapping excludes the currently viewed quote channel and preserves all manufacturing inputs:

```ts
expect(buildSaveProductPricingRequest(draft, { mode: "existing", productId: 17 })).toEqual({
  product_id: 17,
  job_ids: [4, 9],
  sellable_units: 3,
  batch_labor_minutes: 12,
  per_unit_labor_minutes: 2,
  packaging_cost_per_unit: 0.75,
  extra_cost: 4.5,
});
```

Assert suggested name prefers the first selected job's `design_title`, then `title`, then `New product`.

- [ ] **Step 2: Run helper tests to verify failure**

Run: `npm test -- tests/save-price-to-product-modal.test.ts tests/price-this-view.test.ts`

Expected: FAIL because the modal helpers do not exist.

- [ ] **Step 3: Implement the modal**

The modal must:

- load existing Products only when opened;
- default to creating a Product with `suggestedProductName()`;
- switch between existing/new modes without discarding entered new-Product fields;
- expose name, designer, source, license, model URL, and notes for new Products;
- disable save during submission and when the chosen Product input is invalid;
- call `savePriceQuoteToProduct()` exactly once;
- toast success, close, and call `navigate('/products/' + result.saved.product.id)`;
- leave the modal open when the API helper returns failure.

- [ ] **Step 4: Wire the result action and styles**

Change `PriceResult` to accept `onSave` and render adjacent actions:

```ts
<div class="price-this-result-actions">
  <button type="button" onClick=${onCopy}>Copy price summary</button>
  <button type="button" class="btn-primary" onClick=${onSave}>Save to Product</button>
</div>
```

Open the modal only when `quote` is current. Any draft change already clears the quote and must also close/invalidate the modal.

Add responsive dialog styles, visible labels, focus-visible outlines, and a mobile single-column form.

- [ ] **Step 5: Run focused tests and frontend typecheck**

Run: `npm test -- tests/save-price-to-product-modal.test.ts tests/price-this-view.test.ts && npx tsc -p tsconfig.frontend.json --noEmit`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/components/save-price-to-product-modal.ts frontend/components/price-this-view.ts frontend/components/price-this-helpers.ts frontend/app.css tests/save-price-to-product-modal.test.ts tests/price-this-view.test.ts
git commit -m "feat: save Price-this results to products"
```

---

### Task 6: Show immutable pricing history and publication state

**Files:**

- Create: `frontend/components/product-pricing-history.ts`
- Modify: `frontend/components/product-detail-view.ts`
- Modify: `frontend/components/product-card.ts`
- Modify: `frontend/lib/api.ts`
- Modify: `models/products.ts`
- Modify: `routes/products.ts`
- Modify: `frontend/app.css`
- Create: `tests/product-pricing-history.test.ts`
- Modify: `tests/products-model.test.ts`
- Modify: `tests/products-routes.test.ts`

**Interfaces:**

- Consumes: `fetchProductPricingHistory()` and `SavedProductPricingBatch` from Task 4.
- Produces: Product fields `sales_companion_visible: boolean`, publication controls, and the read-only local publication projection:

```ts
export type SalesCompanionProduct = {
  id: number;
  name: string;
  identification_image_url: string | null;
  unit_cost: number;
  production_loss_cost: number;
  direct_price: number;
  direct_margin_pct: number;
  etsy_price: number;
  etsy_margin_pct: number;
  priced_at: string;
};

export function listSalesCompanionProducts(): SalesCompanionProduct[];
```

- Produces: `GET /api/products/sales-companion`, registered before `/:id`.

- [ ] **Step 1: Write failing Product visibility tests**

Assert Product model mapping returns false for `0`, update accepts only booleans/`0`/`1`, and route PATCH accepts `sales_companion_visible` while rejecting unknown values.

```ts
const updated = updateProduct(product.id, { sales_companion_visible: true });
expect(updated.sales_companion_visible).toBe(true);
```

Seed private, visible-but-unpriced, and visible-priced Products. Assert `listSalesCompanionProducts()` returns only the visible Product with a complete latest Direct/Etsy snapshot, uses its newest saved Batch, and never includes job IDs, source URLs, notes, or printer/provider data.

- [ ] **Step 2: Write failing pricing-history view-model tests**

Export and test a formatter:

```ts
const cards = latestPricingCards(history);
expect(cards).toEqual([
  expect.objectContaining({ channel: "direct", price: 29.99, unitCost: 9.5 }),
  expect.objectContaining({ channel: "etsy", price: 34.99, unitCost: 9.5 }),
]);
```

Assert empty history, production-loss display, warning count, and newest-Batch ordering.

- [ ] **Step 3: Run focused tests to verify failure**

Run: `npm test -- tests/product-pricing-history.test.ts tests/products-model.test.ts tests/products-routes.test.ts`

Expected: FAIL because visibility mapping and history components are absent.

- [ ] **Step 4: Implement Product model/API visibility**

Add `sales_companion_visible` to Product SELECT/mapping/input/update normalization and frontend contracts. Keep default false. Add it to `PRODUCT_MUTABLE_FIELDS`.

Implement `listSalesCompanionProducts()` with a window function or correlated latest-Batch query that requires exactly one Direct and one Etsy snapshot from the newest complete saved Batch. Return only the minimal `SalesCompanionProduct` fields. Add `GET /api/products/sales-companion` before `/:id`; return `{ products }` and do not expose raw history, jobs, source URLs, notes, rates, or provider identifiers.

- [ ] **Step 5: Implement latest pricing and history UI**

`ProductPricingHistory` loads on Product detail and renders:

- a Direct and Etsy card from the newest complete Batch;
- shared unit cost and production loss;
- suggested price, profit per unit, and margin;
- saved timestamp, rate assumptions, and warnings;
- a collapsed history list with linked job count and successful quantity.

Use stored snapshot values only; never call calculate from this component.

Add a labeled checkbox to Product detail:

```ts
<label class="sales-companion-toggle">
  <input
    type="checkbox"
    checked=${form.salesCompanionVisible}
    onChange=${...}
  />
  Visible in Sales Companion
</label>
```

Show explanatory private/visible copy and an image-missing warning, but do not block visibility.

- [ ] **Step 6: Run focused tests and frontend typecheck**

Run: `npm test -- tests/product-pricing-history.test.ts tests/products-model.test.ts tests/products-routes.test.ts && npx tsc -p tsconfig.frontend.json --noEmit`

Expected: PASS, including private/unpriced filtering and minimal Sales Companion response shape.

- [ ] **Step 7: Commit**

```bash
git add frontend/components/product-pricing-history.ts frontend/components/product-detail-view.ts frontend/components/product-card.ts frontend/lib/api.ts models/products.ts routes/products.ts frontend/app.css tests/product-pricing-history.test.ts tests/products-model.test.ts tests/products-routes.test.ts
git commit -m "feat: show product pricing history and visibility"
```

---

### Task 7: Rank local identification-image candidates and enforce Manual mode

**Files:**

- Create: `models/product-images.ts`
- Create: `tests/product-images-model.test.ts`
- Modify: `models/products.ts`
- Modify: `routes/products.ts`
- Modify: `frontend/lib/api.ts`
- Modify: `tests/products-routes.test.ts`

**Interfaces:**

- Produces:

```ts
export type ProductImageSourceType =
  | "manual_upload"
  | "source_hero"
  | "catalog_preview"
  | "contact_sheet"
  | "print_cover"
  | "placeholder";

export type ProductImageCandidate = {
  candidate_key: string;
  source_type: ProductImageSourceType;
  photo_id: number | null;
  url: string | null;
  label: string;
  priority: number;
  available: boolean;
  warning: string | null;
};

export function listProductImageCandidates(productId: number): ProductImageCandidate[];
export function selectProductImage(productId: number, candidateKey: string): ProductSummary;
export function returnProductImageToAuto(productId: number): ProductSummary;
export function refreshAutoProductImage(productId: number): ProductSummary;
```

- [ ] **Step 1: Write failing ranking and lock tests**

Seed a Product with a linked catalog 3MF preview and saved-Batch task covers. Assert:

```ts
expect(listProductImageCandidates(product.id).map((candidate) => candidate.source_type)).toEqual([
  "catalog_preview",
  "print_cover",
  "placeholder",
]);
```

Then seed a source hero and manual upload and assert the complete precedence order. Test stable deduplication by `candidate_key`.

Select the catalog candidate and assert `image_selection_mode = 'manual'`; add a better source candidate, call `refreshAutoProductImage()`, and assert the manual image remains unchanged. Call `returnProductImageToAuto()` and assert the source hero becomes current.

- [ ] **Step 2: Run model tests to verify failure**

Run: `npm test -- tests/product-images-model.test.ts`

Expected: FAIL because the image domain does not exist.

- [ ] **Step 3: Implement persisted and ephemeral candidate discovery**

Discover:

- persisted `product_photos` rows by source type;
- catalog preview files through `product_files`, `catalog_files.metadata_json`, and `catalogPreviewPath()`;
- cached task covers by joining latest saved Batch → `product_batch_jobs` → jobs/session tasks and checking `localCoverExists()`;
- one placeholder candidate with `url: null`.

When selecting an ephemeral catalog/cover candidate, upsert a `product_photos` row using its stable `candidate_key`, set `main_photo_id`, and set Manual in one transaction. `refreshAutoProductImage()` may update `main_photo_id` only when mode is Auto.

Add to Product summary/API:

```ts
main_photo_id: number | null;
main_photo_source_type: ProductImageSourceType | null;
image_selection_mode: "auto" | "manual";
```

- [ ] **Step 4: Add strict selection routes**

Add:

- `GET /api/products/:id/image-candidates`
- `POST /api/products/:id/image-selection` with either `{ "mode": "auto" }` or `{ "mode": "manual", "candidate_key": "..." }`

Reject mixed/unknown fields and unavailable candidate keys. Add corresponding frontend types/functions.

- [ ] **Step 5: Run model and route tests**

Run: `npm test -- tests/product-images-model.test.ts tests/products-routes.test.ts tests/products-model.test.ts && npm run typecheck`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add models/product-images.ts models/products.ts routes/products.ts frontend/lib/api.ts tests/product-images-model.test.ts tests/products-routes.test.ts
git commit -m "feat: rank product identification images"
```

---

### Task 8: Generate contact sheets and store validated uploads

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `lib/product-image-files.ts`
- Create: `tests/product-image-files.test.ts`
- Modify: `models/product-images.ts`
- Modify: `routes/products.ts`
- Modify: `routes/ui.ts`
- Modify: `tests/product-images-model.test.ts`
- Modify: `tests/products-routes.test.ts`
- Create: `tests/ui-routes.test.ts`

**Interfaces:**

- Consumes: Sharp and Product image candidates from Task 7.
- Produces:

```ts
export type ContactSheetInput = { key: string; label: string; path: string };
export type StoredProductImage = {
  path: string;
  contentType: "image/webp";
  width: number;
  height: number;
  contentHash: string;
};

export async function storeUploadedProductImage(
  productId: number,
  bytes: Uint8Array,
): Promise<StoredProductImage>;
export async function storeRemoteProductImage(
  productId: number,
  sourceUrl: string,
  bytes: Uint8Array,
): Promise<StoredProductImage>;
export async function generateProductContactSheet(
  productId: number,
  batchId: number,
  inputs: ContactSheetInput[],
): Promise<StoredProductImage | null>;
export async function ensureGeneratedProductImageCandidates(
  productId: number,
): Promise<{ candidates: ProductImageCandidate[]; warnings: string[] }>;
export function removeAppOwnedProductImage(filePath: string): void;
```

- [ ] **Step 1: Add Sharp and write failing file tests**

Run: `npm install sharp`

Create generated PNG fixtures with Sharp in the test itself. Assert upload re-encoding returns WebP no larger than 1600×1600, rejects non-images and decoded images over the pixel limit, and stores only under `PRODUCT_IMAGES_DIR`.

For contact sheets:

```ts
const first = await generateProductContactSheet(3, 8, [plateA, plateB, plateA]);
const second = await generateProductContactSheet(3, 8, [plateB, plateA]);
expect(first?.contentHash).toBe(second?.contentHash);
expect(await sharp(first!.path).metadata()).toMatchObject({ format: "webp" });
```

The implementation must sort/deduplicate by `key`, so input order does not change the content-addressed result.

- [ ] **Step 2: Run file tests to verify failure**

Run: `npm test -- tests/product-image-files.test.ts`

Expected: FAIL because storage functions do not exist.

- [ ] **Step 3: Implement safe app-owned image storage**

Use `PRODUCT_IMAGES_DIR`, default `./product-images`, resolved to an absolute path. Reject any computed path outside that root. Decode with Sharp using `limitInputPixels`, auto-orient, resize with `fit: 'inside'`, strip metadata, and encode WebP.

Write to a same-directory temporary file, then rename atomically. Name files by SHA-256 of normalized input/candidate identity. Contact sheets use bounded 480×360 cells, a maximum of three columns, neutral background, escaped SVG labels, and a bounded 1600-pixel output edge.

- [ ] **Step 4: Integrate generated contact-sheet candidates**

Implement `ensureGeneratedProductImageCandidates(productId)` as the asynchronous boundary. It calls the synchronous Task 7 candidate list, then, for the latest saved Batch with two or more unique available covers, lazily calls `generateProductContactSheet()` and upserts:

```ts
{
  source_type: "contact_sheet",
  candidate_key: `contact_sheet:${batchId}:${contentHash}`,
  source_ref: String(batchId),
  is_app_owned: 1,
}
```

It returns a newly ranked synchronous candidate list plus warnings. Single-cover Batches skip contact-sheet generation. A Sharp/read failure adds an unavailable contact-sheet candidate warning and preserves the single-cover fallback; Task 7's synchronous function signatures do not change.

- [ ] **Step 5: Add upload and serving routes**

Add `POST /api/products/:id/photos` accepting multipart field `photo`. Before `parseBody()`, reject `Content-Length` over 12 MiB; after parsing, require a `File`, cap bytes at 10 MiB, and call `storeUploadedProductImage()`.

In one DB transaction insert a manual-upload `product_photos` row, set `main_photo_id`, and switch to Manual. Return `{ product, photo }` with status 201. If the database transaction fails after writing, call `removeAppOwnedProductImage()`; that function must reject paths outside `PRODUCT_IMAGES_DIR` and never delete catalog previews, print covers, or other non-owned media.

Update `/ui/product-photos/:photoId` serving to use recorded `content_type`, require an absolute regular file, and keep app-owned/manual/catalog source paths valid. Do not delete source files when selection changes.

- [ ] **Step 6: Run file, model, route, and UI-route tests**

Run: `npm test -- tests/product-image-files.test.ts tests/product-images-model.test.ts tests/products-routes.test.ts tests/ui-routes.test.ts && npm run typecheck`

Expected: PASS for valid upload/contact sheet and invalid bytes, oversize, deduplication, fallback, and path-boundary cases.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json lib/product-image-files.ts models/product-images.ts routes/products.ts routes/ui.ts tests/product-image-files.test.ts tests/product-images-model.test.ts tests/products-routes.test.ts tests/ui-routes.test.ts
git commit -m "feat: add product image uploads and contact sheets"
```

---

### Task 9: Add safe MakerWorld source-image enrichment

**Files:**

- Create: `lib/remote-product-images.ts`
- Create: `tests/remote-product-images.test.ts`
- Modify: `models/product-images.ts`
- Modify: `routes/products.ts`
- Modify: `frontend/lib/api.ts`
- Modify: `tests/product-images-model.test.ts`
- Modify: `tests/products-routes.test.ts`

**Interfaces:**

- Consumes: `storeRemoteProductImage()` implemented with Task 8's normalization/storage primitives.
- Produces:

```ts
export type RemoteImageDependencies = {
  fetch: typeof globalThis.fetch;
  lookup: typeof import("node:dns/promises").lookup;
};

export function extractOpenGraphImage(html: string, pageUrl: URL): URL | null;
export async function fetchSupportedSourceImage(
  modelUrl: string,
  dependencies?: Partial<RemoteImageDependencies>,
): Promise<{ bytes: Uint8Array; sourceUrl: string } | null>;
export async function refreshProductIdentificationImages(
  productId: number,
): Promise<{ product: ProductSummary; warnings: string[] }>;
```

- [ ] **Step 1: Write failing metadata and SSRF tests**

Use injected fake fetch/lookup dependencies. Cover Open Graph attributes in either order, relative image URLs, missing metadata, and malformed HTML.

Reject:

```ts
await expect(fetchSupportedSourceImage("http://makerworld.com/en/models/1", deps)).rejects.toThrow(
  "HTTPS",
);
await expect(fetchSupportedSourceImage("https://localhost/model", deps)).rejects.toThrow();
await expect(fetchSupportedSourceImage("https://makerworld.com/model", privateIpDeps)).rejects.toThrow(
  "public network",
);
```

Also test private IPv4/IPv6 resolutions, credentials, unsupported hosts, redirect to a private host, more than three redirects, HTML over 1 MiB, image over 10 MiB, invalid content type, timeout, and a valid MakerWorld → `makerworld.bblmw.com` image flow.

- [ ] **Step 2: Run remote-image tests to verify failure**

Run: `npm test -- tests/remote-product-images.test.ts`

Expected: FAIL because the provider adapter does not exist.

- [ ] **Step 3: Implement bounded provider-specific fetching**

Allow only these initial hosts:

```ts
const SOURCE_PAGE_HOSTS = new Set(["makerworld.com", "www.makerworld.com"]);
const SOURCE_IMAGE_HOSTS = new Set(["makerworld.bblmw.com"]);
```

Use manual redirects and validate scheme, hostname, credentials, DNS results, and redirect targets before every request. Reject loopback, private, link-local, carrier-grade NAT, multicast, documentation/test ranges, and IPv4-mapped/private IPv6 values. Apply a 10-second `AbortSignal.timeout()`, streaming byte caps, and image content-type validation.

Parse `og:image` without executing page scripts. Re-encode the fetched image through Sharp before persistence.

- [ ] **Step 4: Persist source candidates without disturbing Manual mode**

`refreshProductIdentificationImages(productId)`:

1. loads Product `model_url`;
2. attempts supported source enrichment;
3. stores accepted bytes through `storeRemoteProductImage(productId, sourceUrl, bytes)`;
4. upserts `source_hero:${sha256(sourceUrl)}` with `is_app_owned = 1`;
5. calls `ensureGeneratedProductImageCandidates(productId)`;
6. runs `refreshAutoProductImage()` only for Auto Products;
7. returns warnings instead of throwing for malformed URLs, fetch failures, and generation failures.

Do not perform authenticated requests and do not attempt Cubee URLs.

- [ ] **Step 5: Add refresh endpoint**

Add `POST /api/products/:id/images/refresh`. Return status 200 with `{ product, candidates, warnings }` even when an unsupported/malformed Product source URL or enrichment failure falls back. Return 404 only for an unknown Product.

Add `refreshProductImages(productId)` to frontend API.

- [ ] **Step 6: Run remote, model, and route tests**

Run: `npm test -- tests/remote-product-images.test.ts tests/product-images-model.test.ts tests/products-routes.test.ts && npm run typecheck`

Expected: PASS without live network access.

- [ ] **Step 7: Commit**

```bash
git add lib/remote-product-images.ts models/product-images.ts routes/products.ts frontend/lib/api.ts tests/remote-product-images.test.ts tests/product-images-model.test.ts tests/products-routes.test.ts
git commit -m "feat: enrich product identification images"
```

---

### Task 10: Build the Product identification-image UI

**Files:**

- Create: `frontend/components/product-image-panel.ts`
- Modify: `frontend/components/product-detail-view.ts`
- Modify: `frontend/components/product-card.ts`
- Modify: `frontend/lib/api.ts`
- Modify: `frontend/app.css`
- Create: `tests/product-image-panel.test.ts`
- Modify: `tests/products-view-helpers.test.ts`

**Interfaces:**

- Consumes: candidate/select/upload/refresh APIs from Tasks 7–9.
- Produces: Product-detail Auto/Manual image management and provenance display.

- [ ] **Step 1: Write failing image-panel helper tests**

Export pure state helpers and assert:

```ts
expect(imageModeLabel("auto")).toBe("Auto-selected");
expect(imageModeLabel("manual")).toBe("Manual choice");
expect(candidateActionLabel({ source_type: "catalog_preview", available: true })).toBe(
  "Use 3MF preview",
);
expect(selectableCandidates(candidates).every((item) => item.available)).toBe(true);
```

Also assert source labels for manual upload, MakerWorld hero, contact sheet, print cover, and placeholder; unavailable candidates preserve warnings but cannot be selected.

- [ ] **Step 2: Run the UI helper tests to verify failure**

Run: `npm test -- tests/product-image-panel.test.ts tests/products-view-helpers.test.ts`

Expected: FAIL because the panel/helpers do not exist.

- [ ] **Step 3: Implement ProductImagePanel behavior**

On mount:

1. show the current Product image immediately;
2. fetch local candidates;
3. call refresh once per Product detail mount;
4. replace candidates/Product state only if the component is still mounted.

Render:

- large current image or intentional placeholder;
- Auto-selected/Manual choice badge;
- current provenance label;
- **Choose image** expandable candidate grid;
- disabled unavailable candidates with warning text;
- **Upload photo** file input using `FormData`;
- **Return to Auto** only in Manual mode;
- refresh warnings in a non-blocking status region.

After selection/upload/Auto reset, update parent Product state and toast success. Never use `alert()` or `confirm()`.

- [ ] **Step 4: Integrate Product detail and cards**

Replace `DetailPhoto` with `ProductImagePanel`. Product cards continue using `main_photo_path`, add a compact manual/auto provenance hint only where it does not crowd the card, and preserve lazy loading and descriptive alt text.

Add responsive CSS for bounded aspect ratios, candidate grids, visible keyboard focus, touch-size buttons, loading state, and mobile stacking.

- [ ] **Step 5: Run focused tests, typecheck, and UI build**

Run: `npm test -- tests/product-image-panel.test.ts tests/products-view-helpers.test.ts tests/products-routes.test.ts && npm run typecheck && npm run build:ui`

Expected: PASS and successful Vite build.

- [ ] **Step 6: Commit**

```bash
git add frontend/components/product-image-panel.ts frontend/components/product-detail-view.ts frontend/components/product-card.ts frontend/lib/api.ts frontend/app.css tests/product-image-panel.test.ts tests/products-view-helpers.test.ts
git commit -m "feat: manage product identification images"
```

---

### Task 11: Prove the complete local Product foundation

**Files:**

- Modify: `scripts/smoke-test.ts`
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-07-25-saved-product-pricing-images-design.md` only if implementation-established details differ from the approved contract.

**Interfaces:**

- Consumes: all previous tasks.
- Produces: repeatable smoke proof, operator documentation, and final verification evidence.

- [ ] **Step 1: Extend the smoke test before implementation changes**

Add an isolated-DB flow that:

1. seeds one finished and one failed production attempt;
2. calls `POST /api/price-quotes/save-to-product` with `new_product`;
3. asserts HTTP 201 and both channel snapshots;
4. asserts shared unit cost and different Direct/Etsy suggestions;
5. fetches Product pricing history;
6. enables `sales_companion_visible` explicitly;
7. fetches image candidates and verifies at least print-cover/placeholder fallback;
8. verifies the Product remains private before step 6 and visible after it.

Use generated local image fixtures; never make live MakerWorld requests.

- [ ] **Step 2: Run the expanded smoke test**

Run: `npm run smoke`

Expected: PASS because Tasks 1–10 have completed the integration. If it fails, fix only the demonstrated contract mismatch in the owning module and add a focused regression test there.

- [ ] **Step 3: Document local operation**

Update README with:

- Save to Product workflow;
- immutable Direct/Etsy history behavior;
- explicit Sales Companion visibility semantics;
- Auto/Manual image ranking;
- `PRODUCT_IMAGES_DIR` default and ownership boundary;
- best-effort public MakerWorld enrichment and non-authenticated Cubee boundary;
- statement that hosted publication and Mac packaging remain later work.

- [ ] **Step 4: Run proactive diagnostics on changed source files**

Run `lsp_diagnostics` on all changed `.ts` files, then `lens_diagnostics mode=all`. Resolve every blocking error introduced by this plan before builds.

- [ ] **Step 5: Run complete verification**

Run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run smoke
```

Expected: all commands exit 0. Record test count and any non-blocking warnings in the implementation report.

- [ ] **Step 6: Review only relevant diff and commit**

```bash
git status --short
git diff --check
git diff -- scripts/smoke-test.ts README.md docs/superpowers/specs/2026-07-25-saved-product-pricing-images-design.md
git add scripts/smoke-test.ts README.md
git add docs/superpowers/specs/2026-07-25-saved-product-pricing-images-design.md  # only when changed
git commit -m "docs: document saved product pricing workflow"
```

Do not stage the unrelated working-tree files listed in Global Constraints.

---

## Completion Criteria

- Price-this can save to a new or existing Product.
- One save creates one price-quote Batch with exactly one Direct and one Etsy immutable snapshot.
- Historical values survive later rate changes.
- Product detail shows latest costs/prices/margins and prior saved Batches.
- Products publish only through explicit `sales_companion_visible` opt-in.
- Auto image resolution follows the approved priority and handles multi-plate Products with a contact sheet.
- Manual selection/upload cannot be overwritten until Return to Auto.
- Unsupported, invalid, private-network, oversized, or failed remote images fall back without invalidating pricing.
- Existing Product main photos remain selected after migration.
- Full lint, typecheck, test, build, and smoke verification passes.
