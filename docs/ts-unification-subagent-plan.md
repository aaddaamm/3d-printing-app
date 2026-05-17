# TypeScript-Only Unification Plan (Subagent Execution Guide)

## Goal

Migrate this repo to an exclusively TypeScript workflow across backend, frontend, shared contracts, tests, and lint/typecheck gates.

## Success Criteria

- No app/source `.js` files remain in backend/frontend (except generated artifacts if any).
- Frontend is built via TypeScript toolchain (Vite + Preact + TS).
- Shared API/domain contracts live in `shared/types` and are consumed by both backend + frontend.
- ESLint includes frontend (no `frontend/` ignore).
- CI/local quality gates pass: `npm run lint`, `npm run typecheck`, `npm test`.

## Constraints

- Preserve current runtime behavior and API payload shapes.
- Keep route URLs stable.
- Keep current pricing/session logic untouched unless required for typing.
- Use atomic commits and conventional commit messages.

## Execution Strategy

Use sequential phases with parallelizable units inside each phase.

---

## Phase 1 — TS Configuration Foundation

### Unit 1.1: Config split

**Files:** `tsconfig.json`, `tsconfig.base.json` (new), `tsconfig.backend.json` (new), `tsconfig.frontend.json` (new)

**Tasks:**

- Create shared strict base config.
- Add backend/frontend specialized configs.
- Ensure `npm run typecheck` runs both configs.

**Checks:**

- `npm run typecheck` passes.

### Unit 1.2: Shared types scaffold

**Files:** `shared/types/api.ts` (new), `shared/types/domain.ts` (new)

**Tasks:**

- Introduce common DTO and domain interfaces without changing runtime behavior.
- Re-export from `shared/types/index.ts`.

**Checks:**

- Backend compiles against shared types.

---

## Phase 2 — Frontend TS Toolchain

### Unit 2.1: Vite + Preact TS setup

**Files:** `package.json`, `vite.config.ts` (new), `frontend/src/main.tsx` (new), `frontend/index.html` (or migrate shell)

**Tasks:**

- Add Vite build/dev scripts.
- Configure Preact + TS support.
- Preserve current injected config behavior from server.

**Checks:**

- `npm run dev:ui` and `npm run build:ui` work.

### Unit 2.2: Server static serving update

**Files:** `routes/ui.ts`

**Tasks:**

- Serve Vite build artifacts in production.
- Preserve fallback shell + route behavior.

**Checks:**

- UI loads and works via server route.

---

## Phase 3 — Frontend Migration JS → TS/TSX

### Unit 3.1: Core app conversion

**Files:** `frontend/app.js` and key modules under `frontend/components`, `frontend/lib`, `frontend/hooks`

**Tasks:**

- Convert to `.ts/.tsx` incrementally.
- Add typed API client wrappers.
- Resolve implicit-any and nullability edges.

**Checks:**

- Frontend typecheck passes.
- Existing UI flows remain functional.

### Unit 3.2: Component-by-component conversion

**Files:** remaining frontend JS modules

**Tasks:**

- Convert each component with typed props.
- Replace ad-hoc shapes with shared interfaces.

**Checks:**

- No source JS modules remain in frontend.

---

## Phase 4 — API Contract Unification

### Unit 4.1: Backend route typing

**Files:** `routes/*.ts`, `models/*.ts`, `shared/types/api.ts`

**Tasks:**

- Type route responses and request payloads against shared DTOs.
- Keep error payload shape `{ error: string }`.

**Checks:**

- Route tests unchanged and passing.

### Unit 4.2: Frontend client typing

**Files:** `frontend/src/lib/api.ts` (or equivalent)

**Tasks:**

- Strongly type all API fetch helpers.
- Use discriminated types or generic helpers for responses.

**Checks:**

- No `any` in API client path.

---

## Phase 5 — Lint/Quality Unification

### Unit 5.1: ESLint enable frontend

**Files:** `eslint.config.js`

**Tasks:**

- Remove `frontend/` ignore.
- Add frontend TS/TSX lint rules (Preact/hooks).

**Checks:**

- `npm run lint` passes for entire repo.

### Unit 5.2: Scripts + CI consistency

**Files:** `package.json`, CI config (if present)

**Tasks:**

- Ensure lint/typecheck/test cover full stack.

**Checks:**

- All quality gates pass locally + CI.

---

## Phase 6 — Cleanup and Docs

### Unit 6.1: Remove legacy JS paths

**Files:** legacy frontend JS files, obsolete scripts

**Tasks:**

- Delete superseded JS source files.
- Remove no-build compatibility code.

### Unit 6.2: Documentation

**Files:** `README.md`, `AGENTS.md`, any dev docs

**Tasks:**

- Update setup and workflow docs for TS-only architecture.

---

## Subagent Orchestration Guidance

Yes, this work can be executed by subagents.

### Recommended split

- **Subagent A (Platform):** TS configs, scripts, Vite scaffolding.
- **Subagent B (Backend):** shared types + route/model contract typing.
- **Subagent C (Frontend):** component conversion JS→TS/TSX.
- **Subagent D (Quality):** ESLint unification + CI/script cleanup.
- **Subagent E (Docs):** migration notes and contributor docs.

### Dependency order

1. A starts first.
2. B and C run in parallel after A baseline lands.
3. D runs after B/C mostly complete.
4. E finalizes after D.

### Parallel safety notes

- Avoid concurrent edits to same files (`package.json`, `eslint.config.js`, `routes/ui.ts`).
- Use short-lived branches/worktrees per subagent.
- Merge via small, reviewed PRs per phase.

## Verification Matrix (each phase)

- `npm run lint`
- `npm run typecheck`
- `npm test`
- Manual smoke test: dashboard load, modal pricing, project/job patch flows.

## Definition of Done

- TS-only source workflow complete.
- Frontend included in lint/typecheck.
- Tests green.
- Docs updated.
