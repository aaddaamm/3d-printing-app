import { describe, expect, it } from "vitest";
import {
  canCalculatePriceQuote,
  initialPriceThisDraft,
  priceThisDraftToRequest,
  togglePriceJob,
} from "../frontend/components/price-this-helpers.js";

describe("Price-this draft state", () => {
  it("preserves unique initial job IDs in first-seen order", () => {
    expect(initialPriceThisDraft([12, 7, 12])).toEqual({
      selectedJobIds: [12, 7],
      sellableUnits: 1,
      batchLaborMinutes: 0,
      perUnitLaborMinutes: 0,
      packagingCostPerUnit: 0,
      extraCost: 0,
      channel: "direct",
    });
  });

  it("immutably adds and removes selected jobs", () => {
    const initial = initialPriceThisDraft([12, 7]);
    const removed = togglePriceJob(initial, 12);
    const added = togglePriceJob(removed, 4);

    expect(initial.selectedJobIds).toEqual([12, 7]);
    expect(removed).not.toBe(initial);
    expect(removed.selectedJobIds).toEqual([7]);
    expect(added.selectedJobIds).toEqual([7, 4]);
  });

  it("requires a selected job and a positive integer sellable quantity", () => {
    const valid = initialPriceThisDraft([12]);

    expect(canCalculatePriceQuote(valid)).toBe(true);
    expect(canCalculatePriceQuote({ ...valid, selectedJobIds: [] })).toBe(false);
    expect(canCalculatePriceQuote({ ...valid, sellableUnits: 0 })).toBe(false);
    expect(canCalculatePriceQuote({ ...valid, sellableUnits: 1.5 })).toBe(false);
  });

  it("maps all draft inputs to the quote request contract", () => {
    expect(
      priceThisDraftToRequest({
        selectedJobIds: [12, 7],
        sellableUnits: 3,
        batchLaborMinutes: 10,
        perUnitLaborMinutes: 4,
        packagingCostPerUnit: 0.75,
        extraCost: 6.5,
        channel: "etsy",
      }),
    ).toEqual({
      job_ids: [12, 7],
      sellable_units: 3,
      batch_labor_minutes: 10,
      per_unit_labor_minutes: 4,
      packaging_cost_per_unit: 0.75,
      extra_cost: 6.5,
      channel: "etsy",
    });
  });
});
