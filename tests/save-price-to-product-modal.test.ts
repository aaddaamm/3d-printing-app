import { describe, expect, it } from "vitest";

import {
  buildSaveProductPricingRequest,
  type ExistingOrNewProductSelection,
} from "../frontend/components/price-this-helpers.js";
import type { PriceThisDraft } from "../frontend/components/price-this-helpers.js";

describe("buildSaveProductPricingRequest", () => {
  it("maps manufacturing inputs for an existing product without the viewed quote channel", () => {
    const draft: PriceThisDraft = {
      selectedJobIds: [4, 9],
      sellableUnits: 3,
      batchLaborMinutes: 12,
      perUnitLaborMinutes: 2,
      packagingCostPerUnit: 0.75,
      extraCost: 4.5,
      channel: "etsy",
    };
    const selection: ExistingOrNewProductSelection = { mode: "existing", productId: 17 };

    expect(buildSaveProductPricingRequest(draft, selection)).toEqual({
      product_id: 17,
      job_ids: [4, 9],
      sellable_units: 3,
      batch_labor_minutes: 12,
      per_unit_labor_minutes: 2,
      packaging_cost_per_unit: 0.75,
      extra_cost: 4.5,
    });
  });

  it("trims and maps a new product payload", () => {
    const draft: PriceThisDraft = {
      selectedJobIds: [11],
      sellableUnits: 5,
      batchLaborMinutes: 8,
      perUnitLaborMinutes: 1,
      packagingCostPerUnit: 0.5,
      extraCost: 0,
      channel: "direct",
    };

    expect(
      buildSaveProductPricingRequest(draft, {
        mode: "new",
        name: "  Gizmo  ",
        designer: "  Ada  ",
        sourceId: "makerworld",
        licenseId: "unknown_verify",
        modelUrl: "  https://example.com/gizmo  ",
        notes: "  First batch  ",
      }),
    ).toEqual({
      job_ids: [11],
      sellable_units: 5,
      batch_labor_minutes: 8,
      per_unit_labor_minutes: 1,
      packaging_cost_per_unit: 0.5,
      extra_cost: 0,
      new_product: {
        name: "Gizmo",
        designer: "Ada",
        source_id: "makerworld",
        license_id: "unknown_verify",
        model_url: "https://example.com/gizmo",
        notes: "First batch",
      },
    });
  });
});
