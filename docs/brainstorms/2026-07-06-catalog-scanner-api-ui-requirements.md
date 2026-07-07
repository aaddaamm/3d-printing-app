# Requirements

## Problem

The catalog scanner exists as a CLI, but there is no in-app way to see configured scan roots or run a scan. Add a minimal API/UI surface to make the scanner usable from the local app without expanding into product adoption or catalog browsing.

## Goals

- Add local API endpoints for scan root listing, scan root creation/deactivation, and running scans.
- Add a minimal UI section/page that shows scan roots and provides a scan button.
- The scan button should wait for scan completion and display the concise result summary.
- Preserve the current index-first behavior: no file copying, moving, product/asset creation, or adoption.
- Keep current jobs/projects/pricing/sync behavior unchanged.

## Non-goals

- No product/asset adoption UI.
- No indexed file browser in this slice.
- No background scan queue or scheduler.
- No auth changes.
- No managed storage adoption.

## Recommended direction

Build a small `catalog` API route and minimal frontend component:

- `GET /catalog/roots` — list roots.
- `POST /catalog/roots` — add root `{ rootPath, name? }`.
- `DELETE /catalog/roots/:id` — deactivate root.
- `POST /catalog/scan` — scan active roots synchronously and return aggregate summary.
- UI: show root list, add root form, deactivate controls, scan button, last scan summary.

## Success criteria

- User can add/list/deactivate scan roots from the UI.
- User can run a scan from the UI and see summary counts.
- API tests cover roots and scan endpoint behavior.
- UI changes are minimal and do not require a build system change.
- `npm run typecheck`, `npm run lint`, and `npm test` pass.
