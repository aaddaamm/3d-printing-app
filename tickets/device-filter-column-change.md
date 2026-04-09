# Bug: GET /jobs?device= silently changed from deviceId to deviceModel

## Effort: Small
## Benefit: Medium (correctness for existing integrations)

## Background

`models/jobs.ts::listJobs` was recently refactored. In the process, the `device`
filter condition changed:

```ts
// before
conditions.push("deviceId = ?");

// after
conds.push(["deviceModel = ?", device]);
```

The query param name (`?device=`) stayed the same, but it now filters on
`deviceModel` (the human-readable printer name, e.g. `"Bambu Lab X1C"`) instead
of `deviceId` (the unique device serial / cloud ID).

Any caller filtering by `deviceId` will now get zero results silently.

The README still documents this param as "Filter by `deviceId`".

## Questions to resolve first

1. Was this intentional? The UI may now pass `deviceModel` values; if so, the
   param is correct for new callers but broke old ones.
2. Are there any existing API consumers (scripts, integrations) that pass a
   `deviceId` to `GET /jobs?device=`?

## Fix options

**If the change was intentional:** Update the README to say "Filter by
`deviceModel`" and rename the query param from `device` to `printer` or
`device_model` to make the semantic change visible. A rename causes a one-time
breaking change but prevents silent confusion going forward.

**If the change was accidental:** Revert to `deviceId = ?`.

**If both are useful:** Support both params (`?device_id=` and `?device_model=`)
separately.
