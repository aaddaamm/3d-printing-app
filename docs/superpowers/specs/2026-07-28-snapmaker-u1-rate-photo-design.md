# Snapmaker U1 machine rate and printer photo design

## Goal

Add complete local pricing and visual identification support for the active `Snapmaker U1` printer using PrintWorks' existing machine-rate and static printer-photo patterns.

## Scope

This change will:

- add a machine-rate row for the exact model name `Snapmaker U1` in the local PrintWorks database;
- store the selected official Snapmaker U1 hero image as an app-owned static WebP asset;
- map `Snapmaker U1` to that image in the Printers UI and local media route;
- add focused regression tests for the rate calculation, model mapping, and media response.

It will not add a database-backed image registry, remote image loading at runtime, printer inventory changes, or a schema migration.

## Machine rate

Use the same assumptions as the existing A1 Mini and P1S rates:

| Input              |       Value |
| ------------------ | ----------: |
| Purchase price     |     $899.00 |
| Lifetime           | 3,000 hours |
| Electricity        |  $0.10/hour |
| Maintenance buffer |  $0.50/hour |

PrintWorks calculates:

```text
machine_rate_per_hr = purchase_price / lifetime_hrs
                    + electricity_rate
                    + maintenance_buffer
```

For the U1:

```text
899 / 3000 + 0.10 + 0.50 = 0.8996666667/hour
```

The database retains the calculated precision; the UI displays **$0.90/hour**.

The implementation will use the existing machine-rate upsert path against `bambu_print_history.sqlite`, keyed by the exact imported model `Snapmaker U1`. The database mutation is local operational data and will not be represented as a migration or committed seed.

## Printer image

Use the user-selected **official hero image** from Snapmaker's store:

```text
https://shop.snapmaker.com/cdn/shop/files/SnapmakerU13DPrinter_1.webp?crop=center&height=1200&v=1784886369&width=1200
```

The source currently responds with image bytes despite its CDN extension. The implementation will validate and decode the response with Sharp, preserve its aspect ratio, constrain it to a practical maximum size, and encode a deterministic WebP asset at:

```text
frontend/public/printers/snapmaker-u1.webp
```

The application will never hotlink this URL at runtime.

## Rendering flow

The existing fixed printer-photo registry will gain the slug `snapmaker-u1`, with source and built-asset candidates matching the existing A1 Mini and P1S behavior.

The frontend printer-card resolver will map a normalized model containing `snapmaker u1` to:

```text
/ui/printers/snapmaker-u1
```

The route will serve only the fixed allowlisted asset path with the existing image content-type and cache behavior. Unknown printer models will continue to render without an image.

## Failure handling

- A failed download, unsupported/invalid image, or failed WebP conversion stops implementation before the asset is committed.
- A missing local U1 asset returns the existing 404 behavior rather than falling back to the remote CDN.
- Machine-rate validation continues to reject non-positive lifetime hours.
- The local rate upsert will be read back and checked before completion.

## Testing and verification

Focused tests will prove:

- the existing rate formula produces approximately `$0.899667/hour` for the approved U1 inputs;
- `Snapmaker U1` resolves to `/ui/printers/snapmaker-u1` while unknown models remain unmapped;
- `/ui/printers/snapmaker-u1` serves the committed WebP with the expected content type;
- missing or invalid printer slugs retain existing 404/validation behavior.

Final verification will run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

The implementation will stage only U1-related source, test, asset, and documentation files. Existing unrelated working-tree edits remain untouched.

## Related work

This is a focused step under GitHub issue #35, which tracks printer replacement and multi-printer pricing support. It does not change the broader provider/printer filtering work in #30.
