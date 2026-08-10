# Structural simplification design

## Goal

Reduce internal coupling without changing documented external HTTP, CLI, database/file-effect, or critical UI-flow contracts.

This is a staged refactor. A migration group starts only after its external behavior is recorded in tests. A passing smoke test alone does not prove compatibility.

## Decisions

- Retain Preact, Vite, Hono, TypeScript, and SQLite.
- Do not migrate frontend frameworks, redesign the UI, or rewrite the SQLite schema.
- Preserve external contracts, not legacy internal import paths. Migrate callers incrementally and delete obsolete modules after production callers have moved.
- Extend coverage to every migrated production path. Do not lower existing thresholds or change CI infrastructure.
- Do not introduce a generic service framework or a one-implementation interface without a tested seam.
- Treat shared database bootstrap, migrations, transaction helpers, and server startup as infrastructure, not feature compatibility modules.

## Scope and ownership

Every active external surface has one migration owner. No group is complete while an owned surface lacks an inventory entry, an external-contract test, or an explicit out-of-scope classification.

| Owner | Surfaces and behavior |
| --- | --- |
| Baseline and seams | Effective HTTP-route inventory, CLI inventory, critical-flow inventory, shared database bootstrap and migrations, transaction helpers, server bootstrap, coverage configuration, and the `baseline` reporting script. |
| Print history and provider sync | `/tasks`, `/jobs`, `/projects`, `/printers`, `/summary`, and `/api/sync`; session detection, normalization, auto-grouping, pricing caches, providers, covers, locks, scheduling, and the `sync`, `sync:bambu`, `sync:moonraker`, `normalize`, and `covers:repair` commands. |
| Commercial production | `/api/products`, `/api/batches`, `/api/price-quotes`, and `/rates`; product creation, images, saved pricing, batches, quotes, and rate lookup. It depends on the documented Jobs and Projects read contracts. |
| Catalog | `/catalog` and the `catalog` command; scan roots, scans, gallery, duplicates, previews, adoption, and product-file links. Adoption depends on the documented Commercial production product-creation contract. |
| Application shell | `/ui`, `/health`, static and data endpoints registered by the UI sub-app, shared frontend state, bootstrap, navigation, and toasts. |

`api.ts` remains a composition root. It may import route modules, application-wide middleware, and named server-runtime infrastructure for host resolution, serving, logging, and scheduler startup. It must not contain feature-domain behavior.

## Target boundaries

Organize migrated code by behavior, not by a directory-only taxonomy:

```text
routes/
  HTTP parsing, validation, status/body mapping, and route registration

features/<group>/server/
  service.ts          use-case orchestration and transaction boundary
  repository.ts       SQLite queries and row mapping
  errors.ts           domain errors and HTTP-mapping inputs
  contracts.ts        request/result types shared by another feature

features/<group>/client/
  views, hooks, local state, API adapter, and small components

lib/server/
  shared server bootstrap, middleware, health probes, and scheduling

lib/db/
  SQLite bootstrap, migrations, statements, and transaction helpers

shared/
  public HTTP request/response contracts and domain-neutral types
```

Only a moved feature path may use a temporary forwarding module. Shared infrastructure stays at its infrastructure boundary; it does not pretend to delegate to a feature. Remove forwarding modules after no production caller imports them.

Rules:

- Feature routes do not execute domain SQL or make domain decisions. Health and readiness routes may perform bounded database probes through `lib/server/` infrastructure.
- Repositories own SQL, row mapping, and database-local lookup helpers.
- Services own use cases, business-rule validation, and transaction boundaries.
- Client features do not own unrelated feature state. The application shell owns cross-feature navigation and bootstrap state.
- A domain service cannot import another domain service's private implementation.
- A cross-domain workflow service may call named repository operations inside one explicit SQLite transaction when atomicity requires it.
- Cross-domain reads use a documented feature contract or repository operation. They do not duplicate SQL or expose mutable database rows.
- Each migration group names its dependencies, repository operations, transaction owner, and compatibility cases before code moves.

Catalog adoption and saved product pricing already write multiple domain records atomically. Their workflow service owns the transaction; repositories participate in that transaction and do not start nested transactions.

## Compatibility baseline

Before moving production code, create and keep a versioned compatibility inventory. It must list:

- Every effective registered HTTP endpoint, including methods and path templates registered inside Hono sub-apps. For each endpoint, record its success body, documented expected-error bodies, and status codes.
- Each user- or administrator-invoked command in `package.json`: `sync`, `sync:bambu`, `sync:moonraker`, `normalize`, `catalog`, `covers:repair`, and `baseline`. Record required environment variables, arguments, exit behavior, and observable database/file effects. Classify developer tooling commands separately.
- Critical UI flows: catalog adoption, product creation and image selection, saved product pricing, batch creation, print-history edits, and manual sync.
- SQLite tables, triggers, indexes, and migrations read or written by each group.

Add characterization tests from that inventory before relocating behavior. Test observable results, including error messages where they are documented API behavior. Do not snapshot private implementation details.

For each expected domain error, define and test its existing HTTP status/body mapping. Record unexpected-error behavior for reliability work, but do not treat accidental framework error output as a stable public contract.

## Migration strategy

Use dependency-aware groups, not nominally independent domains:

1. **Baseline and seams**: Create the compatibility inventory and characterization tests. Assign shared database/server infrastructure. Make coverage includes explicit for backend and frontend production code. Extract only shared route utilities, error mapping helpers, database transaction helpers, and server bootstrap seams needed later. Do not move feature behavior.
2. **Commercial dependency seams**: Define and test the Jobs and Projects repository operations Commercial production requires: product creation from a job or project, and batch assignment from a project. Do not move unrelated print-history behavior.
3. **Commercial production**: Migrate product creation, product images, saved product pricing, quotes, batches, and rates as coordinated workflows. `saveProductPricing`, quote calculation, and batch/product projection retain a documented transaction owner.
4. **Catalog**: Migrate scanning and read-only catalog behavior separately from adoption. Move adoption after the Commercial production product-creation contract is available and represent product creation plus product-file linking in one catalog-adoption workflow transaction.
5. **Print history and provider sync**: Migrate tasks, jobs, projects, printers, normalization, auto-grouping, derived-price-cache invalidation, providers, covers, sync locking, and scheduling. Keep CLI entry points and `/api/sync` as adapters over the same sync workflow.
6. **Frontend features and application shell**: Move client components after their server contracts are characterized. Retire `frontend/lib/api.ts` only after feature adapters own its endpoint calls. Simplify route registration, bootstrap, and navigation after feature ownership is established.

For each group:

1. Record the compatibility cases and make them pass against the current implementation.
2. Define the service boundary, repository operations, dependencies, transaction owner, and removal criteria in the implementation plan.
3. Move one vertical behavior without preserving an obsolete internal import path unless a temporary forwarding module is needed for remaining callers.
4. Move callers incrementally.
5. Delete duplicate legacy logic only after all required tests and coverage gates pass.

Do not claim that a group is complete based solely on file moves or passing type checks.

## Verification and completion criteria

Each completed vertical behavior must pass:

- Focused characterization tests for its documented HTTP, CLI, database, file-system, or UI observable behavior.
- Service tests for domain rules and transaction rollback where the service writes multiple records.
- Route tests for success and expected-error status/body compatibility.
- Mounted frontend tests for the affected documented critical flow.
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run coverage`, and `npm run smoke`.

Update `vitest.config.ts` before a production file moves outside an explicit coverage include path. Keep the current threshold values or raise them. Coverage is a regression gate, not a substitute for the compatibility inventory.

## Non-goals

- No UI redesign or feature removal.
- No frontend framework migration.
- No database-schema rewrite.
- No new CI system, coverage-threshold reduction, or generic dependency-injection framework.
- No conversion of every helper into a service. Extract a boundary only when it owns a use case, transaction, external contract, or tested dependency seam.
