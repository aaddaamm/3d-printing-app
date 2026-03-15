# Add Specialty PLA Material Rate

## Effort: Very Low
## Benefit: Medium

One DB insert + confirming the PLA-S mapping. Fixes mispriced Specialty PLA jobs.

## Background

The spreadsheet defines three material types: PLA, PETG, and Specialty PLA.
The DB currently only has PLA and PETG. The Bambu API returns "PLA-S" as a
filament_type (seen in job_filaments) which likely maps to Specialty PLA.

## Work

1. Insert a `Specialty PLA` row into `material_rates` with appropriate cost_per_g
   and waste_buffer_pct from the spreadsheet.
2. Confirm whether Bambu's `PLA-S` filament_type should map to `Specialty PLA`
   (check the spreadsheet for the Bambu material ID mapping).
3. The pricing fallback in `models/jobs.ts` currently falls back to PLA if no
   matching rate is found — Specialty PLA jobs are currently priced as PLA.
