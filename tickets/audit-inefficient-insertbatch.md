# Performance: Inefficient insertBatch rowid detection

**Priority:** Medium
**File:** `lib/db.ts:423-433`

## Problem

The `insertBatch` function calls `getLastRowid.get()` twice per row to detect inserts vs updates.

```typescript
const before = getLastRowid.get()?.rowid ?? 0;
stmts.upsertTask.run(row);
if ((getLastRowid.get()?.rowid ?? 0) !== before) inserted++;
```

For large batches (1000+ rows), this creates unnecessary overhead.

## Approach

Count rows before/after the batch instead:

```typescript
const countBefore = (db.prepare("SELECT COUNT(*) as n FROM print_tasks").get() as { n: number }).n;
for (const row of rows) stmts.upsertTask.run(row);
const countAfter = (db.prepare("SELECT COUNT(*) as n FROM print_tasks").get() as { n: number }).n;
return { inserted: countAfter - countBefore, updated: rows.length - (countAfter - countBefore) };
```

This is 2 queries total instead of 2 * rows.length queries.

## Impact

Minor performance win (probably 5-10% faster for large syncs). Nice-to-have, not critical.
