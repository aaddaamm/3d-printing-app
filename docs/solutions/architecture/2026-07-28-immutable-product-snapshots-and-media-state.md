---
title: Immutable Product records need versioned provenance and separate current state
category: architecture
severity: high
tags:
  - sqlite
  - immutable-snapshots
  - provenance
  - transactions
  - product-images
  - migrations
  - async-races
applies_when:
  - Saving historical calculations that must survive later source-data changes
  - Letting users manually lock media while background refreshes continue
  - Evolving persisted JSON snapshot shapes after release
  - Updating a Product source field and its derived projection together
  - Reviewing SQLite migrations or mounted async frontend workflows
---

# Problem

A record can be immutable at the row level and still violate its contract when its inputs are incomplete, two related outputs are calculated from different database states, or a mutable “current” concept is stored in the immutable record itself.

This appeared in two forms:

- Direct and Etsy pricing snapshots initially lacked complete per-contribution provenance and were calculated before the write transaction.
- Source-image rows were content-addressed, but refreshes reused mutable candidate identity and had no separate pointer for the source version currently returned by the provider.

Schema tests also exercised migrations directly, which missed failures caused by static bootstrap SQL running before migrations.

# Context

PrintWorks saves reusable Product pricing and identification images above immutable imported print attempts. Historical prices must remain auditable after jobs/rates change. Manual image selections must remain byte-stable while Auto mode follows the latest valid source.

Related migration guidance: [Catalog foundation schema needs migration and bootstrap parity](./2026-07-06-catalog-foundation-schema-parity.md).

# Solution

## Version and validate immutable snapshots

- Persist an explicit snapshot version whenever the JSON shape changes.
- Dispatch readers by version and reject unknown future versions.
- Preserve genuine legacy payloads as a discriminated legacy variant; never reconstruct missing history from mutable current tables.
- Store every material and machine contribution needed to reproduce totals independently.
- Validate a canonical contribution graph inside each channel before comparing the pair.

## Put all related reads and writes in one transaction

- Start an `IMMEDIATE` SQLite transaction before calculating related channel outputs.
- Calculate, pair-validate, create Product/Batch links, insert snapshots, and update projections inside that transaction.
- Use a second real database connection to prove competing writes receive `SQLITE_BUSY` during the critical section.
- Inject failures at multiple write boundaries and assert total rollback, including prior projection preservation.

## Separate immutable media identity from mutable current state

- Include every provenance dimension in immutable candidate identity: Product, canonical model URL, canonical source URL, and normalized content hash.
- Never update an existing photo row’s path or bytes.
- Store a separate per-Product pointer to the source candidate currently observed by refresh.
- Update that pointer even in Manual mode, but never change the manually selected `main_photo_id`.
- Make source-field edits, pointer invalidation, Auto reranking, and published projection updates one transaction.

## Test bootstrap order, not only migration functions

- Build a representative old-schema database.
- Import the real DB bootstrap module against it.
- Assert migrations complete, indexes and foreign keys exist, and a second bootstrap is idempotent.
- Keep direct migration-runner tests, but do not treat them as bootstrap coverage.

## Own frontend async lifecycles

- Components own `AbortController` instances for quote/save/refresh work.
- Abort on draft invalidation, identity changes, dismissal, and unmount.
- Gate state, toasts, close, and navigation on both mounted state and request generation.
- Mount real components and resolve or reject deferred promises after abort to prove stale side effects stay suppressed.

# Why this works

Immutable history becomes self-contained rather than merely append-only. Transaction boundaries guarantee related snapshots describe one database state. Separating immutable candidates from a mutable current pointer lets Auto follow provider state while Manual remains locked to exact bytes. Real bootstrap tests cover ordering that isolated migration tests cannot observe.

# Prevention

Future `02-plan` runs should explicitly identify:

- persisted snapshot versions and legacy-reader behavior;
- the complete provenance required to audit totals without mutable source rows;
- which derived fields must share one transaction;
- immutable identity versus current-selection pointers;
- representative pre-migration bootstrap fixtures;
- component ownership for async work and side effects.

Future `04-review` runs should test adversarial transitions, not only happy paths:

- mutate rates/jobs after saving and compare exact history;
- make two channels compete with a second writer;
- refresh media A → B → A, including shared URLs/bytes;
- keep Manual selected during refresh, then Return to Auto;
- fail the last write in a multi-step transaction;
- resolve stale promises after abort/unmount;
- import the real DB module against the oldest supported schema shape.

## 🧠 Context Status

- Health: good
- Handoff: `.context/compound-engineering/handoffs/latest.md`
- Active files: `models/saved-product-pricing.ts`, `models/product-images.ts`, `models/product-image-update.ts`, `lib/db/migrations-list.ts`, `frontend/components/save-price-to-product-modal.ts`
- New session: not needed
