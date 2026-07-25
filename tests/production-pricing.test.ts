import { describe, expect, it } from "vitest";
import { calcProductionPricing, type ProductionPricingInput } from "../lib/production-pricing.js";

const manufacturing: ProductionPricingInput = {
  sellableUnits: 4,
  materialCost: 12,
  machineCost: 8,
  productionLossCost: 5,
  laborHourlyRate: 30,
  batchLaborMinutes: 10,
  perUnitLaborMinutes: 3,
  packagingCostPerUnit: 0.5,
  extraCost: 4,
  targetMarginPct: 0.5,
  platformFeePct: 0,
  fixedFeePerOrder: 0,
  failureBufferPct: 0,
  overheadBufferPct: 0,
  minimumPrice: null,
};

describe("calcProductionPricing", () => {
  it("calculates shared production costs without double-counting production loss", () => {
    expect(calcProductionPricing(manufacturing)).toMatchObject({
      sellableUnits: 4,
      materialCost: 12,
      machineCost: 8,
      productionLossCost: 5,
      batchLaborCost: 5,
      perUnitLaborCost: 6,
      packagingCost: 2,
      extraCost: 4,
      subtotalCost: 37,
      bufferCost: 0,
      totalCost: 37,
      unitCost: 9.25,
      minimumViablePrice: 9.25,
      suggestedPrice: 18.99,
      profitPerUnit: 9.74,
      profitPerBatch: 38.96,
      estimatedMarginPct: 0.5129,
    });
  });

  it("preserves manufacturing cost while channel fees change the recommendation", () => {
    const direct = calcProductionPricing(manufacturing);
    const etsy = calcProductionPricing({
      ...manufacturing,
      platformFeePct: 0.13,
      fixedFeePerOrder: 0.45,
    });

    expect(etsy.totalCost).toBe(direct.totalCost);
    expect(etsy.unitCost).toBe(direct.unitCost);
    expect(etsy.minimumViablePrice).toBe(11.15);
    expect(etsy.suggestedPrice).toBeGreaterThan(direct.suggestedPrice);
  });

  it("rejects zero sellable units", () => {
    expect(() => calcProductionPricing({ ...manufacturing, sellableUnits: 0 })).toThrow(
      /sellableUnits/i,
    );
  });

  it("rejects non-integer sellable units", () => {
    expect(() => calcProductionPricing({ ...manufacturing, sellableUnits: 1.5 })).toThrow(
      /sellableUnits/i,
    );
  });

  it.each([
    ["materialCost", -1],
    ["machineCost", Number.NaN],
    ["productionLossCost", Number.POSITIVE_INFINITY],
    ["laborHourlyRate", -1],
    ["batchLaborMinutes", -1],
    ["perUnitLaborMinutes", -1],
    ["packagingCostPerUnit", -1],
    ["extraCost", -1],
    ["targetMarginPct", -1],
    ["platformFeePct", -1],
    ["fixedFeePerOrder", -1],
    ["failureBufferPct", -1],
    ["overheadBufferPct", -1],
    ["minimumPrice", -1],
  ] satisfies Array<[keyof ProductionPricingInput, number]>)(
    "rejects invalid %s",
    (field, value) => {
      expect(() => calcProductionPricing({ ...manufacturing, [field]: value })).toThrow(
        new RegExp(field, "i"),
      );
    },
  );

  it("rejects an unviable combined target margin and platform fee", () => {
    expect(() =>
      calcProductionPricing({
        ...manufacturing,
        targetMarginPct: 0.8,
        platformFeePct: 0.15,
      }),
    ).toThrow(/margin|fee/i);
  });
});
