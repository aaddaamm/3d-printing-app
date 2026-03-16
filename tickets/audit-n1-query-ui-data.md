# Performance: N+1 query in UI data endpoint

**Priority:** High
**File:** `routes/ui.ts:130-146`

## Problem

The `/ui/data` endpoint uses a correlated subquery to fetch the first task ID for each job. This runs one query per job row.

```sql
SELECT ... FROM jobs j
  (SELECT pt.id FROM print_tasks pt WHERE pt.session_id = j.session_id ...)
```

For 100+ jobs, this becomes 100+ queries.

## Approach

Convert to a single JOIN with GROUP BY:

```sql
SELECT j.*, MIN(pt.id) FILTER (ORDER BY pt.plateIndex) as first_task_id
FROM jobs j
LEFT JOIN print_tasks pt ON j.session_id = pt.session_id
GROUP BY j.id
ORDER BY j.startTime DESC
```

## Impact

Significant performance improvement for datasets with 100+ jobs. Critical if UI becomes slow.
