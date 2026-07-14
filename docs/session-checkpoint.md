# Session Checkpoint

## Timestamp

- 2026-07-14 10:46 EDT

## Goal

- Reconcile project/agent documentation and begin the hybrid catalog inbox and managed-library design.

## Completed

- Audited documentation, agent guidance, scanner behavior, and current catalog data.
- Made `AGENTS.md` canonical and reduced duplicated Claude-specific guidance.
- Added review states for legacy, inbox, referenced, and ignored catalog files.
- Added non-destructive inbox adoption into new or existing products.
- Added inbox UI, adoption/ignore controls, history events, and responsive fixes.
- Verified migration 18 against a SQLite backup containing 5,240 catalog files.

## In Progress

- Issue #43 remains open for folder/package grouping, move reconciliation, root-failure safety,
  and opt-in managed copy/move operations.
- The working tree also contains pre-existing catalog preview/gallery and provider changes from
  before this work block; preserve them when committing.

## Blockers / Risks

- The default shell uses Node 26 while the installed `better-sqlite3` binary targets Node 24.
  Run native tests with the installed Node 24 path or rebuild dependencies intentionally.
- The production build reports existing unresolved-at-build-time font URL warnings.

## Validation Status

- `npm run lint`: pass
- `npm run typecheck`: pass
- `npm run build`: pass with existing font URL warnings
- `npm test`: 294 pass under Node 24
- Browser QA: desktop and 390px mobile pass; adoption interaction verified on a database backup

## Related Issues / PRs

- #43 — hybrid catalog inbox and managed design library; first non-destructive slice implemented
- #31 — generalized documentation/naming remains open

## Next 3 Actions

1. Group inbox discoveries into folder/package-level design candidates.
2. Add hash-based move/rename reconciliation and unreadable-root safety.
3. Design opt-in managed copy/move previews and a canonical library layout.

## Resume Commands

```bash
git status --short
git log --oneline -n 10
npm run lint && npm run typecheck
PATH=/Users/adam/.nvm/versions/node/v24.14.0/bin:$PATH npm test
```
