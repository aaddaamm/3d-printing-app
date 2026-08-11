# Structural simplification baseline implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the external-contract inventory and executable verification baseline required before moving any PrintWorks feature code.

**Architecture:** Keep the current application behavior in place. Add a versioned Markdown contract inventory, tests that prevent inventory omissions, explicit coverage scope, and characterization tests beside the existing route and CLI tests. This plan deliberately stops before feature-module moves; each later migration group receives its own implementation plan after the baseline exposes its concrete dependencies.

**Tech Stack:** TypeScript, Vitest, Hono, Preact, better-sqlite3, npm scripts, Markdown.

## Global Constraints

- Preserve documented external HTTP, CLI, database/file-effect, and critical UI-flow contracts.
- Do not preserve legacy internal import paths as a public contract.
- Do not migrate the frontend framework, redesign the UI, rewrite the SQLite schema, lower coverage thresholds, or add dependency injection.
- Treat `lib/db/` and `lib/server/` as shared infrastructure.
- Do not move feature behavior in this plan.
- Every new test must assert observable behavior; do not snapshot private implementation details.
- Every task must leave `npm run lint`, `npm run typecheck`, and its focused test command passing.

---

## File structure

| File                                                          | Responsibility                                                                                                                                         |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `docs/superpowers/contracts/structural-simplification-v1.md`  | Versioned inventory of effective HTTP endpoints, supported CLI commands, UI flows, and database/file effects.                                          |
| `tests/compatibility-inventory.test.ts`                       | Guards the inventory against omitted mounted route groups, supported commands, and critical flows.                                                     |
| `tests/coverage-config.test.ts`                               | Guards explicit backend and frontend coverage includes plus unchanged threshold values.                                                                |
| `tests/package-scripts.test.ts`                               | Characterizes supported CLI npm-script entry points, including `covers:repair` and `baseline`.                                                         |
| `tests/*-routes.test.ts`                                      | Characterizes success and expected-error contracts for effective route handlers. Extend the route-specific file; do not create a catch-all route test. |
| `tests/ui-*-routes.test.ts`, `tests/app-shell-routes.test.ts` | Characterizes mounted UI data/static behavior and critical client routing/bootstrap flows.                                                             |
| `vitest.config.ts`                                            | Declares explicit production coverage paths and retains threshold values.                                                                              |
| `scripts/smoke-test.ts`                                       | Runs the coverage command as part of the smoke gate before starting the isolated API workflow.                                                         |

## Task 1: Make coverage scope and smoke enforcement explicit

**Files:**

- Create: `tests/coverage-config.test.ts`
- Modify: `vitest.config.ts:5-15`
- Modify: `scripts/smoke-test.ts:84-89`

**Interfaces:**

- Consumes: Vitest’s `coverage.include` and `coverage.thresholds` configuration.
- Produces: A coverage configuration whose production paths are explicitly `lib/**/*.ts` and `frontend/lib/**/*.ts`, plus a smoke gate that invokes `npm run coverage`.

- [ ] **Step 1: Write the failing configuration test**

```ts
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("declares explicit backend and frontend production coverage paths", () => {
  const config = readFileSync("vitest.config.ts", "utf8");

  expect(config).toContain('include: ["lib/**/*.ts", "frontend/lib/**/*.ts"]');
  expect(config).toContain("statements: 88");
  expect(config).toContain("branches: 76");
  expect(config).toContain("functions: 94");
  expect(config).toContain("lines: 92");
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/coverage-config.test.ts`

Expected: FAIL because `vitest.config.ts` contains only `lib/**/*.ts`.

- [ ] **Step 3: Declare the two explicit coverage paths and add the smoke gate**

```ts
// vitest.config.ts
include: ["lib/**/*.ts", "frontend/lib/**/*.ts"],

// scripts/smoke-test.ts
{ command: "npm", args: ["run", "coverage"], label: "npm run coverage" },
```

Insert the coverage gate after `npm test` and before `npm run build` in `GATES`.

- [ ] **Step 4: Run focused verification**

Run: `npx vitest run tests/coverage-config.test.ts && npm run coverage`

Expected: PASS; coverage reports the existing thresholds without adding non-production paths.

- [ ] **Step 5: Run style and type checks**

Run: `npm run lint && npm run typecheck`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts scripts/smoke-test.ts tests/coverage-config.test.ts
git commit -m "test: enforce explicit coverage baseline"
```

## Task 2: Characterize every supported operational CLI command

**Files:**

- Modify: `tests/package-scripts.test.ts:16-28`
- Create: `tests/cli-contracts.test.ts`
- Modify: `docs/superpowers/contracts/structural-simplification-v1.md`

**Interfaces:**

- Consumes: `package.json` scripts and the command entry files `sync-configured-providers.ts`, `dump-bambu-history.ts`, `sync-moonraker-history.ts`, `normalize.ts`, `scan-catalog.ts`, `scripts/repair-covers.ts`, and `scripts/baseline-report.ts`.
- Produces: A documented and test-protected supported-command set: `sync`, `sync:bambu`, `sync:moonraker`, `normalize`, `catalog`, `covers:repair`, and `baseline`.

- [ ] **Step 1: Write failing npm-script assertions**

```ts
it("exposes every supported operational CLI entry point", () => {
  const { scripts } = readPackageJson();

  expect(scripts["covers:repair"]).toBe("npx tsx scripts/repair-covers.ts");
  expect(scripts.baseline).toBe("npx tsx scripts/baseline-report.ts");
  expect(scripts.normalize).toBe("npx tsx normalize.ts");
});
```

- [ ] **Step 2: Write failing command-contract assertions**

```ts
it("documents supported commands and classifies developer-only scripts separately", () => {
  const inventory = readFileSync(
    "docs/superpowers/contracts/structural-simplification-v1.md",
    "utf8",
  );

  for (const command of [
    "sync",
    "sync:bambu",
    "sync:moonraker",
    "normalize",
    "catalog",
    "covers:repair",
    "baseline",
  ]) {
    expect(inventory).toContain(`| \`${command}\` |`);
  }
  expect(inventory).toContain("## Developer tooling excluded from compatibility gates");
});
```

- [ ] **Step 3: Run the tests to verify the inventory test fails**

Run: `npx vitest run tests/package-scripts.test.ts tests/cli-contracts.test.ts`

Expected: the script assertions pass only after expansion; the inventory test fails until Task 3 creates the inventory.

- [ ] **Step 4: Add the supported-command table**

For each supported command, record its entry file, accepted arguments/environment variables, success exit behavior, failure exit behavior, and observable database/file effects. Record `api`, `dev`, `build`, `test`, lint, formatting, and coverage commands under the developer-tooling heading rather than treating them as user/admin compatibility contracts.

- [ ] **Step 5: Run focused verification**

Run: `npx vitest run tests/package-scripts.test.ts tests/cli-contracts.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add tests/package-scripts.test.ts tests/cli-contracts.test.ts docs/superpowers/contracts/structural-simplification-v1.md
git commit -m "test: inventory supported CLI contracts"
```

## Task 3: Create and guard the effective HTTP and UI contract inventory

**Files:**

- Create: `docs/superpowers/contracts/structural-simplification-v1.md`
- Create: `tests/compatibility-inventory.test.ts`
- Modify: `tests/ui-cover-routes.test.ts`
- Modify: `tests/ui-printer-photo-routes.test.ts`
- Modify: `tests/ui-product-photo-routes.test.ts`
- Modify: `tests/app-shell-routes.test.ts`

**Interfaces:**

- Consumes: `api.ts` mount prefixes and registrations in every `routes/*.ts` Hono sub-app.
- Produces: A v1 inventory with an entry for every method/path template and a test that prevents removal of a route group or critical UI flow from the inventory.

- [ ] **Step 1: Write the failing inventory-completeness test**

```ts
const requiredRouteGroups = [
  "Tasks",
  "Jobs",
  "Projects",
  "Printers",
  "Summary",
  "Rates",
  "Catalog",
  "Products",
  "Batches",
  "Price quotes",
  "Sync",
  "Health",
  "UI",
];
const requiredUiFlows = [
  "Catalog adoption",
  "Product creation and image selection",
  "Saved product pricing",
  "Batch creation",
  "Print-history edits",
  "Manual sync",
];

it("lists every mounted route group and critical UI flow", () => {
  const inventory = readFileSync(
    "docs/superpowers/contracts/structural-simplification-v1.md",
    "utf8",
  );

  for (const group of requiredRouteGroups) expect(inventory).toContain(`## ${group}`);
  for (const flow of requiredUiFlows) expect(inventory).toContain(`### ${flow}`);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/compatibility-inventory.test.ts`

Expected: FAIL because the inventory does not exist.

- [ ] **Step 3: Write the v1 route inventory**

Add one table per route group. Each row contains method, full mounted path, success status/body shape, expected-error status/body shape, and the existing test file. Include every registration from these groups:

```text
/tasks; /jobs; /projects; /printers; /summary; /rates; /catalog;
/api/products; /api/batches; /api/price-quotes; /api/sync; /health; /ui
```

Expand nested UI registrations to `/ui/app.js`, `/ui/app.css`, `/ui/assets/:file`, `/ui/chunks/:file`, `/ui/fonts/:file`, `/ui/covers/:taskId`, `/ui/product-photos/:photoId`, `/ui/printers/:slug`, `/ui/printers/*`, and `/ui/data`. Record the SPA fallback separately as a shell behavior, not as an API endpoint.

- [ ] **Step 4: Add missing UI contract characterizations**

Use the existing UI route-test pattern to assert an observable success and expected missing-file/error response for each static/data route listed above. Keep the tests beside the relevant existing UI route test; add `tests/ui-data-routes.test.ts` if no existing file owns `/ui/data`.

```ts
const response = await ui.request("/data");
expect(response.status).toBe(200);
expect(await response.json()).toMatchObject({ jobs: expect.any(Array) });
```

- [ ] **Step 5: Run focused verification**

Run: `npx vitest run tests/compatibility-inventory.test.ts tests/ui-cover-routes.test.ts tests/ui-printer-photo-routes.test.ts tests/ui-product-photo-routes.test.ts tests/ui-data-routes.test.ts tests/app-shell-routes.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add docs/superpowers/contracts/structural-simplification-v1.md tests/compatibility-inventory.test.ts tests/ui-*-routes.test.ts tests/app-shell-routes.test.ts
git commit -m "test: baseline HTTP and UI contracts"
```

## Task 4: Close route-characterization gaps by ownership group

**Files:**

- Modify: `tests/jobs-routes.test.ts`, `tests/projects-routes.test.ts`, `tests/printers-routes.test.ts`, `tests/products-routes.test.ts`, `tests/batches-routes.test.ts`, `tests/price-quotes-routes.test.ts`, `tests/rates-routes.test.ts`, `tests/catalog-routes.test.ts`, `tests/sync-routes.test.ts`
- Create: `tests/tasks-routes.test.ts`, `tests/summary-routes.test.ts`, `tests/health-routes.test.ts` when an inventory row has no existing route-test owner.
- Modify: `docs/superpowers/contracts/structural-simplification-v1.md`

**Interfaces:**

- Consumes: the endpoint rows created in Task 3 and each route module’s existing exported Hono app.
- Produces: a characterization test for each documented success and expected domain-error response before any feature move.

- [ ] **Step 1: Mark each inventory row with its route-test owner**

Use the route-test file in the inventory as the checklist. A row is incomplete until its test asserts its documented status and response body. Do not create new endpoints or normalize existing error bodies in this task.

- [ ] **Step 2: Write a failing success and expected-error test for each uncovered row**

Use the established direct-Hono pattern:

```ts
const response = await products.request("/from-job/invalid", { method: "POST" });
expect(response.status).toBe(400);
expect(await response.json()).toEqual({ error: "Job ID must be a positive integer" });
```

For every route group, test the current documented response rather than an idealized new response. Mock a route dependency only to make the response deterministic.

- [ ] **Step 3: Run each group’s route tests before changing production code**

Run:

```bash
npx vitest run \
  tests/tasks-routes.test.ts tests/jobs-routes.test.ts tests/projects-routes.test.ts \
  tests/printers-routes.test.ts tests/summary-routes.test.ts tests/rates-routes.test.ts \
  tests/catalog-routes.test.ts tests/products-routes.test.ts tests/batches-routes.test.ts \
  tests/price-quotes-routes.test.ts tests/sync-routes.test.ts tests/health-routes.test.ts
```

Expected: PASS.

- [ ] **Step 4: Record intentional unexpected-error exclusions**

For each route, document expected domain errors only. Add a single inventory note that unexpected errors are recorded for later reliability work and are not frozen as response contracts.

- [ ] **Step 5: Commit**

```bash
git add tests/*-routes.test.ts docs/superpowers/contracts/structural-simplification-v1.md
git commit -m "test: characterize route compatibility contracts"
```

## Task 5: Characterize cross-domain dependency seams and transaction rollback

**Files:**

- Modify: `tests/products-model.test.ts`, `tests/batches-model.test.ts`, `tests/catalog-adoption.test.ts`, `tests/saved-product-pricing.test.ts`
- Modify: `docs/superpowers/contracts/structural-simplification-v1.md`

**Interfaces:**

- Consumes: product creation from jobs/projects, batch project assignment, catalog adoption, and saved product pricing.
- Produces: documented Jobs/Projects read dependencies and rollback assertions for workflows that write multiple records.

- [ ] **Step 1: Add failing product and batch dependency tests**

```ts
expect(createProductFromJob(job.id)).toMatchObject({ id: expect.any(Number) });
expect(listProductJobs(product.id)).toContainEqual(expect.objectContaining({ job_id: job.id }));

expect(assignProjectToBatch(batch.id, project.id)).toEqual(
  expect.objectContaining({ batch_id: batch.id }),
);
expect(listBatchJobs(batch.id)).toContainEqual(expect.objectContaining({ project_id: project.id }));
```

Use the existing database fixtures in the target test files. Assert the created links, not SQL implementation details.

- [ ] **Step 2: Add failing rollback assertions for adoption and saved pricing**

```ts
expect(() => adoptCatalogCandidate(invalidCandidate)).toThrow();
expect(listProductFiles(product.id)).toHaveLength(0);
expect(getCatalogFile(file.id).review_status).toBe("inbox");
```

Use an invalid primary file or invalid product input that fails after transaction setup. Confirm no partial product-file link or catalog review transition persists.

- [ ] **Step 3: Document the seam contract**

Add a “Cross-domain workflows” section that names:

- Jobs/Projects reads required by Commercial production.
- Commercial product creation required by Catalog adoption.
- The single transaction owner for catalog adoption and saved product pricing.
- The rollback test file for each workflow.

- [ ] **Step 4: Run focused verification**

Run: `npx vitest run tests/products-model.test.ts tests/batches-model.test.ts tests/catalog-adoption.test.ts tests/saved-product-pricing.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/products-model.test.ts tests/batches-model.test.ts tests/catalog-adoption.test.ts tests/saved-product-pricing.test.ts docs/superpowers/contracts/structural-simplification-v1.md
git commit -m "test: characterize cross-domain workflow seams"
```

## Task 6: Run the baseline gate and split follow-up migration plans

**Files:**

- Modify: `docs/superpowers/contracts/structural-simplification-v1.md`
- Create: `docs/superpowers/plans/2026-08-10-commercial-production-migration.md`
- Create: `docs/superpowers/plans/2026-08-10-catalog-migration.md`
- Create: `docs/superpowers/plans/2026-08-10-print-history-provider-sync-migration.md`
- Create: `docs/superpowers/plans/2026-08-10-frontend-shell-migration.md`

**Interfaces:**

- Consumes: passing baseline inventory, coverage, route, UI, CLI, and transaction tests.
- Produces: four dependency-ordered feature-migration plans. No feature code moves in this task.

- [ ] **Step 1: Run the complete baseline command set**

Run:

```bash
npm run lint
npm run typecheck
npm test
npm run coverage
npm run smoke
```

Expected: every command exits successfully. Resolve baseline failures before planning a feature move.

- [ ] **Step 2: Record the verification receipt**

Add a dated “Baseline verification” entry to the inventory with the exact commands and their pass result. Do not claim a feature group is complete; this receipt proves only that characterization is ready.

- [ ] **Step 3: Create one plan per remaining migration group**

Each plan must identify exact files, route-contract rows, repository operations, cross-domain dependencies, transaction owner, forwarding-module deletion criteria, focused tests, and the global verification commands. Keep Commercial production before Catalog adoption, and split Print history/provider sync from frontend/application-shell work.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/contracts/structural-simplification-v1.md docs/superpowers/plans
git commit -m "docs: plan structural simplification migrations"
```
