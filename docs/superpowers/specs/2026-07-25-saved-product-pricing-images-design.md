# Saved Product Pricing and Identification Images Design

**Status:** Approved for planning

## Purpose

Build the local Product foundation required by the future hosted Sales Companion. A Product becomes the curated, reusable item that can be published for private price lookup. Saved pricing must remain historically accurate, and every Product should have a useful design-level identification image rather than an arbitrary single-plate print cover.

This subproject follows the Price-first workflow and precedes cloud publishing, the hosted Sales Companion, and native Mac packaging.

## Product rules

- A Price-this calculation can exist temporarily without a Product.
- Only pricing explicitly saved to a Product is eligible for the Sales Companion.
- Products remain private until the user explicitly enables **Visible in Sales Companion**.
- Imported print jobs/tasks remain immutable facts.
- Saved Product prices are authoritative backend calculations, not browser-submitted totals.
- Historical saved prices do not change when global rates change later.

## Save-to-product workflow

After calculating a Price-this quote, the user can select **Save to product**.

The save dialog supports:

1. selecting an existing Product; or
2. creating a Product with a suggested name derived from the selected attempts.

For a new Product, the dialog captures only the useful initial fields:

- name;
- source/designer when known;
- source URL when known;
- license/subscription source when known, including Cubee;
- optional notes.

The user can complete broader Product metadata later on Product detail.

On success, the app navigates to Product detail and shows the saved production batch, latest prices, and identification image state.

## Backend-authoritative saved pricing

The browser submits pricing inputs, not computed totals:

- Product ID or new-Product input;
- selected job IDs;
- successful sellable quantity;
- one-time batch labor;
- per-unit labor;
- packaging cost per unit;
- extra cost;
- target-margin override when present;
- notes.

The backend validates the Product and selected jobs, then recalculates both Direct and Etsy scenarios from the same manufacturing inputs.

In one transaction it:

1. creates the Product when requested;
2. creates a production Batch;
3. links every selected job to the Batch;
4. stores the shared pricing inputs and resolved rate assumptions;
5. stores immutable Direct and Etsy result snapshots;
6. updates the Product's latest-price projection;
7. commits only if every step succeeds.

A failure leaves the Product, Batch, links, and snapshots unchanged.

## Price snapshot model

Existing `product_batches` and `product_batch_jobs` remain the production grouping. Add a dedicated immutable snapshot table rather than treating editable Batch columns as historical output.

Each channel snapshot stores:

- Batch ID;
- channel (`direct` or `etsy`);
- created timestamp;
- target margin;
- percentage and fixed fees;
- labor rate;
- material and printer-rate assumptions;
- warnings/fallbacks;
- material cost;
- machine cost;
- production-loss cost;
- batch and per-unit labor costs;
- packaging and extra costs;
- subtotal, buffers, total cost, and unit cost;
- minimum viable price;
- recommended price;
- profit per unit and per batch;
- estimated margin;
- complete versioned JSON input/breakdown snapshot for forward compatibility.

The structured columns support Product-list and Sales Companion queries. The versioned JSON preserves the exact calculation contract for audit/debugging.

The latest successfully saved Batch supplies the Product's current published pricing. Older snapshots remain queryable as pricing history.

## Sales Companion visibility

Add a Product-level `sales_companion_visible` flag, defaulting to false.

- New and existing Products are private until explicitly enabled.
- Visibility is independent of Product status, license, or listing readiness.
- The local UI clearly indicates private versus visible.
- Cloud publication is out of scope for this subproject; the flag defines the future publication boundary.

## Identification image goal

A Product image is for private item identification, not marketing or automatic Etsy reuse. It should represent the complete design whenever possible.

The current latest-job/first-plate cover heuristic is not authoritative for Products and should not drive Product identification images.

## Image candidates and ranking

Every Product can expose an ordered candidate list:

1. manually uploaded Product photo;
2. public source hero image from a supported provider when a known source URL can be resolved;
3. catalog/3MF embedded preview;
4. generated contact sheet from unique plate covers in the latest saved Batch;
5. best single cached print cover;
6. generated placeholder.

Each candidate records:

- candidate/source type;
- local or served URL;
- source reference or URL when applicable;
- provenance label;
- generation/fetch timestamp;
- whether the file is owned by PrintWorks;
- dimensions and content type when known;
- warning or unavailable reason when applicable.

Candidate discovery is deterministic. A failure at one priority falls through to the next candidate without blocking Product or pricing creation.

## Auto and Manual image modes

Products have an image-selection mode:

- **Auto:** use the highest-ranked currently available candidate.
- **Manual:** keep the selected `main_photo_id`; background scans/syncs cannot replace it.

Choosing or uploading an image switches to Manual. **Return to Auto** clears the manual lock and immediately resolves the best candidate again.

The UI displays the current mode and image provenance.

## Public source enrichment

Source enrichment is best-effort and provider-specific.

- Use public page metadata only when a Product has a known resolvable source URL.
- MakerWorld support may use public page/Open Graph data through a dedicated adapter.
- Do not depend on undocumented design-ID-to-page mappings as the only path.
- Do not scrape authenticated Cubee/subscription pages.
- Cache the selected source image locally so remote URL changes do not break identification.
- Source-image candidates remain private identification media and are not marked as approved listing photos.

Remote image fetching must:

- allow only supported public HTTPS providers;
- reject credentials and unsupported schemes;
- prevent private-network/loopback destinations and redirects;
- enforce connection and response timeouts;
- cap response bytes and decoded dimensions;
- verify an accepted image content type;
- re-encode accepted content before serving it locally.

The current DNS preflight is defense-in-depth for a fixed MakerWorld allowlist only. Because the subsequent global Fetch resolution cannot be pinned, this adapter is not a generic DNS-rebinding-safe SSRF transport and must not be generalized beyond the fixed provider contract.

## Multi-plate contact sheets

When no better design-level candidate exists, generate a contact sheet from the latest saved Batch.

- Collect cached covers for all selected jobs/tasks.
- Deduplicate repeated plate images using stable task/plate identity and content hash where available.
- Order by plate index, then print time/task ID for deterministic output.
- Render a bounded grid that shows the complete set rather than one component.
- Preserve aspect ratio and add concise plate labels only when they improve identification.
- Cache content-addressed output under the PrintWorks application-data directory.
- Regenerate only when the candidate set changes.

Generation failure produces a warning and falls back to the best single cover.

## Manual upload

Product detail supports uploading a finished-item photo from the Mac or an iPhone-accessible file picker.

- Accept only bounded image formats and file sizes.
- Decode and re-encode rather than trusting uploaded bytes.
- Produce bounded thumbnail/display WebP variants.
- Store app-owned files under the configured PrintWorks application-data directory.
- Create a `product_photos` row with manual-upload provenance.
- Set it as `main_photo_id` and switch the Product to Manual mode transactionally.

Replacing an image does not delete historical imported print covers or catalog previews. If a database write fails after an app-owned content-addressed file is written, PrintWorks retains the safe orphan for later reference-aware garbage collection rather than attempting inline deletion. Follow-up cleanup remains tracked separately in issue #47.

## Product detail UX

Product detail adds:

### Identification image

- large current image;
- Auto/Manual badge;
- provenance/source label;
- **Choose image** candidate picker;
- **Upload photo**;
- **Return to Auto** when manually locked;
- warnings when a higher-priority candidate failed.

### Latest pricing

- successful quantity;
- total and per-unit manufacturing cost;
- production-loss cost;
- Direct recommended price and margin;
- Etsy recommended price and margin;
- saved timestamp and rate/warning indicators;
- linked jobs/attempts.

### Pricing history

- saved Batches newest first;
- cost and recommended-price changes over time;
- immutable detail view for each snapshot.

### Publication state

- explicit **Visible in Sales Companion** control;
- clear private/visible status;
- no implication that enabling visibility publishes anywhere until cloud publishing is implemented.

## APIs

Add focused endpoints/contracts for:

- saving a Price-this draft to a new or existing Product;
- listing Product pricing history and immutable snapshot details;
- listing identification-image candidates;
- selecting a candidate/manual photo;
- returning a Product to Auto image mode;
- uploading a manual Product image;
- updating Sales Companion visibility.

All pricing save endpoints accept inputs and identifiers only. They never accept authoritative cost/result totals from the client.

## Data migration

Use numbered, idempotent migrations.

Migrations add:

- immutable channel snapshot storage;
- Product Sales Companion visibility;
- Product image-selection mode;
- image provenance/ownership fields needed on `product_photos` or an adjacent focused table;
- indexes for latest Product snapshot, channel lookup, visible Products, and Product photo candidates.

Existing Products default to private and Auto image mode. Existing `main_photo_id` values are preserved and treated as Manual to avoid changing user-selected media.

## Error handling

- Unknown/deleted jobs or Products reject the save.
- Invalid quantities/labor/extras reject the save.
- A Batch cannot be saved without both valid channel calculations.
- Database failures roll back Product/Batch/link/snapshot writes.
- Image discovery/fetch/generation failures never roll back valid pricing; they become warnings and trigger fallback ranking.
- Upload validation errors do not create files or database rows.
- A missing identification image does not prevent Product visibility, but the UI warns before enabling it.

## Testing

### Pricing persistence

- backend recalculates rather than trusting client totals;
- new and existing Product save flows;
- selected jobs link exactly once;
- Direct and Etsy snapshots share manufacturing cost;
- channel fees affect only channel pricing;
- snapshots remain unchanged after rate updates;
- latest Product projection selects the latest committed Batch;
- transaction rollback at each write boundary;
- Product visibility defaults private and updates explicitly.

### Image ranking and persistence

- deterministic priority ordering;
- existing main photos migrate to Manual;
- manual selection cannot be overwritten by enrichment;
- Return to Auto resolves the best current candidate;
- MakerWorld/public metadata success and failure through controlled fixtures;
- private-network redirects and oversized/invalid images are rejected;
- 3MF preview fallback;
- deterministic multi-plate contact-sheet composition and deduplication;
- single-cover and placeholder fallback;
- upload validation, re-encoding, and rollback;
- app-owned file cleanup boundaries.

### Frontend

- Save-to-product request mapping and validation;
- existing/new Product selection;
- successful navigation to Product detail;
- latest pricing cards and history formatting;
- candidate picker and provenance labels;
- Auto/Manual transitions;
- upload errors through toast, never `alert()`/`confirm()`;
- visibility confirmation and warning states;
- responsive Product-detail layout.

## Delivery sequence

1. Add immutable pricing snapshots and transactional save-to-product backend.
2. Add Save-to-product UI and Product pricing history.
3. Add image candidate/provenance schema and deterministic local candidates.
4. Add contact-sheet generation and manual upload/override.
5. Add best-effort supported-provider source enrichment.
6. Add Sales Companion visibility and publication-ready local query contract.

Each step must leave the local app usable and independently testable.

## Task 11 completion proof

Task 11 closes the local Product foundation with a repeatable isolated smoke flow: seed one finished attempt and one failed attempt, save them to a new Product, assert HTTP 201 plus immutable Direct/Etsy snapshots with one shared unit cost and different suggested prices, verify Product pricing history, verify the Product stays private until `sales_companion_visible` is explicitly enabled, and verify local print-cover/placeholder image fallback without any live MakerWorld dependency.

Operator-facing docs must also state the Save-to-Product workflow, immutable history semantics, explicit Sales Companion visibility boundary, Auto/Manual image ranking, `PRODUCT_IMAGES_DIR` ownership boundary, best-effort MakerWorld-only enrichment, authenticated Cubee exclusion, retained safe orphans tracked by issue #47, and that hosted/cloud publication plus native Mac packaging remain deferred.

## Out of scope

- Hosted Sales Companion deployment, authentication, or cloud database.
- Cloud image upload or synchronization.
- Native Mac/Electron packaging.
- iPhone-native application.
- Etsy listing creation or marketing-image approval.
- Authenticated Cubee scraping.
- Automatic publication of all Products.
- Replacing existing catalog inbox/managed-library work from issue #43.
- Automatic project merging from issue #44.
