import { describe, expect, it } from "vitest";
import {
  beginPriceQuoteRequest,
  canCalculatePriceQuote,
  completePriceQuoteRequest,
  initialPriceQuoteRequestState,
  initialPriceThisDraft,
  invalidatePriceQuoteRequests,
  isCurrentPriceQuoteRequest,
  priceThisDraftToRequest,
  suggestedProductName,
  togglePriceJob,
} from "../frontend/components/price-this-helpers.js";
import type { Job } from "../frontend/components/jobs-view-types.js";

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

describe("Price-this suggested product names", () => {
  it("prefers the first selected job's design title, then title, then a fallback", () => {
    const designTitleJob: Job & { title?: string } = {
      id: 12,
      designTitle: "Green Ranger Dagger",
      title: "ignored",
    };
    const titleFallbackJob: Job & { title?: string } = {
      id: 12,
      designTitle: " ",
      title: "Maker Coin",
    };

    expect(suggestedProductName([designTitleJob])).toBe("Green Ranger Dagger");
    expect(suggestedProductName([titleFallbackJob])).toBe("Maker Coin");
    expect(suggestedProductName([undefined])).toBe("New product");
  });
});

describe("Price-this request invalidation", () => {
  it("rejects a response after a draft edit invalidates its request", () => {
    const started = beginPriceQuoteRequest(initialPriceQuoteRequestState());
    const invalidated = invalidatePriceQuoteRequests(started.state);

    expect(isCurrentPriceQuoteRequest(invalidated, started.requestGeneration)).toBe(false);
  });

  it("only accepts the newest calculation and closes it on completion", () => {
    const first = beginPriceQuoteRequest(initialPriceQuoteRequestState());
    const second = beginPriceQuoteRequest(first.state);

    expect(isCurrentPriceQuoteRequest(second.state, first.requestGeneration)).toBe(false);
    expect(isCurrentPriceQuoteRequest(second.state, second.requestGeneration)).toBe(true);

    const completed = completePriceQuoteRequest(second.state, second.requestGeneration);
    expect(isCurrentPriceQuoteRequest(completed, second.requestGeneration)).toBe(false);
  });
});
