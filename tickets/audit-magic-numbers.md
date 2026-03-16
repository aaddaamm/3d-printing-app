# Maintainability: Magic numbers scattered across codebase

**Priority:** Low
**Files:** Multiple

## Problem

Constants are hardcoded in various places:
- `SESSION_GAP_S = 4 * 3600` (normalize.ts:18) — 4-hour session gap threshold
- `LIMIT = 1000` (dump-bambu-history.ts:59) — API page size
- `timeout 10_000` (lib/fetch.ts:23) — fetch timeout ms
- `maxAge: 60 * 60 * 24 * 90` (routes/ui.ts:81) — 90-day session cookie lifetime

## Approach

Create `lib/constants.ts`:

```typescript
export const SESSION_GAP_HOURS = 4;
export const API_PAGE_LIMIT = 1000;
export const FETCH_TIMEOUT_MS = 10_000;
export const SESSION_MAX_AGE_DAYS = 90;
```

Import in each file.

## Impact

Easier to tune behavior and document intent. Not urgent.
