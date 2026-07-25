# Project Merge Design

**Issue:** #44 — Add manual project merge for cross-provider print runs
**Status:** Approved for planning

## Problem

Print runs can span providers and printers without a shared design ID or meaningful filename. For example, a Bambu MakerWorld project can have related Moonraker jobs named only `Assembled` or `blade-l`. Existing automatic grouping cannot safely infer that relationship.

Users need a fast, explicit way to consolidate such projects without database access or one-job-at-a-time reassignment.

## Scope

Add an explicit project merge workflow. It is manual and never infers source projects from titles, timing, or provider metadata.

## User flow

1. A user opens the project that should survive as the target.
2. They select **Merge projects** on the project detail page.
3. A modal displays a searchable, multi-select list of all other projects. The target is excluded.
4. Each source option includes its name and job/plate totals.
5. The modal summarizes the selected source project names and totals to move.
6. The user confirms **Merge N projects**.
7. The app moves all source jobs to the target, deletes the now-empty source projects, refreshes project data, and shows a success toast.

## Merge semantics

- The target project keeps its ID, name, customer, notes, `source_design_id`, and existing product link(s).
- All jobs assigned to selected source projects are reassigned to the target.
- Source projects are deleted automatically after reassignment.
- The operation is atomic: validation or any failure leaves all projects and jobs unchanged.
- The operation clears affected project price caches so prices are recalculated from the merged jobs.
- The system does not auto-merge projects by time, filename, provider, or title similarity.

## Relationship safety

The merge must not silently discard relationships owned by source projects.

- The API rejects a merge if a source project has a product link, batch relationship, or another project-owned reference that cannot be safely migrated under the defined semantics.
- The response identifies the blocking source project and relationship type.
- A future version may add explicit relationship migration choices; v1 blocks rather than guesses.

## API

Add:

```http
POST /projects/:id/merge
Content-Type: application/json

{ "source_project_ids": [877, 879] }
```

`id` is the target project ID.

Validation:

- `source_project_ids` must be a non-empty array of unique integer IDs.
- A source cannot equal the target.
- The target and every source must exist.
- Sources must pass relationship-safety checks.

Success response:

```json
{
  "project": { "id": 876 },
  "merged_project_ids": [877, 879],
  "jobs_moved": 4
}
```

Invalid requests return `400`; missing projects return `404`; blocked source relationships return a clear `409` response.

## Backend design

- `routes/projects.ts` validates the request and translates model outcomes to HTTP responses.
- `models/projects-crud.ts` owns the merge transaction.
- The transaction verifies inputs and references, reassigns jobs, deletes sources, and invalidates target/source price cache entries.
- Existing project list/detail queries need no semantic changes: after merging, they naturally report the target’s new job and plate totals.

## Frontend design

- Add a **Merge projects** action to the target project detail page.
- Add a modal alongside the existing project modal components.
- The modal uses a searchable project list with checkboxes, target exclusion, and visible job/plate counts.
- The confirmation control is disabled until at least one source is selected.
- On success, refresh the project list, target project detail, and price data; navigate remains on the target detail.
- On API rejection/failure, keep the modal open and surface the returned error with the existing toast/error pattern.

## Testing

Backend/model tests cover:

- all source jobs are moved to the target;
- sources are deleted;
- target metadata remains unchanged;
- empty, duplicate, target-as-source, missing, and non-integer IDs are rejected;
- unsafe project-owned relationships block the merge;
- failures roll back all changes;
- affected price cache entries are invalidated.

Route tests cover request validation, status codes, and response payloads.

Frontend tests cover target exclusion, filtering, selection summaries, disabled confirmation without sources, and successful refresh behavior.

## Out of scope

- Automatic cross-provider grouping suggestions or merges.
- History/undo for a merge.
- Merging products, batch records, customer fields, or notes from source projects.
- A projects-grid bulk-selection merge workflow.
