# Reliability and Empty-Project Cleanup Design

## Goal

Fix the review blockers in `main` while ensuring every project with no jobs is removed.

## Scope

1. Preserve legacy database data during bootstrap migrations.
2. Reconcile obsolete jobs after normalization changes a session's topology.
3. Delete every empty project after job or project reconciliation.
4. Preserve Product-to-Project links during automatic title-family project merges.
5. Treat raw material-mapping changes as normalization-relevant.
6. Make configured-provider locking recoverable after unclean process exit.
7. Reject invalid batch margin-plus-fee combinations before persistence.
8. Make project-to-product creation linked and idempotent.
9. Make create-and-move-project atomic.

## Data and transaction design

### Migration safety

Migration code must never drop a populated legacy table. When a legacy `tasks` table exists alongside an empty bootstrap `print_tasks` table, replace the empty bootstrap table with the legacy table and continue migration. For old `jobs` schemas without `session_id`, preserve rows by copying compatible user-owned fields into the current schema with stable legacy session identifiers. If a legacy schema cannot be mapped safely, fail before destructive mutation with an actionable backup error.

### Normalization reconciliation

`runNormalize` will calculate the set of current normalized session IDs and transactionally reconcile jobs that no longer map to a `print_tasks.session_id`. Obsolete jobs will be removed only after associated Product/batch links are deliberately handled. At the end of reconciliation, all projects with no jobs will be deleted, including manually created projects, per approved requirement.

### Project merge and creation

Auto title-family merges will transfer `project_products` relationships to the canonical project before deleting the duplicate. Product creation from a project will return the existing linked product when present; otherwise it will create the product, source-job links, and the `project_products` link in one transaction. A dedicated endpoint/model operation will create a project and assign a job in one transaction, preventing empty orphan projects.

## Sync and pricing design

Configured sync maintenance will run when normalization-relevant raw task data changes, including material mappings. The lock file will record its process owner and start time. A sync will reject a live owner and reclaim only a stale/dead owner. Batch create/update validation will reject effective target margin plus platform fee values at or above the pricing engine's supported limit before writing a row.

## Error handling

- Destructive migration ambiguity fails before a destructive write.
- Sync returns a conflict only for a live lock owner; stale locks are reclaimed safely.
- Atomic project/job creation either commits both records or commits neither.
- Invalid batch pricing input returns a validation error without writing a batch.

## Testing

Add SQLite integration tests for legacy migration preservation, session merge/split cleanup, linked title-project merges, empty-project deletion, idempotent project product creation, and atomic create-and-move. Add unit/integration tests for raw-material-only sync updates, stale lock recovery, and invalid batch price input. Retain the full lint, typecheck, and Vitest suite as the final gate.

## Non-goals

- Adding public-deployment authentication (already tracked by issue #42).
- Broad API/UI redesign unrelated to these reliability defects.
- Recovering data already deleted by a prior destructive migration.
