# Price-First Workflow Design

**Status:** Approved for planning

## Product direction

PrintWorks is a local-first pricing and production ledger for a mixed personal and small-scale sellable print shop. Its primary job is to answer:

> What did this item cost to make, and what should I charge for each sellable unit?

The app imports actual print history from multiple printers and providers, lets the user select every production attempt involved in an item, and turns those facts into a practical direct-sale or Etsy price.

The system must work equally well for:

- a multi-part Green Ranger Dagger printed across multiple printers and files;
- a plate containing several identical sellable figures;
- a one-off item sold locally;
- a repeatable licensed product sold through Etsy;
- personal prints that need no sales workflow.

## Core principles

1. Imported print records are facts, not business classifications.
2. Pricing must not depend on perfect automatic project grouping.
3. A production batch is the unit that connects print attempts to successful output.
4. A product is optional and represents something worth selling repeatedly.
5. Manufacturing cost is independent of sales channel.
6. Selling-price recommendations account for channel fees and profit targets.
7. Printer-specific rates must reflect the actual mixed-printer shop.

## Primary information architecture

### Prints

Automatically imported provider history from Bambu, Moonraker/Snapmaker, and future Voron integrations.

Each print retains:

- provider and printer identity;
- source title and provider identifiers;
- start/end times and runtime;
- material type, color, and measured usage;
- successful, failed, or cancelled status;
- media and raw provider metadata.

Prints may be personal, used in one-off pricing, or attached to one or more explicit production workflows where valid. Imported history is not renamed or semantically rewritten to force grouping.

### Price

The primary user workflow. It creates a quote from selected production attempts and successful sellable output.

A quote can remain a one-off result or be saved as a production batch attached to a reusable product.

### Products

Optional reusable sellable records. Products may store:

- display name and description;
- source/designer and source URL;
- commercial license or subscription source, including Cubee;
- listing/channel references such as Etsy;
- default batch and per-unit labor;
- default extra components or consumables;
- prior production batches and observed unit costs.

A user does not need to create a Product before obtaining a price.

### Printers

First-class printer inventory. Initial real-world targets are:

- Bambu Lab P1S;
- Snapmaker U1;
- Voron Trident.

Each printer can have independent purchase price, expected service life, maintenance allowance, electricity assumptions, and derived machine-hour cost.

### Projects

Projects remain available as an imported-history organization and cleanup concept during transition. They are not required for accurate pricing and are removed from the primary workflow. Manual project merging remains useful secondary tooling under issue #44.

## Price-this workflow

A user can begin from a print row or a multi-selection of print rows by choosing **Price this**.

### Step 1: Production attempts

- Preselect the originating print or current selection.
- Search and add related prints from any provider or printer.
- Allow successful, failed, and cancelled attempts.
- Display status, printer, date, material, runtime, and existing grouping context.
- Display running totals for measured material, machine time, and attempt count.

This explicit selection is the business source of truth. Filename, title, timing, and existing project relationships may help search or suggest candidates later, but never silently add attempts.

### Step 2: Output and labor

Required:

- successful sellable-unit quantity, as a positive integer.

Optional/defaultable:

- one-time batch labor minutes;
- per-unit assembly or finishing labor minutes;
- additional material or consumable cost;
- purchased components such as magnets, hardware, paint, or packaging;
- notes describing assumptions.

One-time labor applies once. Per-unit labor is multiplied by successful quantity.

### Step 3: Sales scenario

The user can calculate:

- direct/local sale pricing;
- Etsy pricing with configured platform fees.

Shipping is separate from manufacturing cost. Packaging, postage, or shipping subsidy can be entered explicitly when relevant.

### Result

The result prioritizes fast communication and displays:

- total manufacturing cost;
- production-loss cost from failed/cancelled attempts;
- successful sellable quantity;
- manufacturing cost per successful unit;
- minimum viable price;
- recommended direct-sale or Etsy unit price;
- expected profit dollars per unit and per batch;
- profit margin and markup;
- warnings for fallback or incomplete inputs.

A **Copy price summary** action produces concise text suitable for sending to the user's wife. The result can be discarded, saved as a one-off quote, or saved as a batch for an existing/new Product.

## Cost model

Manufacturing cost is calculated before sales-channel fees.

### Print-attempt costs

All selected attempts contribute their actual costs, including failed and cancelled attempts:

- measured material cost;
- machine runtime cost using the assigned printer's rate;
- electricity and maintenance components represented by that machine rate.

Failed/cancelled cost is separately reported as production loss but remains included in total manufacturing cost.

### Labor

- Batch labor cost = batch labor time × configured labor rate.
- Per-unit labor cost = per-unit labor time × successful quantity × labor rate.

### Extras

Explicit line items cover consumables, purchased parts, packaging, or other costs not represented by provider history.

### Unit cost

```text
total manufacturing cost = attempt costs + batch labor + per-unit labor + extras
unit manufacturing cost = total manufacturing cost / successful sellable quantity
```

A quote cannot be calculated with zero successful units.

## Selling-price recommendations

Global defaults provide a target margin and channel fee profiles. A quote may override them without changing the defaults.

### Direct/local

The recommendation solves for a unit sale price that covers unit manufacturing cost and achieves the target margin.

### Etsy

The recommendation additionally accounts for configured percentage and fixed per-sale fees. Fee assumptions must be visible in the breakdown and editable because Etsy fee structures may change or vary by seller settings.

Manufacturing cost remains identical across channel scenarios. Only fees and resulting recommended sale price differ.

Both margin and markup are displayed, but target margin is the primary recommendation control.

## Rate configuration

### Printer rates

Each printer stores or derives:

- purchase price;
- expected service life in hours;
- electricity rate and expected power use where modeled;
- maintenance allowance;
- resulting machine cost per hour.

Prints with a known printer use that printer's rate. Missing printer rates produce an explicit warning and require a visible fallback or user choice.

### Material rates

Material costs use the actual recorded filament type when available. Missing material rates produce an explicit warning and visible fallback rather than an unexplained default.

### Business defaults

Configurable defaults include:

- labor hourly rate;
- target profit margin;
- Etsy percentage and fixed fees;
- optional packaging/shipping defaults.

## Persistence and historical accuracy

Saved quotes and production batches snapshot:

- selected print IDs;
- successful quantity;
- labor and extra-cost inputs;
- printer/material rates used;
- channel fee assumptions;
- target margin;
- complete computed breakdown.

Later changes to global rates do not silently rewrite historical saved prices. The UI may offer an explicit recalculation using current rates in a future iteration.

## Relationship to existing data

Existing jobs, projects, products, batches, printer inventory, rates, and pricing data remain intact.

Implementation should reuse and evolve existing pricing-profile, product, and batch concepts where their contracts match this design. It must avoid introducing a parallel pricing engine or duplicate batch model.

Existing project pricing remains available during migration, but the new explicit quote/batch workflow becomes the preferred path.

## Error handling and safeguards

- Successful quantity must be a positive integer.
- At least one print attempt must be selected.
- Missing or deleted selected prints produce a clear blocking error.
- Missing printer/material rates produce visible warnings and explicit fallback behavior.
- Invalid fee or labor values are rejected rather than coerced.
- Saving a quote/batch is transactional.
- Provider resyncs do not detach print attempts from saved batches or alter saved pricing snapshots.
- The UI does not imply that auto-grouped Projects are authoritative production batches.

## Testing strategy

### Pricing engine

Tests cover:

- successful attempts across one and multiple printers;
- failed/cancelled cost allocation;
- multiple sellable units from one plate;
- batch and per-unit labor;
- extras and purchased components;
- printer-specific and material-specific rates;
- direct-sale target-margin calculations;
- Etsy percentage and fixed-fee calculations;
- missing-rate warnings and explicit fallbacks;
- zero/invalid quantity rejection;
- deterministic snapshot output.

### Backend and persistence

Tests cover:

- cross-provider print selection;
- one-off quote save;
- product batch save;
- stored input/rate/breakdown snapshots;
- transactional failures;
- provider resync preservation.

### Frontend

Tests cover:

- starting from one or multiple selected prints;
- searching and adding attempts;
- running totals;
- quantity and labor validation;
- switching direct/Etsy scenarios;
- warning presentation;
- copied price summaries;
- save-as-one-off and save-to-product flows.

## Delivery sequence

Implementation planning should stage this direction so the app remains usable throughout:

1. audit and align existing pricing/batch contracts with this design;
2. implement the deterministic quote calculation contract;
3. implement the Price-this API and persistence snapshot;
4. add the Price-this UI from print history;
5. add save-to-product and historical batch comparison;
6. demote Projects in navigation only after pricing workflow parity is proven.

## Out of scope for the initial price-first workflow

- automatic cross-provider production grouping;
- order management, fulfillment, or full ERP behavior;
- automatic Etsy listing creation or live Etsy API integration;
- inventory/MRP for every component;
- shipping-label purchasing;
- production queue scheduling;
- deleting existing Projects or project data;
- automatic recalculation of historical saved quotes.
