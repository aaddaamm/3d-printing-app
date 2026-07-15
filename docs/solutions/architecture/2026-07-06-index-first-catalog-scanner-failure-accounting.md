---
title: Index-first scanners need explicit skip and failure accounting
category: architecture
severity: medium
tags:
  - scanner
  - filesystem
  - catalog-files
  - file-history
  - failure-accounting
  - path-normalization
  - vitest
applies_when:
  - Building filesystem scanners that populate SQLite metadata
  - Scanning user-managed folders that may change while scanning
  - Reporting skipped and failed counts in CLI summaries
  - Normalizing local filesystem paths for catalog identity
---

# Problem

The catalog scanner indexes local model/source/G-code files into SQLite without copying or reorganizing files. Filesystem scans are race-prone: files can disappear, permissions can change, directories can become unreadable, and unsupported files or skipped directories need to be reflected honestly in scan summaries.

# Context

The scanner feature added CLI root management and scan execution:

- `scan_roots` stores persisted local roots.
- `catalog_files` stores indexed file metadata and content hashes.
- `file_history` stores discovered, changed, missing, and restored transitions.
- `npm run catalog -- roots add/list/remove` manages roots.
- `npm run catalog -- scan` indexes active roots and prints concise counts.

Code review found three important scanner risks:

1. Hash failures were isolated, but discovery-time `readdirSync` / `statSync` failures could still abort the whole scan.
2. `skipped` existed in the summary but initially stayed `0` because filtering happened before accounting.
3. Lowercasing normalized paths caused possible collisions on case-sensitive filesystems.

# Solution

For filesystem scanners in this repo:

- Treat discovery as part of scan accounting, not a pure pre-step that can throw freely.
- Return both discovered files and counters from discovery: supported files, skipped entries, and failed metadata/directory reads.
- Catch per-directory `readdirSync` failures and per-file `statSync` failures, increment `failed`, and keep scanning other entries.
- Treat any directory or metadata read failure as an incomplete traversal. Do not mark unseen files
  missing unless the whole root was traversed successfully.
- Catch per-file hash/upsert failures in the scan loop, increment `failed`, and keep scanning other files.
- Return capped, structured error details with the phase, path, and message so the UI and CLI can
  explain what failed.
- Count skipped symlinks, unsupported files, and skipped noisy directories.
- Preserve path case in `normalized_path`; use `path.resolve()` but do not lowercase globally.
- Validate scan roots at add time so nonexistent paths or files fail before recurring scan runs.

# Why this works

Index-first scanners should be robust against normal filesystem races. A single unreadable or disappearing file should not prevent other files from being indexed, and the CLI summary should tell the user what happened.

Case-preserving normalization avoids collapsing distinct files on case-sensitive filesystems. Future platform-specific canonicalization can be added deliberately, but global lowercasing is not safe as a default identity rule.

# Prevention

When planning or reviewing future scanner/importer work:

- Add RED tests for `readdirSync`, `statSync`, and hash failures before implementing scanner changes.
- Assert `skipped` and `failed` counts are non-placeholder behavior, not always-zero fields.
- Verify missing-file reconciliation is skipped after discovery failures and resumes after a fully
  successful traversal.
- Avoid path normalization that loses filesystem-significant information unless an explicit platform policy exists.
- Keep scanner behavior index-first: no copying, moving, product adoption, or managed storage side effects unless that slice is explicitly approved.
