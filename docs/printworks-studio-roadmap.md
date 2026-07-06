# PrintWorks Studio Roadmap

PrintWorks Studio is the long-term evolution of this application from a 3D print pricing/history tool into the central operating system for Robinson PrintWorks.

Pricing remains important, but it becomes one module in a larger local-first business system for cataloging printable products, tracking files and licensing, managing production, inventory, sales, and analytics.

## Product vision

The application should answer operational questions such as:

- Where is this model?
- Can I legally sell it?
- Have I test printed it?
- Is it listed on Etsy?
- What filament does it use?
- What does it cost to make?
- Which printer profile should I use?
- Do I already have photos?
- How many have I sold?
- Which machine printed it?
- Is this one of my original designs?
- Which files belong to this design?

The goal is to eliminate spreadsheets, scattered folders, sticky notes, and memory.

## Core principles

### Filesystem is storage

Folders are where files live. The app must adapt to the existing filesystem instead of requiring a strict folder structure.

The app must not:

- Reorganize user folders.
- Rename user files.
- Require files to be moved into app-managed directories.

### SQLite is truth

SQLite is the source of truth for business metadata, scan state, file identity, product records, pricing state, and future inventory/sales data.

The filesystem is scanned and synchronized into SQLite.

### Idempotency

All sync and scan operations must be safe to run repeatedly.

Running a scanner twice against unchanged input should produce the same database state.

The system must:

- Never duplicate products.
- Never duplicate files.
- Never duplicate thumbnails.
- Preserve metadata when files move.
- Update file locations when content hashes match moved files.
- Mark missing files as missing instead of deleting records.

### Extensibility over speed

This is a long-term application. Design decisions should prioritize maintainability, clear module boundaries, and future integrations over fast one-off feature delivery.

## High-level modules

### 1. Product Catalog

Maintains every printable design. A product represents a printable object, such as:

- Flexi Gecko
- Dragon
- Gridfinity Bin
- Voron Part

Products should eventually reference assets instead of directly referencing files whenever practical. A product may include many related assets:

- Printable models
- Print profiles
- CAD source
- Product photography
- Instruction documents
- Commercial licenses and receipts
- Packaging artwork
- Marketing graphics
- Videos

### 2. Asset System

The asset system is an architectural enhancement, not an immediate feature requirement.

Not everything associated with a product is a printable model. Assets provide an abstraction layer between products and physical files:

```text
Product → Assets → Files
```

One asset may contain one or more physical files.

Example product: Flexi Gecko

Example assets:

- Printable Model
- Print Profile
- Product Photography
- Commercial License
- Packaging Artwork
- Instructions

Example asset/file mappings:

- Printable Model: `dragon.stl`, `dragon.3mf`, `dragon.step`
- Photography: `hero.jpg`, `side.jpg`, `packaging.jpg`
- License: `receipt.pdf`, `commercial-license.pdf`

Initial asset types:

- Model
- Print Profile
- CAD Source
- Photo
- License
- Receipt
- Documentation
- Packaging
- Marketing
- Video
- Other

Asset types should be extensible. Avoid hard-coding assumptions that every product owns only printable model files.

Asset metadata belongs to the asset, not the file. Examples:

- Model asset: preferred model, supports/no supports, multipart, articulated.
- Photo asset: hero image, Etsy image, website image, thumbnail.
- License asset: commercial permission, personal-only restriction, expiration, purchase date.
- Print profile asset: preferred printer, preferred nozzle, preferred material, layer height.

Prefer composition over special-case tables. Avoid creating separate tables such as `product_images`, `product_models`, `product_documents`, and `product_licenses` when the same concept can be represented as assets.

### 3. File Scanner

Recursively scans configured roots and records files in SQLite.

Supported file types should include:

- STL
- 3MF
- OBJ
- STEP/STP
- ZIP
- 7Z
- RAR
- PDFs
- Images
- G-code, optionally

For each file, store:

- Path
- Normalized path
- Filename
- Extension
- File size
- Filesystem timestamps
- Quick hash
- Content hash
- Thumbnail reference
- Extracted metadata
- Scan status

### 4. Thumbnail Service

For 3MF files, treat the file as a ZIP archive and attempt to extract embedded preview images without modifying the original archive.

Extracted previews should be stored in an application-managed thumbnail cache.

Future enhancement: generate thumbnails for STL files.

### 5. Product Management

Each product should support metadata across these areas.

General:

- Name
- Slug
- Description

Source:

- Designer
- Marketplace
- Original creator
- Download URL
- Purchase date

Licensing:

- Commercial permission
- Personal-only restriction
- Patreon/commercial membership details
- Receipt attachment
- License notes

Business channels:

- Etsy
- Local
- Website
- Craft fair
- Wholesale

Status:

- Downloaded
- Needs review
- Licensed
- Test printed
- Photographed
- Listed
- Selling
- Retired

Production:

- Preferred printer
- Preferred material
- Preferred profile

Pricing:

- Material cost
- Machine time
- Labor
- Overhead
- Suggested retail
- Minimum price

### 6. Pricing Engine

The existing pricing calculator should become a reusable service.

Inputs:

- Filament/material
- Print time
- Machine
- Electricity
- Labor
- Markup

Outputs:

- Cost
- Suggested retail
- Profit
- Profit margin

Pricing should update automatically when production values change.

### 7. Inventory

Initial inventory should track filament:

- Brand
- Material
- Color
- Remaining grams
- Cost per kg

Future inventory modules may include:

- Hardware inventory
- Packaging inventory
- Shipping supplies

### 8. Production Queue

Future module for queued and active production.

Track:

- Product
- Quantity
- Printer
- Status
- Estimated completion
- Completed prints

### 9. Sales

Future module for sales tracking.

Initial channels:

- Etsy
- Local
- Website

Eventually, orders should be imported automatically where APIs allow it.

### 10. Analytics

Example analytics:

- Most profitable product
- Most printed product
- Average print time
- Filament usage
- Revenue
- Profit
- Machine utilization

## Suggested SQLite model

Initial table families:

- `roots`
- `files`
- `file_history`
- `products`
- `assets`
- `asset_files`
- `product_files`, if needed as a transitional/backward-compatible bridge
- `tags`
- `product_tags`
- `licenses`
- `photos`
- `pricing_profiles`
- `filaments`
- `machines`
- `machine_profiles`
- `inventory`
- `sales`
- `print_jobs`

Do not over-normalize. Favor readability and straightforward queries over theoretical schema perfection.

Suggested asset tables:

```text
assets
  id
  product_id
  asset_type
  title
  description
  created_at
  updated_at

asset_files
  asset_id
  file_id
  role
```

Example `asset_files.role` values:

- `primary`
- `alternate`
- `source`
- `thumbnail`
- `preview`
- `backup`

If existing implementation work directly links products to files, keep it working. The asset layer should be introduced cleanly when practical, without rewriting the application solely for this abstraction.

## Product completeness

Every product should calculate a completeness score.

Example checklist:

- Files
- Thumbnail
- License
- Pricing
- Photos
- Test print
- Packaging
- Etsy listing
- Website listing

The UI should display a completion percentage so unfinished products can be prioritized.

## Search

Search should be first-class and fast.

Search dimensions:

- Filename
- Product
- Designer
- Marketplace
- Tag
- Material
- Printer
- Etsy status
- License
- Notes

SQLite indexes should be added intentionally as search requirements become concrete.

## Filename handling

Never assume filenames are clean.

The scanner and catalog must support:

- Unicode
- Emoji
- Spaces
- Multiple dots
- Mixed case
- Very long names
- Reserved Windows names

Normalize only for searching. Always preserve the original filename.

## Configuration

The app should support multiple scan roots, each with a stable root ID.

Example roots:

- Downloads
- Cubee
- MakerWorld
- Original Designs
- Commercial Library
- NAS
- External drives

## UI philosophy

The UI should be:

- Fast
- Minimal
- Keyboard friendly
- Search-first

The user should rarely need to browse folders manually. The core flow should be search, filter, open, tag, and done.

## Future integrations

Design module boundaries so these can be added without major rewrites:

- Bambu Studio
- OrcaSlicer
- Snapmaker Orca
- Etsy API
- Printables API, if available
- Barcode/QR labels
- Shipping integration
- Inventory management
- AI-powered product tagging
- Automatic duplicate detection
- Automatic designer/source detection
- Automatic extraction of print time and filament usage from 3MF project files
- Local LLM assistance for search, categorization, and metadata suggestions

## Incremental development strategy

Each phase should leave the application in a working state.

Recommended priority order:

1. Refactor existing pricing code into a reusable Pricing Engine service.
2. Add the SQLite catalog and migrations.
3. Implement the filesystem scanner.
4. Add 3MF thumbnail extraction.
5. Introduce asset tables if reasonable, even if not fully integrated yet.
6. Build the Product Catalog UI.
7. Connect products to pricing.
8. Add tagging and search.
9. Add product completeness tracking.
10. Add inventory.
11. Add production queue.
12. Add sales and analytics.

Favor small, well-tested pull requests over large rewrites.

When changing existing code, preserve backward compatibility where practical. Existing pricing data should be migrated into new schemas instead of replaced.

Major structural changes should be preceded by a short architecture explanation and an explicit migration path.

When adding catalog features before the asset system is fully implemented:

- Keep the current implementation working.
- Design code so an asset layer can be introduced cleanly.
- Avoid assumptions that products only contain printable model files.
- Avoid forcing all metadata onto file records when it semantically belongs to a product-level asset.

## Current backlog alignment

Relevant existing GitHub issues at the time this roadmap was created:

- #31: Update docs and app naming for generalized 3D printing history/pricing.
- #33: Package app for local persistent deployment.
- #35: Printer replacement and multi-printer management.
- #4: Spool Inventory Tracking.
- #1: Bambu Studio Local Database Import.

A future umbrella issue for the Product Catalog, Asset System, and File Scanner would be useful when implementation begins.

## Asset system future capabilities

The asset architecture should make these future features easier to implement without another major schema redesign:

- Multiple print profiles per product.
- Multiple slicers, including Bambu Studio, OrcaSlicer, and Snapmaker Orca.
- Multiple thumbnail and preview images.
- Marketplace-specific image sets.
- CAD source tracking.
- Packaging templates.
- Version history.
- AI-generated marketing assets.
- AI-generated descriptions.
- Automatic duplicate detection.
- Automatic preview generation.
- Designer attribution.
- License management.
- Product bundles.
- Variants such as sizes, colors, and editions.

The user experience should stay simple while the internal model remains flexible enough to manage thousands of printable products over many years.
