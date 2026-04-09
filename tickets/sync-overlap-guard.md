# Bug: Scheduled sync has no overlap guard

## Effort: Small
## Benefit: Low–Medium

## Background

`api.ts::spawnSync` is called via `setTimeout` (10s after startup) and then
`setInterval` (every `SYNC_INTERVAL_HOURS`). If a sync run takes longer than the
interval (e.g. slow network, large history, or the Bambu API hangs), a second
child process spawns before the first finishes.

Two concurrent syncs opening the same SQLite DB in WAL mode will not corrupt data
(WAL handles concurrent writers), but:
- The second sync re-fetches and re-upserts data the first is still writing.
- Log output from both processes interleaves, making it hard to read.
- If the API is under load and syncs pile up, memory/fd usage grows.

## Fix

Add a simple in-process lock:

```ts
let syncInProgress = false;

async function runScheduledSync(): Promise<void> {
  if (syncInProgress) {
    console.log(dim("  Sync skipped — previous run still in progress"));
    return;
  }
  syncInProgress = true;
  try {
    await spawnSync();
  } catch (e: unknown) {
    console.error(`${red("Sync error:")} ${(e as Error).message}`);
  } finally {
    syncInProgress = false;
  }
}
```

Replace the inline `.catch(...)` in both the `setTimeout` and `setInterval`
callbacks with `runScheduledSync()`.
