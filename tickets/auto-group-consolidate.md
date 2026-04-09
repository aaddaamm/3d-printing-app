# Consolidate duplicate auto-group implementations

## Effort: Small–Medium
## Benefit: High (correctness + maintainability)

## Background

There are two implementations of project auto-grouping:

| | `lib/auto-group.ts::autoGroupProjects` | `models/projects.ts::autoGroupByDesign` |
|---|---|---|
| Called by | sync CLI (`dump-bambu-history.ts`) | HTTP `POST /projects/auto-group` (UI button) |
| Tested | Yes (`tests/auto-group.test.ts`) | No |
| `project_id IS NULL` guard on UPDATE | Yes | **No** |
| `jobs_assigned` count | `.changes` (accurate) | `ids.length` (over-counts) |
| Fallback project name | raw `designId` | `"Design #${designId}"` |
| `deriveBaseTitle` | calls exported function | inlines duplicate logic |

The HTTP-exposed version — the one users trigger from the UI — is the unsafe one.
Specifically, the missing `AND project_id IS NULL` guard means re-running auto-group
via the UI will overwrite manually assigned `project_id` values on jobs.

## Fix

Two options; option A is preferred:

**Option A — make `autoGroupByDesign` call `autoGroupProjects`**

`models/projects.ts::autoGroupByDesign` becomes a thin wrapper:

```ts
import { autoGroupProjects } from "../lib/auto-group.js";

export function autoGroupByDesign(): { projects_created: number; jobs_assigned: number } {
  const { created, assigned } = autoGroupProjects();
  return { projects_created: created, jobs_assigned: assigned };
}
```

The HTTP route and the sync CLI both call the same underlying logic. Delete the
inlined implementation in `models/projects.ts`.

**Option B — delete `autoGroupByDesign`, have the route call `autoGroupProjects` directly**

Simpler but requires changing the import in `routes/projects.ts`.

## Also add

A test asserting that re-running auto-group does not overwrite a manually assigned
`project_id`. This is the core invariant; it broke before and will break again
without a regression test.
