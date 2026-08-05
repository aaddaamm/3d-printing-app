# Full Dependency Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade every direct outdated package to its latest release and prove the local API/UI starts cleanly.

**Architecture:** This is a manifest-and-lockfile maintenance change. Preserve the existing `allowScripts` policy for native packages, update it to the new `better-sqlite3` version, and make source/config compatibility edits only if verification identifies an incompatibility.

**Tech Stack:** npm 11, Node 24, Hono, Preact, Vite, Vitest, TypeScript, better-sqlite3.

## Global Constraints

- Upgrade all packages reported by `npm outdated` to `latest`, including major releases.
- Preserve unrelated uncommitted changes.
- Keep `allowScripts` entries accurate for installed native/build tooling.
- Do not add production code unless a major-version migration requires it.
- Prove lint, typecheck, test, build, and a live app startup.

---

### Task 1: Upgrade direct dependencies and lockfile

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**

- Consumes: npm registry package metadata and the existing npm `allowScripts` policy.
- Produces: a reproducible latest-version dependency graph under `package-lock.json` version 3.

- [ ] **Step 1: Install all direct outdated packages at `latest`**

Run:

```bash
npm install @hono/node-server@latest better-sqlite3@latest hono@latest preact@latest
npm install --save-dev @types/better-sqlite3@latest @types/node@latest @vitest/coverage-v8@latest concurrently@latest eslint@latest happy-dom@latest prettier@latest tsx@latest typescript@latest typescript-eslint@latest vite@latest vitest@latest
```

- [ ] **Step 2: Update native build authorization**

Change `package.json` so `allowScripts` authorizes the installed `better-sqlite3` version while retaining the existing `fsevents` and `esbuild` entries when still installed.

- [ ] **Step 3: Confirm installation integrity**

Run:

```bash
npm ls --depth=0
npm audit --omit=dev
```

Expected: all declared packages resolve once, and no production vulnerabilities remain.

### Task 2: Resolve major-version compatibility and verify the application

**Files:**

- Modify only if required by a failing check: `vite.config.ts`, `vitest.config.ts`, `eslint.config.js`, `tsconfig*.json`, or affected TypeScript source.

**Interfaces:**

- Consumes: upgraded Hono, Vite, Vitest, TypeScript, ESLint, Preact, and SQLite APIs.
- Produces: compatible static configuration and a runnable local server/UI.

- [ ] **Step 1: Run static checks**

Run:

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

- [ ] **Step 2: Make only migration edits identified by failures**

For each migration edit, add or amend the existing behavior-level test first, run it to observe the failure, apply the minimal compatibility change, and rerun it.

- [ ] **Step 3: Prove runtime startup**

Start the app with `npm run dev`, wait for both API and Vite to report readiness, request the UI and API health endpoint, then terminate the process.

- [ ] **Step 4: Confirm final dependency state**

Run:

```bash
npm outdated
npm audit --omit=dev
```

Expected: no listed outdated direct dependencies and no production audit vulnerabilities.
