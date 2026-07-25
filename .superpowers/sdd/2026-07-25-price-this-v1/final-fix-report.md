# Price-this v1 final fix report

Date: 2026-07-25

Starting head: `57be8ff910e8498e609567ae9440ec9dd4959344`

Branch: `feat/price-this-v1`

## Scope reviewed

Reviewed the Price-this implementation against the final-review findings and the implementation plan at `docs/superpowers/plans/2026-07-25-price-this-v1.md`. GitHub issue #45, “Build price-first workflow for mixed-provider production costs,” is directly relevant and remains open pending whole-feature acceptance. The unrelated untracked `.pi-subagents/` directory was not read, modified, staged, or committed.

## Implemented fixes

1. **Effective material rates**
   - `models/price-quotes.ts` now prices measured configured filaments with `rate_per_g`, not raw `cost_per_g`.
   - Missing-material and task-weight PLA fallbacks also use PLA `rate_per_g`.
   - This matches the existing pricing convention and includes each material rate's configured waste buffer exactly once.

2. **Vite development API reachability**
   - Added `/api` to the Vite proxy table.
   - Exported the small `createViteConfig(apiProxyTarget)` builder so the runtime config can be tested behaviorally without source-text inspection.
   - Existing proxy entries and the default `VITE_API_PROXY_TARGET` behavior remain unchanged.

3. **Jobs navigation state**
   - `/price` is explicitly excluded from `isJobsRoute`, so Jobs is not active while the Price-this screen is open.

4. **Unexpected route errors**
   - Added a route regression proving only `PriceQuoteValidationError` is mapped to 400; an unexpected model error propagates to Hono's error boundary.
   - No production route change was required because the handler already rethrows unexpected errors.

5. **Frontend quote helper contract**
   - Added transport-level coverage using the real fetch/request layer for the exact `/api/price-quotes/calculate` URL, POST method, JSON body, successful quote unwrapping, and error-to-null/toast behavior.
   - The test resets toast state so it cannot pass from an earlier call.
   - No production helper change was required because the existing helper already met the contract.

6. **Zero-material warning**
   - When a task has neither usable filament rows nor positive task weight, the warning now explicitly says zero material cost was used.
   - Positive task-weight fallback retains the existing PLA-rate warning.

## TDD evidence

### RED

Initial focused run:

```text
npx vitest run tests/price-quotes-model.test.ts tests/price-quotes-routes.test.ts tests/jobs-view.test.ts tests/frontend-api.test.ts tests/vite-config.test.ts
Test Files 3 failed | 2 passed (5)
Tests      4 failed | 46 passed (50)
```

Observed expected failures:

- Waste-buffer regression received `[1, 0.6]` instead of effective-rate `[1.25, 0.9]`.
- Zero-material warning still said task weight/PLA was used and did not mention zero material cost.
- `/price` returned `true` from `isJobsRoute`.
- `createViteConfig` did not yet exist, so the Vite proxy behavior test failed.
- The newly added route unexpected-error and frontend API helper regressions passed immediately because these findings required missing coverage, while the current production behavior was already correct. No artificial production change was made solely to force a failure.

### GREEN

After the minimal implementation:

```text
npx vitest run tests/price-quotes-model.test.ts tests/price-quotes-routes.test.ts tests/jobs-view.test.ts tests/frontend-api.test.ts tests/vite-config.test.ts
Test Files 5 passed (5)
Tests      50 passed (50)
```

The focused frontend transport test was rerun after strengthening toast isolation: 1 file, 7 tests passed.

## Verification

Commands run from `/Users/adam/printworks-management-app-feat-price-this-v1`:

| Command | Result |
| --- | --- |
| Focused RED Vitest command above | Expected failure: 4 targeted failures |
| Focused GREEN Vitest command above | Passed: 5 files, 50 tests |
| `npx prettier --write` on the eight scoped source/test files | Passed |
| `npx prettier --check` on the eight scoped source/test files | Passed |
| `npm run lint` | Passed with no ESLint findings |
| `npm run typecheck` | Passed backend and frontend TypeScript checks |
| `npm test` | Passed: 66 files, 464 tests |
| `npm run build` | Passed: Vite built 42 modules and build TypeScript completed |
| `git diff --check` | Passed |

The Vite build emitted only the existing informational unresolved-at-build-time font URL notices; it completed successfully.

## Changed files

- `models/price-quotes.ts`
- `frontend/components/jobs-view.ts`
- `vite.config.ts`
- `tests/price-quotes-model.test.ts`
- `tests/price-quotes-routes.test.ts`
- `tests/frontend-api.test.ts`
- `tests/jobs-view.test.ts`
- `tests/vite-config.test.ts`
- `.superpowers/sdd/2026-07-25-price-this-v1/final-fix-report.md`

## Self-review

- Confirmed both configured filament and PLA fallback paths now consume `rate_per_g`; no `cost_per_g` pricing use remains in the quote model.
- Confirmed production-loss cost is still informational/a subset of material plus machine cost and is not double-added.
- Confirmed zero material is only selected when no positive measured filament weight and no positive task weight exist.
- Confirmed the `/api` proxy uses the same target as every existing Vite proxy and the config builder introduces no runtime branch.
- Confirmed route behavior distinguishes expected validation errors from unexpected failures.
- Confirmed frontend tests exercise `fetch` through the actual request helpers rather than mocking `calculatePriceQuote` or `postJsonOrToast`.
- Reviewed the complete diff for unrelated changes; none found. `.pi-subagents/` remains untouched and untracked.

## Residual risks

- No known functional risks in the requested scope.
- Production Vite builds continue to report pre-existing font URLs that remain runtime-resolved; this is unrelated to Price-this and does not fail the build.
