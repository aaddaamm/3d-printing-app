# Reliability: Cover download lacks retry logic

**Priority:** Medium
**File:** `lib/covers.ts:54`

## Problem

Cover downloads use bare `fetch()` without retry logic, unlike `lib/fetch.ts` which has exponential backoff. Transient network errors will immediately fail.

```typescript
const resp = await fetch(task.cover);
```

## Approach

Use `fetchWithRetry` from `lib/fetch.ts`:

```typescript
const resp = await fetchWithRetry(task.cover, {}, { retries: 2, timeoutMs: 5000 });
```

## Tradeoff

- **Pro:** Resilient to transient failures
- **Con:** Slower (up to 2 retries * 5s timeout = 10s extra per failed image)

## Decision

Apply retry only if sync times are acceptable, or make retries configurable via env var.
