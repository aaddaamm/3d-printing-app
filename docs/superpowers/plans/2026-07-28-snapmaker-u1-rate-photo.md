# Snapmaker U1 Rate and Photo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure the active Snapmaker U1 at `$0.8996666667/hour` and render the selected official hero image in PrintWorks printer cards.

**Architecture:** Reuse the existing local machine-rate upsert and fixed static printer-photo registry. Commit a normalized WebP asset and fixed `snapmaker-u1` route mapping; write the approved rate into the local SQLite database as operational data rather than a migration.

**Tech Stack:** TypeScript, Preact + htm, Hono, better-sqlite3, Sharp, Vitest

## Global Constraints

- The exact imported model key is `Snapmaker U1`.
- Rate inputs are purchase price `$899`, lifetime `3,000` hours, electricity `$0.10/hour`, and maintenance `$0.50/hour`.
- The calculated persisted rate is `899 / 3000 + 0.10 + 0.50 = 0.8996666667/hour`; UI display rounds to `$0.90/hour`.
- Use the selected official Snapmaker hero image; never hotlink it at runtime.
- Normalize the downloaded image to `frontend/public/printers/snapmaker-u1.webp` with maximum dimensions `1200 × 1200`, preserved aspect ratio, and WebP quality `85`.
- Do not add a schema migration or database-backed printer-image registry.
- Do not commit `bambu_print_history.sqlite` or any backup/database sidecar.
- Preserve every unrelated working-tree edit in the main checkout.

---

### Task 1: Render the Snapmaker U1 printer photo

**Files:**

- Create: `frontend/public/printers/snapmaker-u1.webp`
- Modify: `frontend/components/jobs-printer-breakdown.ts:16-21`
- Modify: `routes/ui.ts:27-47`
- Modify: `tests/jobs-printer-breakdown.test.ts`
- Create: `tests/ui-printer-photo-routes.test.ts`

**Interfaces:**

- Consumes: imported printer model string `Snapmaker U1`; existing `createUiApp()` and fixed `/ui/printers/:slug` route.
- Produces: exported `getPrinterPhotoUrl(deviceModel: string): string | null`; local route `/ui/printers/snapmaker-u1`; committed WebP asset.

- [ ] **Step 1: Write the failing frontend mapping test**

Extend `tests/jobs-printer-breakdown.test.ts` to import `getPrinterPhotoUrl` and assert exact and normalized model behavior:

```ts
import {
  getPrinterPhotoUrl,
  jobsForInventoryPrinter,
} from "../frontend/components/jobs-printer-breakdown.js";

it("maps Snapmaker U1 inventory models to the local printer photo", () => {
  expect(getPrinterPhotoUrl("Snapmaker U1")).toBe("/ui/printers/snapmaker-u1");
  expect(getPrinterPhotoUrl("SNAPMAKER U1")).toBe("/ui/printers/snapmaker-u1");
  expect(getPrinterPhotoUrl("Unknown Printer")).toBeNull();
});
```

- [ ] **Step 2: Write the failing media-route test**

Create `tests/ui-printer-photo-routes.test.ts`. Mock only DB/cover dependencies required to construct `createUiApp()`, request `/ui/printers/snapmaker-u1`, and assert:

```ts
const response = await createUiApp().request("/ui/printers/snapmaker-u1");
expect(response.status).toBe(200);
expect(response.headers.get("content-type")).toBe("image/webp");
expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(1_000);

expect((await createUiApp().request("/ui/printers/not-real")).status).toBe(404);
expect((await createUiApp().request("/ui/printers/../secret")).status).toBe(404);
```

- [ ] **Step 3: Run the focused tests to verify RED**

Run:

```bash
npm test -- tests/jobs-printer-breakdown.test.ts tests/ui-printer-photo-routes.test.ts
```

Expected: FAIL because `getPrinterPhotoUrl` is not exported/mapped and the U1 route asset is absent.

- [ ] **Step 4: Download and normalize the approved official image**

Run this from the isolated worktree:

```bash
node <<'NODE'
const sharp = (await import("sharp")).default;
const url = "https://shop.snapmaker.com/cdn/shop/files/SnapmakerU13DPrinter_1.webp?crop=center&height=1200&v=1784886369&width=1200";
const response = await fetch(url);
if (!response.ok) throw new Error(`U1 image download failed: ${response.status}`);
const source = Buffer.from(await response.arrayBuffer());
const metadata = await sharp(source).metadata();
if (!metadata.width || !metadata.height) throw new Error("U1 image did not decode");
await sharp(source)
  .rotate()
  .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
  .webp({ quality: 85 })
  .toFile("frontend/public/printers/snapmaker-u1.webp");
NODE
```

Read the generated metadata with Sharp and require format `webp`, positive dimensions no greater than `1200 × 1200`, and a nontrivial byte size.

- [ ] **Step 5: Add the fixed model and route mappings**

Export and extend the frontend resolver:

```ts
export function getPrinterPhotoUrl(deviceModel: string): string | null {
  const normalized = deviceModel.toLowerCase();
  if (normalized.includes("a1 mini")) return "/ui/printers/a1-mini";
  if (normalized.includes("p1s")) return "/ui/printers/p1s";
  if (normalized.includes("snapmaker u1")) return "/ui/printers/snapmaker-u1";
  return null;
}
```

Add `snapmaker-u1` to `PRINTER_PHOTO_CANDIDATES` using the same source/build paths as the existing printers:

```ts
[
  "snapmaker-u1",
  [
    path.resolve(process.cwd(), "frontend/public/printers/snapmaker-u1.webp"),
    path.resolve(process.cwd(), "dist/frontend/public/printers/snapmaker-u1.webp"),
  ],
],
```

- [ ] **Step 6: Run focused tests and build**

Run:

```bash
npm test -- tests/jobs-printer-breakdown.test.ts tests/ui-printer-photo-routes.test.ts
npm run typecheck
npm run build
```

Expected: mapping and route tests PASS; built assets include the U1 image.

- [ ] **Step 7: Commit the photo support**

```bash
git add frontend/public/printers/snapmaker-u1.webp \
  frontend/components/jobs-printer-breakdown.ts routes/ui.ts \
  tests/jobs-printer-breakdown.test.ts tests/ui-printer-photo-routes.test.ts
git commit -m "feat: render Snapmaker U1 printer photo"
```

---

### Task 2: Configure and verify the Snapmaker U1 machine rate

**Files:**

- Modify: `tests/rates-model.test.ts`
- Operational data only: `bambu_print_history.sqlite` in the main checkout; never stage or commit it.

**Interfaces:**

- Consumes: `upsertMachineRate(data: Omit<MachineRate, "machine_rate_per_hr">): MachineRate`; environment variable `BAMBU_DB`.
- Produces: local `machine_rates` row keyed by `Snapmaker U1` with calculated `machine_rate_per_hr ≈ 0.8996666667`.

- [ ] **Step 1: Write the U1 rate regression test**

Add to `tests/rates-model.test.ts`:

```ts
it("computes the approved Snapmaker U1 machine rate", () => {
  mockGetMachine.mockReturnValue({
    device_model: "Snapmaker U1",
    purchase_price: 899,
    lifetime_hrs: 3000,
    electricity_rate: 0.1,
    maintenance_buffer: 0.5,
    machine_rate_per_hr: 899 / 3000 + 0.1 + 0.5,
  });

  upsertMachineRate({
    device_model: "Snapmaker U1",
    purchase_price: 899,
    lifetime_hrs: 3000,
    electricity_rate: 0.1,
    maintenance_buffer: 0.5,
  });

  expect(mockUpsertMachineRun).toHaveBeenCalledWith(
    expect.objectContaining({
      device_model: "Snapmaker U1",
      machine_rate_per_hr: expect.closeTo(0.8996666667, 9),
    }),
  );
});
```

If the installed Vitest version does not support `expect.closeTo` as an asymmetric matcher, inspect the captured call and use `toBeCloseTo(0.8996666667, 9)`.

- [ ] **Step 2: Run the focused rate test**

```bash
npm test -- tests/rates-model.test.ts
```

Expected: PASS because the existing generic formula supports the approved U1 inputs.

- [ ] **Step 3: Commit the U1 regression test**

```bash
git add tests/rates-model.test.ts
git commit -m "test: verify Snapmaker U1 machine rate"
```

- [ ] **Step 4: Back up and upsert the local operational rate**

Run from the main checkout after the feature commits are integrated:

```bash
cp -p bambu_print_history.sqlite "/tmp/bambu_print_history-before-u1-rate-$(date +%Y%m%d-%H%M%S).sqlite"
BAMBU_DB=./bambu_print_history.sqlite npx tsx <<'TS'
import { db } from "./lib/db.ts";
import { upsertMachineRate } from "./models/rates.ts";

const result = upsertMachineRate({
  device_model: "Snapmaker U1",
  purchase_price: 899,
  lifetime_hrs: 3000,
  electricity_rate: 0.1,
  maintenance_buffer: 0.5,
});
console.log(JSON.stringify(result));
db.close();
TS
```

- [ ] **Step 5: Read back the exact local row**

Use a read-only better-sqlite3 query and assert:

```ts
expect(row).toMatchObject({
  device_model: "Snapmaker U1",
  purchase_price: 899,
  lifetime_hrs: 3000,
  electricity_rate: 0.1,
  maintenance_buffer: 0.5,
});
expect(row.machine_rate_per_hr).toBeCloseTo(0.8996666667, 9);
```

Do not stage the database, WAL/SHM files, or backup.

---

### Task 3: Final verification and delivery

**Files:**

- Verify only; no planned source changes.

**Interfaces:**

- Consumes: Task 1 photo route/asset and Task 2 local rate row.
- Produces: reviewed commits plus verified local U1 rate/rendering support.

- [ ] **Step 1: Run proactive diagnostics**

Run primary LSP diagnostics on all changed TypeScript files and `lens_diagnostics mode=all`. Resolve newly introduced blockers; disposition only verified heuristic false positives.

- [ ] **Step 2: Run the repository gate**

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Expected: all commands PASS.

- [ ] **Step 3: Verify the rendered asset and local rate**

Start or use the local API, request `/ui/printers/snapmaker-u1`, and require HTTP 200 with `Content-Type: image/webp`. Query `machine_rates` read-only and require the approved U1 values and calculated rate.

- [ ] **Step 4: Review the complete feature diff**

Review from the design commit through the implementation head for correctness, asset licensing/provenance, route containment, rate accuracy, test coverage, and accidental inclusion of database/runtime files.

- [ ] **Step 5: Integrate and report**

Merge or fast-forward the isolated branch, push reviewed commits, and report:

- machine rate `$0.8996666667/hour` (`$0.90/hour` displayed);
- committed asset path and source provenance;
- verification results;
- local database readback;
- confirmation that unrelated main-worktree edits were preserved.
