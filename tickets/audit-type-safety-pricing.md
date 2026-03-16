# Robustness: Type safety gaps in pricing logic

**Priority:** Medium
**File:** `models/jobs.ts:100-108`

## Problem

Pricing fallbacks assume default rates always exist, but don't validate:

```typescript
const materialRate = stmts.getMaterialRate.get(filamentType) ?? stmts.getMaterialRate.get("PLA");
const machineRate = stmts.getMachineRate.get(job.deviceModel ?? "") ?? stmts.getMachineRates.all()[0];
const laborConfig = stmts.getLaborConfig.get();

if (!materialRate || !machineRate || !laborConfig) {
  throw new Error("Pricing config incomplete...");
}
```

If `.all()[0]` is undefined (empty table), the code silently passes the undefined check and crashes later.

## Approach

Add explicit validation:

```typescript
if (!materialRate) throw new Error("No material rate for " + filamentType);
if (!machineRate) throw new Error("No machine rate found");
if (!laborConfig) throw new Error("No labor config found");
```

## Impact

Clearer error messages for operators when pricing data is missing.
