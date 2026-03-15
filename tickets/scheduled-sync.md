# Scheduled / Automatic Sync

## Effort: Low
## Benefit: High

Removes the manual "remember to sync" step — history stays current automatically.

## Background

Currently sync is manual (npm run sync). For the history to stay current the
user has to remember to run it.

## Options

Option A — Cron job (simplest):
  Add a crontab entry: `0 */6 * * * cd /path/to/project && npm run sync >> sync.log 2>&1`
  Document this in the README.

Option B — Built into the API server:
  On startup, run a sync. Then re-sync every N hours (configurable via
  BAMBU_SYNC_INTERVAL_HOURS env var, default 6).
  Pros: one process to manage. Cons: sync errors could affect API availability.

Option C — Separate daemon script:
  A `sync-daemon.ts` that loops: sync, sleep N hours, repeat.
  Run alongside the API via pm2/launchd/systemd.

## Recommendation

Option B is the most convenient for a local single-user setup. The sync is
fast (a few seconds) and runs in the background — it won't block the API.
Cover downloads are the slow part; those could be deferred to a background
queue so they don't hold up the sync cycle.
