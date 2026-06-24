# ADR: Provider-oriented history and pricing domain

Status: Draft  
Related issues: #24, #25, #26, #27, #28, #29, #30, #31, #32, #33

## Context

The app started as a Bambu Lab print-history sync with pricing and project grouping. The next phase is a generalized 3D printing history/pricing app that keeps Bambu P1S support and can import history from other printers, likely Snapmaker U1 via Moonraker/Klipper or Flashforge Creator 5 after investigation.

The product scope for this migration is **history and pricing only**. Live monitoring, printer control, queue control, and real-time events are future capabilities, not requirements for the first provider abstraction.

Because Moonraker/Snapmaker U1 is normally reachable only on the local LAN and the app stores SQLite/covers on disk, the next deployment direction is local-first rather than hosted/serverless. See `docs/local-first-deployment.md`.

## Decision

Introduce a provider-oriented ingestion model that separates vendor-specific source payloads from the app's normalized history/pricing records.

The transition should be additive first: preserve existing `print_tasks`, `jobs`, `projects`, `job_filaments`, and pricing behavior while adding provider-aware identity and contracts around ingestion.

For deployment, package the app as a local service/application with persistent storage. Do not make serverless/cloud hosting a constraint for provider design unless remote access becomes an explicit future requirement.

## Canonical terms

### Provider

A provider is an integration family that knows how to read print history from one source type.

Examples:

- `bambu-cloud`
- `bambu-studio-local`
- `moonraker`
- `flashforge-lan` if proven viable
- `manual-import` if a CSV/log fallback is needed

A provider is not necessarily a printer. One provider may cover multiple printers or multiple source records for the same physical printer.

### Printer

A printer is a physical machine used for pricing and reporting.

Printer identity should eventually be internal and stable, with provider-specific identifiers attached separately. Do not rely on display name, `deviceModel`, or a provider's raw id as the app-wide identity.

### Source record

A source record is the raw history payload returned by a provider. It should be stored unchanged enough to allow re-normalization when the provider contract evolves.

Minimum source-record identity should include:

- provider id
- provider source/printer id when available
- provider record id when available
- raw payload JSON
- fetched/imported timestamp

### Normalized print record

A normalized print record is the provider-independent representation used to feed session detection, jobs, materials, media, and pricing.

Required or strongly preferred fields for history/pricing:

- provider id
- stable provider record id
- printer identity hint
- title or file name
- canonical status
- start/end time or duration
- material usage if available
- raw source reference

Optional fields:

- thumbnail/cover URL or local media path
- slicer metadata
- design/project identifiers
- plate index
- material type
- color
- toolhead/AMS/spool/slot identifiers

### Session

A session groups one or more normalized print records into the app unit that becomes a job.

Current Bambu behavior is special and must be preserved: plates from the same Bambu `(instanceId, deviceId)` within the configured gap form one session unless repeated plate indices indicate a new run.

Generic providers should default to one completed provider history record = one session/job unless explicit grouping metadata exists.

### Job

A job is the pricing/customer/project unit. It is derived from one session and aggregates status, time, material, plate count, notes, customer, override fields, and project assignment.

### Material usage

Material usage is a normalized pricing input, stored in grams when possible.

Usage confidence should be tracked or derivable:

- `actual`: measured/recorded by printer/provider
- `slicer_estimate`: estimated by slicer or gcode metadata
- `manual`: entered or corrected by user
- `unknown`: unavailable or not trusted

Do not price from filament length alone unless diameter and density assumptions are explicit.

### Media asset

A media asset is a cover, thumbnail, or related image associated with a source record, normalized print record, job, or project. Media availability is optional and provider-dependent.

## Bambu-specific fields

These fields are useful for the Bambu provider but should not become global assumptions:

- `instanceId`
- `designId`
- MakerWorld design/profile metadata
- `plateIndex`
- `amsId`
- `slotId`
- Bambu task title patterns like `{project}_plate_{N}`
- Bambu cloud cover/thumbnail URL expiry behavior

## Normalized units

Core app fields should use consistent units:

- weight/material: grams
- time/duration: seconds
- timestamps: ISO 8601 strings in UTC
- currency/rates: existing decimal dollar conventions
- filament length: provider metadata unless converted with documented assumptions

## Provider capability flags

Provider implementation should declare capabilities instead of implying every provider supports every feature:

- `history:list`
- `history:actual_filament`
- `history:estimated_filament`
- `media:thumbnail`
- `printer:identity`
- `status:poll` as future/non-MVP

Control capabilities such as start, pause, cancel, upload, or queue management are intentionally out of scope for this migration.

## Migration notes

- Add provider identity before importing any non-Bambu data.
- Preserve existing Bambu rows by backfilling them as Bambu provider records.
- Avoid destructive table renames until the provider abstraction is proven.
- Keep `raw_json` or a future source-record table as a durable re-normalization path.
- Add diagnostics for missing machine/material rates before relying on non-Bambu pricing.

## Open questions

- Provider configuration should start as environment/local service configuration, then move to a hybrid model if the UI needs editable printer/provider settings.
- Should raw payloads be stored in the existing `print_tasks.raw_json` during the transition, or should #24 introduce a dedicated `source_records` table first?
- How should duplicate physical prints be reconciled if multiple providers describe the same print, such as Bambu cloud plus Bambu Studio local import?
- Should material usage confidence be visible in the UI before non-Bambu providers are added?
