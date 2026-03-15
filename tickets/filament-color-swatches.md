# Filament Color Swatches in Job View

## Background

`job_filaments` stores `color` as a hex string (e.g. "#FF6B35") for each AMS slot
used in a job. The UI doesn't display this anywhere.

## Work

In the job table row and/or the detail modal, show a row of small color swatches
representing the filaments used. Each swatch is a circle filled with the hex color,
optionally with a tooltip showing filament_type.

This gives an instant visual of what was loaded for a job without opening the detail.

## Data available per filament slot

- filament_type (PLA / PETG / etc.)
- color (hex)
- weight_g (how much was used)
- ams_id / slot_id (which AMS slot)

The swatches could be sized proportionally to weight_g to show material mix at a glance.
