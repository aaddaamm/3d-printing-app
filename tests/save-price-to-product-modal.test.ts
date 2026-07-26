import { describe, expect, it } from "vitest";

import {
  beginSaveProductRequest,
  buildSaveProductPricingRequest,
  completeSaveProductRequest,
  initialSaveProductRequestState,
  initialSaveToProductModalState,
  invalidateSaveProductRequests,
  isCurrentSaveProductRequest,
  setSaveToProductExistingProductId,
  setSaveToProductMode,
  setSaveToProductNewProductField,
  type ExistingOrNewProductSelection,
  unmountSaveProductRequests,
} from "../frontend/components/price-this-helpers.js";
import type { Job } from "../frontend/components/jobs-view-types.js";
import type { PriceThisDraft } from "../frontend/components/price-this-helpers.js";

describe("save-to-product modal request state", () => {
  it("rejects a stale response after close or unmount invalidates the request", () => {
    const started = beginSaveProductRequest(initialSaveProductRequestState());
    expect(started).not.toBeNull();
    if (!started) return;

    expect(
      isCurrentSaveProductRequest(
        invalidateSaveProductRequests(started.state),
        started.requestGeneration,
      ),
    ).toBe(false);
    expect(
      isCurrentSaveProductRequest(
        unmountSaveProductRequests(started.state),
        started.requestGeneration,
      ),
    ).toBe(false);
  });

  it("treats only the newest request as current and closes it on completion", () => {
    const first = beginSaveProductRequest(initialSaveProductRequestState());
    expect(first).not.toBeNull();
    if (!first) return;

    const second = beginSaveProductRequest(invalidateSaveProductRequests(first.state));
    expect(second).not.toBeNull();
    if (!second) return;

    expect(isCurrentSaveProductRequest(second.state, first.requestGeneration)).toBe(false);
    expect(isCurrentSaveProductRequest(second.state, second.requestGeneration)).toBe(true);

    const completed = completeSaveProductRequest(second.state, second.requestGeneration);
    expect(isCurrentSaveProductRequest(completed, second.requestGeneration)).toBe(false);
  });

  it("prevents duplicate begin calls while a submit is already active", () => {
    const started = beginSaveProductRequest(initialSaveProductRequestState());
    expect(started).not.toBeNull();
    if (!started) return;

    expect(beginSaveProductRequest(started.state)).toBeNull();
  });
});

describe("save-to-product modal form state", () => {
  it("preserves new-product fields while switching between new and existing modes", () => {
    const jobs: Array<Job | undefined> = [{ id: 4, designTitle: "Orbiter" }];
    const initial = initialSaveToProductModalState(jobs);
    const edited = setSaveToProductNewProductField(
      setSaveToProductNewProductField(initial, "designer", "Ada"),
      "notes",
      "First batch",
    );
    const existing = setSaveToProductExistingProductId(
      setSaveToProductMode(edited, "existing"),
      "17",
    );
    const backToNew = setSaveToProductMode(existing, "new");

    expect(backToNew.mode).toBe("new");
    expect(backToNew.existingProductId).toBe("17");
    expect(backToNew.newProduct).toEqual({
      mode: "new",
      name: "Orbiter",
      designer: "Ada",
      sourceId: "",
      licenseId: "unknown_verify",
      modelUrl: "",
      notes: "First batch",
    });
  });
});

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
