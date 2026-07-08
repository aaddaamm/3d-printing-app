# Product Pipeline Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a lightweight product pipeline/catalog for Robinson PrintWorks that tracks sellability, files/photos/listings, and product workflow status without becoming inventory/accounting software.

**Architecture:** Extend the existing catalog foundation (`products`, `catalog_files`, `project_products`) with lookup tables, product metadata columns, product files/photos/links, and job links. Add API model/routes and Preact card-based views behind the existing local UI. Keep print jobs/pricing as production history and products as the sales/workflow layer.

**Tech Stack:** SQLite via better-sqlite3 migrations, Hono routes, TypeScript models/tests, Preact + htm frontend, Vitest.

## Global Constraints

- Keep Bambu/Moonraker print history and pricing tables intact.
- Do not build a giant spreadsheet or ERP system.
- UI should use cards/Kanban, not data-table-first screens.
- License warnings must be obvious: red/yellow/green sellability indicator.
- Personal Use Only and Unknown licenses must not be considered listable.
- Hive Community allows selling physical prints but must warn against STL redistribution.
- Source `Original` / license `Original / Owned by Robinson PrintWorks` is highest confidence.
- Avoid copyrighted/trademarked terms in public listings unless rights are verified.
- Always run `npm run typecheck`, `npm run lint`, and `npm test` before completion.

---

## File Structure

- Modify `lib/db.ts`: extend base schema for new product lookup/link tables and additive `products` columns.
- Modify `tests/catalog-schema.test.ts`: verify new schema, seed lookup rows, and idempotent migrations.
- Create `lib/product-rules.ts`: pure computed helpers for sellability and ready-to-list.
- Create `tests/product-rules.test.ts`: focused tests for license/status computed fields.
- Create `models/products.ts`: product queries and mutations used by routes.
- Create `routes/products.ts`: Hono API for product pipeline/catalog/detail.
- Modify route mounting in `routes/ui.ts` or API route index as existing patterns require.
- Create `tests/products-routes.test.ts` and `tests/products-model.test.ts`.
- Create frontend components:
  - `frontend/components/products-view.ts`
  - `frontend/components/product-card.ts`
  - `frontend/components/product-detail-view.ts`
  - `frontend/components/product-sellability.ts`
  - `frontend/components/product-print-next-view.ts`
- Modify `frontend/components/app-shell.ts` and router/nav files to add Product Pipeline/Catalog routes.
- Modify `frontend/lib/api.ts` for typed product API helpers.
- Modify `frontend/dist/*` only through `npm run build`.
- Update `README.md` with the lightweight product workflow.

---

### Task 1: Product Catalog Schema and Seeds

**Files:**

- Modify: `lib/db.ts`
- Modify: `tests/catalog-schema.test.ts`

**Interfaces:**

- Produces lookup tables: `product_statuses`, `product_categories`, `product_sources`, `product_licenses`.
- Produces link tables: `product_files`, `product_photos`, `product_links`, `product_jobs`.
- Extends `products` with workflow columns while preserving existing columns.

- [ ] **Step 1: Write failing schema tests**

Add expectations in `tests/catalog-schema.test.ts` that these tables exist:

```ts
expect(tables).toEqual(
  expect.arrayContaining([
    "product_statuses",
    "product_categories",
    "product_sources",
    "product_licenses",
    "product_files",
    "product_photos",
    "product_links",
    "product_jobs",
  ]),
);
```

Add seed assertions:

```ts
expect(db.prepare("SELECT label FROM product_statuses WHERE id = ?").pluck().get("idea")).toBe(
  "Idea",
);
expect(
  db
    .prepare("SELECT allows_commercial_sale FROM product_licenses WHERE id = ?")
    .pluck()
    .get("personal_use_only"),
).toBe(0);
expect(
  db
    .prepare("SELECT allows_commercial_sale FROM product_licenses WHERE id = ?")
    .pluck()
    .get("hive_community"),
).toBe(1);
```

Add column assertions for `products` using `PRAGMA table_info(products)`:

```ts
expect(productColumns).toEqual(
  expect.arrayContaining([
    "category_id",
    "status_id",
    "source_id",
    "license_id",
    "model_url",
    "main_file_id",
    "main_photo_id",
    "etsy_listing_url",
    "default_material",
    "primary_color",
    "accent_color",
    "preferred_printer_id",
    "estimated_print_time_s",
    "estimated_filament_g",
    "target_sale_price",
    "notes",
    "is_original_design",
    "restock_priority",
  ]),
);
```

- [ ] **Step 2: Verify red**

Run:

```bash
npx vitest run tests/catalog-schema.test.ts
```

Expected: fails because new tables/columns do not exist.

- [ ] **Step 3: Implement additive schema**

In `lib/db.ts`, add `CREATE TABLE IF NOT EXISTS` statements for lookup/link tables and `ALTER TABLE products ADD COLUMN` guarded through the existing migration helper pattern. Preserve old `products.status`, `designer`, `marketplace`, `source_url`, and `license_summary` for compatibility.

Use these lookup IDs exactly:

```txt
Statuses: idea, downloaded_designed, test_print, needs_tuning, ready_for_photos, listed, active, selling_well, retired
Categories: gaming, workshop, home_organization, decor, personalized, seasonal, custom_repair_parts
Sources: hive, original, printables, makerworld, thangs, stlflix, custom_commission
Licenses: commercial_allowed, personal_use_only, attribution_required, hive_community, hive_plus, original_owned, unknown_verify
```

- [ ] **Step 4: Verify green**

Run:

```bash
npx vitest run tests/catalog-schema.test.ts
npm run typecheck
```

Expected: schema tests and typecheck pass.

- [ ] **Step 5: Commit**

```bash
git add lib/db.ts tests/catalog-schema.test.ts
git commit -m "feat: add product pipeline schema"
```

---

### Task 2: Product Rules and Computed Fields

**Files:**

- Create: `lib/product-rules.ts`
- Create: `tests/product-rules.test.ts`

**Interfaces:**

```ts
export type SellabilityLevel = "green" | "yellow" | "red";
export interface ProductRuleInput {
  licenseId: string | null;
  sourceId: string | null;
  statusId: string | null;
  targetSalePrice: number | null;
  modelUrl: string | null;
  mainFileId: number | null;
  mainPhotoId: number | null;
}
export function sellabilityForProduct(input: ProductRuleInput): {
  level: SellabilityLevel;
  label: string;
  message: string;
  allowsListing: boolean;
};
export function readyToList(input: ProductRuleInput): boolean;
```

- [ ] **Step 1: Write failing tests**

Test cases:

```ts
expect(
  sellabilityForProduct({
    licenseId: "personal_use_only",
    sourceId: null,
    statusId: "active",
    targetSalePrice: 20,
    modelUrl: "https://x",
    mainFileId: null,
    mainPhotoId: 1,
  }).allowsListing,
).toBe(false);
expect(
  sellabilityForProduct({
    licenseId: "hive_community",
    sourceId: "hive",
    statusId: "active",
    targetSalePrice: 20,
    modelUrl: "https://x",
    mainFileId: null,
    mainPhotoId: 1,
  }).message,
).toContain("Do not redistribute STL");
expect(
  sellabilityForProduct({
    licenseId: "original_owned",
    sourceId: "original",
    statusId: "active",
    targetSalePrice: 20,
    modelUrl: null,
    mainFileId: 1,
    mainPhotoId: 1,
  }).level,
).toBe("green");
expect(
  readyToList({
    licenseId: "commercial_allowed",
    sourceId: "printables",
    statusId: "listed",
    targetSalePrice: 18,
    modelUrl: "https://x",
    mainFileId: null,
    mainPhotoId: 2,
  }),
).toBe(true);
expect(
  readyToList({
    licenseId: "unknown_verify",
    sourceId: "thangs",
    statusId: "listed",
    targetSalePrice: 18,
    modelUrl: "https://x",
    mainFileId: null,
    mainPhotoId: 2,
  }),
).toBe(false);
```

- [ ] **Step 2: Verify red**

Run:

```bash
npx vitest run tests/product-rules.test.ts
```

Expected: fails because `lib/product-rules.ts` does not exist.

- [ ] **Step 3: Implement pure helpers**

Implement the exact interfaces above. `readyToList` returns true only when commercial listing is allowed, price is set, model URL or file exists, photo exists, and status is one of `ready_for_photos`, `listed`, `active`, `selling_well`.

- [ ] **Step 4: Verify green**

Run:

```bash
npx vitest run tests/product-rules.test.ts
npm run typecheck
```

- [ ] **Step 5: Commit**

```bash
git add lib/product-rules.ts tests/product-rules.test.ts
git commit -m "feat: add product sellability rules"
```

---

### Task 3: Product Model and API

**Files:**

- Create: `models/products.ts`
- Create: `routes/products.ts`
- Create: `tests/products-model.test.ts`
- Create: `tests/products-routes.test.ts`
- Modify route mounting files following current route patterns.

**Interfaces:**

```ts
export interface ProductSummary {
  id: number;
  name: string;
  category_id: string | null;
  category_label: string | null;
  status_id: string;
  status_label: string;
  source_id: string | null;
  source_label: string | null;
  license_id: string | null;
  license_label: string | null;
  main_photo_path: string | null;
  target_sale_price: number | null;
  restock_priority: string;
  can_sell_level: "green" | "yellow" | "red";
  can_sell_label: string;
  ready_to_list: boolean;
}
export function listProducts(): ProductSummary[];
export function createProduct(input: CreateProductInput): ProductSummary;
export function updateProduct(id: number, input: UpdateProductInput): ProductSummary | null;
export function listProductsToPrintNext(): ProductSummary[];
```

Routes:

```txt
GET /api/products
POST /api/products
GET /api/products/print-next
GET /api/products/:id
PATCH /api/products/:id
```

- [ ] **Step 1: Write failing model tests**

Cover: seed product creation, computed sellability fields, `print-next` only returns `active`/`selling_well` products with `restock_priority` not `none`.

- [ ] **Step 2: Write failing route tests**

Cover: listing returns `{ products: [...] }`, invalid status/license IDs return `400`, patching status works.

- [ ] **Step 3: Verify red**

Run:

```bash
npx vitest run tests/products-model.test.ts tests/products-routes.test.ts
```

- [ ] **Step 4: Implement model and routes**

Keep validation minimal: reject unknown lookup IDs, reject blank product names, allow nullable optional fields.

- [ ] **Step 5: Verify green**

Run:

```bash
npx vitest run tests/products-model.test.ts tests/products-routes.test.ts
npm run typecheck
```

- [ ] **Step 6: Commit**

```bash
git add models/products.ts routes/products.ts tests/products-model.test.ts tests/products-routes.test.ts <route-mount-files>
git commit -m "feat: add product catalog API"
```

---

### Task 4: Seed Practical Starter Products

**Files:**

- Modify: `lib/db.ts` or create `lib/db/product-seeds.ts`
- Modify: schema/model tests as needed.

**Interfaces:**

- Seeds products only if absent by slug.
- All seeded non-original products default to `status_id='idea'` and `license_id='unknown_verify'`.
- Original/personalized seed products use `source_id='original'`, `license_id='original_owned'`, `is_original_design=1`.

- [ ] **Step 1: Write failing seed test**

Assert products include `controller-stand`, `gridfinity-bin`, `woodland-switch-cover`, `family-name-sign`, `qr-code-business-sign`.

- [ ] **Step 2: Verify red**

Run:

```bash
npx vitest run tests/catalog-schema.test.ts
```

- [ ] **Step 3: Implement seeds**

Seed the requested list with categories. Keep all price/photo/file fields empty.

- [ ] **Step 4: Verify green**

Run:

```bash
npx vitest run tests/catalog-schema.test.ts tests/products-model.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/db.ts tests/catalog-schema.test.ts
git commit -m "feat: seed starter product ideas"
```

---

### Task 5: Card-Based Product UI

**Files:**

- Create: `frontend/components/products-view.ts`
- Create: `frontend/components/product-card.ts`
- Create: `frontend/components/product-detail-view.ts`
- Create: `frontend/components/product-sellability.ts`
- Create: `frontend/components/product-print-next-view.ts`
- Modify: `frontend/lib/api.ts`
- Modify: `frontend/components/app-shell.ts`
- Modify router/nav files as needed.

**Interfaces:**

- Product Pipeline route: `/ui/products/pipeline`
- Product Catalog route: `/ui/products`
- Product Detail route: `/ui/products/:id`
- Print Next route: `/ui/products/print-next`

- [ ] **Step 1: Write frontend helper tests where practical**

Add pure helper tests for grouping products by status and sellability badge class.

- [ ] **Step 2: Implement API client helpers**

Add `fetchProducts`, `createProduct`, `updateProduct`, `fetchPrintNextProducts`.

- [ ] **Step 3: Implement Kanban cards**

Cards show photo/placeholder, name, category, source/license badge, price, and can-sell indicator. Status updates use PATCH.

- [ ] **Step 4: Implement catalog grid**

Search/filter client-side by name, category, status, source, and sellability.

- [ ] **Step 5: Implement detail view**

Show photos, files, listing URLs, license warning, notes, and estimate fields. Editing can be basic form fields in v1.

- [ ] **Step 6: Implement print-next view**

Show active/selling-well products with restock priority not `none`, sorted urgent/high first.

- [ ] **Step 7: Verify**

Run:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

- [ ] **Step 8: Commit**

```bash
git add frontend frontend/dist tests
git commit -m "feat: add product pipeline UI"
```

---

### Task 6: Documentation and Final Verification

**Files:**

- Modify: `README.md`

- [ ] **Step 1: Document workflow**

Add a concise section explaining Product Pipeline statuses, license colors, and how it connects to jobs/catalog files.

- [ ] **Step 2: Full verification**

Run:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add README.md frontend/dist
git commit -m "docs: describe product pipeline workflow"
```

---

## Self-Review

- Spec coverage: schema, existing app connection, card UI, license logic, computed fields, seed data, and print-next workflow are covered.
- Placeholder scan: no TODO/TBD placeholders remain; implementation details are concrete enough for execution.
- Type consistency: product status/license/source IDs are consistent across schema, rules, model, API, and UI tasks.
- Scope check: spool inventory and full inventory accounting are explicitly excluded. This remains a product pipeline/catalog feature.
