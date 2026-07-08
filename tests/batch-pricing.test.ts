import { describe, expect, it } from "vitest";
import { calcBatchPricing, type BatchPricingInput } from "../lib/batch-pricing.js";

const baseInput: BatchPricingInput = {
  completedQuantity: 4,
  failedQuantity: 1,
  totalFilamentG: 200,
  totalPrintTimeS: 7200,
  materialRatePerG: 0.03,
  machineRatePerHr: 1.5,
  laborHourlyRate: 30,
  setupMinutes: 10,
  handlingMinutesPerUnit: 3,
  packagingCostPerUnit: 0.75,
  targetMarginPct: 0.5,
  platformFeePct: 0.035,
  failureBufferPct: 0.08,
  overheadBufferPct: 0.05,
  minimumPrice: 5,
};

describe("calcBatchPricing", () => {
  it("throws when completed quantity is not positive", () => {
    expect(() => calcBatchPricing({ ...baseInput, completedQuantity: 0 })).toThrow(/completed/i);
  });

  it("throws when target margin and platform fee leave no viable price", () => {
    expect(() =>
      calcBatchPricing({ ...baseInput, targetMarginPct: 0.8, platformFeePct: 0.15 }),
    ).toThrow(/margin|fee/i);
  });

  it("calculates batch costs per completed sellable unit", () => {
    const result = calcBatchPricing(baseInput);

    expect(result.sellableUnits).toBe(baseInput.completedQuantity);
    expect(result.materialCost).toBeCloseTo(6, 2);
    expect(result.machineCost).toBeCloseTo(3, 2);
    expect(result.setupLaborCost).toBeCloseTo(5, 2);
    expect(result.handlingLaborCost).toBeCloseTo(6, 2);
    expect(result.packagingCost).toBeCloseTo(3, 2);
    expect(result.subtotalCost).toBeCloseTo(23, 2);
    expect(result.bufferCost).toBeCloseTo(2.99, 2);
    expect(result.totalCost).toBeCloseTo(25.99, 2);
    expect(result.unitCost).toBeCloseTo(result.totalCost / baseInput.completedQuantity, 2);
    expect(result.suggestedPrice).toBe(13.99);
    expect(result.estimatedMarginPct).toBeGreaterThanOrEqual(baseInput.targetMarginPct);
  });

  it("prices Etsy higher than booth for the same batch costs", () => {
    const booth = calcBatchPricing(baseInput);
    const etsy = calcBatchPricing({
      ...baseInput,
      targetMarginPct: 0.55,
      platformFeePct: 0.13,
      packagingCostPerUnit: 1,
      handlingMinutesPerUnit: 4,
      minimumPrice: 9.99,
    });

    expect(booth.suggestedPrice).toBeLessThan(etsy.suggestedPrice);
  });

  it("uses rounded unit cost as the personal price when margin and fee are zero", () => {
    const personal = calcBatchPricing({
      ...baseInput,
      targetMarginPct: 0,
      platformFeePct: 0,
      failureBufferPct: 0,
      overheadBufferPct: 0,
      minimumPrice: null,
    });

    expect(personal.suggestedPrice).toBeCloseTo(personal.unitCost, 2);
  });

  it("honors minimum price before friendly .99 rounding", () => {
    const minimumPriceResult = calcBatchPricing({
      ...baseInput,
      completedQuantity: 10,
      totalFilamentG: 10,
      totalPrintTimeS: 60,
      setupMinutes: 0,
      handlingMinutesPerUnit: 0,
      packagingCostPerUnit: 0,
      targetMarginPct: 0.5,
      platformFeePct: 0.13,
      failureBufferPct: 0,
      overheadBufferPct: 0,
      minimumPrice: 9.99,
    });

    expect(minimumPriceResult.suggestedPrice).toBe(9.99);
  });
});
