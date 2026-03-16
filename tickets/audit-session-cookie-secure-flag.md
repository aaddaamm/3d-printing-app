# Bug: Session cookie secure flag broken for localhost

**Priority:** Medium
**File:** `routes/ui.ts:80`

## Problem

The secure flag logic uses `NODE_ENV !== "development"`:

```typescript
secure: process.env["NODE_ENV"] !== "development",
```

If `NODE_ENV` is unset (undefined), it defaults to `true`, breaking localhost testing.

## Approach

Explicitly check for production:

```typescript
secure: process.env["NODE_ENV"] === "production",
```

## Impact

Developers currently can't test UI login on localhost if NODE_ENV is unset.
