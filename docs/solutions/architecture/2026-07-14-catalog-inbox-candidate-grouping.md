---
title: Group catalog inbox files without turning broad roots into accidental products
category: architecture
severity: medium
tags:
  - catalog
  - inbox
  - grouping
  - products
  - local-files
---

# Problem

The scanner discovers individual files, but a printable design often contains several related STL,
3MF, STEP, source, or G-code files. Reviewing and adopting each file independently creates noise and
can split one design across several products. Grouping every file under a broad root such as
Downloads would create the opposite problem: one enormous, incorrect candidate.

# Decision

Build non-persistent inbox candidates from the current present/inbox rows:

- Files in the same non-root package folder form one candidate.
- Generic child folders such as `STL`, `3MF`, `models`, and `gcode` fold into their parent package.
- Loose files directly under a scan root remain separate unless their case-insensitive filename
  stems match, such as `dragon.stl` and `dragon.3mf`.
- Primary-file selection favors 3MF, then STL, STEP/STP, native source formats, OBJ, and G-code.
  Within one format, an embedded preview and a shorter filename win.
- Candidate adoption validates that the submitted files still form one current candidate, then
  creates all `product_files` references and review-history events in one SQLite transaction.
- The UI can temporarily show a candidate’s files separately for per-file adoption or ignore. This
  escape hatch does not mutate grouping metadata because candidates are derived, not stored.

# Boundaries

- Candidate grouping never copies, moves, renames, or deletes source files.
- Sidecar images, licenses, PDFs, and archives remain outside the scanner’s supported-file set.
- Grouping choices are not persisted yet; a future explicit split/merge workflow can add overrides
  after real inbox usage demonstrates where heuristics are insufficient.
