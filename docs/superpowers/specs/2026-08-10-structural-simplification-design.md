# Structural Simplification Design

## Goal

Simplify PrintWorks' internal code structure while preserving all current user-visible behavior, public HTTP routes, database schema, CLI commands, and existing workflows.

## Decisions

- Retain the current stack: Preact, Vite, Hono, TypeScript, and SQLite.
- Do not migrate frontend frameworks.
- Refactor aggressively within internal boundaries when that reduces long-term coupling.
- Defer coverage-tooling changes; continue to use the existing test and smoke-test suite as the compatibility gate.

## Target Architecture

Organize code by feature domain:

```text
frontend/features/{products,catalog,history,pricing,admin}/
  views, local state/hooks, feature API adapter, small components

routes/
  thin HTTP handlers: validation, status mapping, feature registration

services/{products,catalog,history,pricing}/
  use-case orchestration and domain rules

models/{products,catalog,history,pricing}/
  focused SQLite repositories and transaction helpers

shared/
  API request/response contracts and domain-neutral types
```

Rules:

- UI components do not coordinate unrelated feature state.
- Routes validate/map HTTP concerns but do not own persistence or domain orchestration.
- Services own use cases and domain rules; models own SQL and data mapping.
- Cross-domain interaction uses explicit service interfaces or shared contracts, never deep imports into another domain's internals.
- Existing routes, URLs, database schema, CLI behavior, and UI behavior remain compatible through adapters while internals migrate.

## Migration Strategy

Use independent, behavior-preserving slices rather than a big-bang rewrite:

1. Create the target boundary and move code behind it.
2. Preserve current caller behavior with temporary adapters.
3. Move callers to the new interface.
4. Remove legacy glue only when the slice is verified.

Refactor domains in this order:

1. Products and Pricing, the highest-coupling persistence and UI cluster.
2. Catalog, including scanner, adoption, gallery, and product linkage.
3. Print History and Projects, including sync, normalization, sessions, and project workflows.
4. Admin and the shared application shell after feature ownership is clear.

## Interfaces and Verification

- Preserve existing HTTP endpoint paths and response shapes.
- Each domain exposes a small public surface: service use cases, focused model operations, and a frontend feature entry point/API adapter.
- Replace repeated catch-all error handling with domain error translation and consistent route-level HTTP mapping.
- Add characterization coverage before relocating behavior: service tests for domain rules, route tests for compatibility, and mounted frontend tests for critical flows.
- Every completed slice must pass `npm run lint`, `npm run typecheck`, `npm test`, and `npm run smoke`.

## Non-goals

- No UI redesign or feature removal.
- No frontend framework migration.
- No database-schema rewrite unless a future slice independently demonstrates that one is needed.
- No coverage-tooling or CI expansion in this effort.
