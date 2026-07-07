# Plan

## Problem summary

Expose the existing index-first catalog scanner through a minimal local API and UI: roots list/add/deactivate plus synchronous scan button/result.

## Relevant learnings

- `docs/solutions/architecture/2026-07-06-index-first-catalog-scanner-failure-accounting.md`
- `docs/solutions/architecture/2026-07-06-catalog-foundation-schema-parity.md`

## Scope boundaries

In scope:

- API endpoints for roots and synchronous scan.
- Minimal UI controls for roots and scan.
- Tests for API behavior and package integration where relevant.

Out of scope:

- Product/asset adoption.
- File browser.
- Background scan queue.
- Managed storage.
- Auth changes.

## Architecture decisions

No ADR-worthy decisions. This is a thin local API/UI wrapper around the existing scanner module.

## Implementation units

### Unit 1 — Catalog API/model endpoints

#### Goal

Add model/route handlers for scan root CRUD-lite and synchronous scan.

#### Files

- `models/catalog.ts`
- `routes/catalog.ts`
- `api.ts`
- `tests/catalog-routes.test.ts`

#### RED

Write failing tests for:

- `GET /catalog/roots` returns roots.
- `POST /catalog/roots` adds a root.
- `DELETE /catalog/roots/:id` deactivates root.
- `POST /catalog/scan` returns aggregate summary.

#### GREEN

Implement model functions and route wiring.

#### Verification

```bash
npm test -- tests/catalog-routes.test.ts
npm run typecheck
```

### Unit 2 — Minimal frontend controls

#### Goal

Add UI for roots and scan button/result.

#### Files

- `frontend/app.js` or current frontend route/component files
- `frontend/components/*` as needed
- `frontend/app.css`
- tests only if existing frontend tests cover component behavior

#### RED

If practical, add route/static tests asserting the UI shell references the catalog component or route. Otherwise keep change small and verify by build/typecheck where applicable.

#### GREEN

Implement minimal UI: roots list, add root form, deactivate, scan button, summary result, toast errors.

#### Verification

```bash
npm run build:ui
npm run typecheck
npm run lint
```

### Unit 3 — Final verification and docs

#### Goal

Update README usage and run full verification.

#### Files

- `README.md`

#### Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build:ui
```
