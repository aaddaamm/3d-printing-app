# Code quality: Unreachable error in fetchWithRetry

**Priority:** Medium
**File:** `lib/fetch.ts:43-44`

## Problem

The final error throw in `fetchWithRetry` is unreachable because the loop always either returns success or throws on failure. The loop condition `attempt <= retries` ensures completion.

```typescript
throw new Error("fetchWithRetry: exhausted retries");
```

This is dead code and should be removed or the logic restructured to make it reachable.

## Approach

Remove the unreachable line. TypeScript will still be satisfied because all code paths are covered.

## Impact

Code smell only — no functional issue, but confuses maintainers.
