# Security: Dynamic SQL in job filtering

**Priority:** High
**File:** `models/jobs.ts:36-39`

## Problem

The `listJobs()` function dynamically constructs a WHERE clause. While currently parameterized correctly, the pattern is fragile and could lead to SQL injection if logic changes.

```typescript
const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
return db.prepare<string[], Job>(`SELECT * FROM jobs ${where} ...`).all(...params);
```

If someone adds a new condition type or refactors, they might accidentally interpolate values unsafely.

## Approach

Two options:
1. **Pre-build all possible queries** as prepared statements (cleanest but verbose)
2. **Use a query builder** that enforces parameterization

## Open questions

- Should we build a small query builder for common filter patterns, or just pre-write statements?
