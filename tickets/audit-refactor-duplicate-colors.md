# Refactor: Extract duplicate color utilities

**Priority:** Low
**Files:** `api.ts:15-35`, `dump-bambu-history.ts:61-70`

## Problem

ANSI color functions are duplicated across two files. Both define the same color utility factory.

## Approach

Create `lib/colors.ts`:

```typescript
export const tty = process.stdout.isTTY;
export const c = (code: number) => (s: string | number) =>
  tty ? `\x1b[${code}m${s}\x1b[0m` : String(s);
export const bold = c(1);
export const red = c(31);
// etc.
```

Then import in both files.

## Bonus

Move sync error handler to a shared function:
```typescript
const onSyncError = (e: Error) => console.error(`${red("Sync error:")} ${e.message}`);
```

## Impact

Reduces duplication, makes color behavior consistent across the app.
