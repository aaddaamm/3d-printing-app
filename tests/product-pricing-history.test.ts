import { describe, expect, it } from "vitest";
import type {
  PriceQuoteResult,
  SavedPriceSnapshot,
  SavedProductPricingBatch,
} from "../frontend/lib/api.js";
import {
  beginProductPricingHistoryRequest,
  initialProductPricingHistoryRequestState,
  latestPricingCards,
  rejectProductPricingHistoryRequest,
  resolveProductPricingHistoryRequest,
} from "../frontend/components/product-pricing-history.js";

function quote(
  channel: "direct" | "etsy",
  overrides: {
    unitCost?: number;
    productionLossCost?: number;
    suggestedPrice?: number;
    profitPerUnit?: number;
    estimatedMarginPct?: number;
    warnings?: string[];
  } = {},
): PriceQuoteResult {
  return {
    channel,
    assumptions: {
      labor_hourly_rate: 30,
      target_margin_pct: 0.5,
      platform_fee_pct: channel === "etsy" ? 0.12 : 0,
      fixed_fee_per_order: channel === "etsy" ? 0.45 : 0,
      failure_buffer_pct: 0.1,
      overhead_buffer_pct: 0.05,
      resolved_rates: [],
    },
    attempts: [],
    warnings: overrides.warnings ?? [],
    breakdown: {
      sellableUnits: 4,
      materialCost: 4,
      machineCost: 6,
      productionLossCost: overrides.productionLossCost ?? 2.25,
      batchLaborCost: 2,
      perUnitLaborCost: 1,
      packagingCost: 1,
      extraCost: 0,
      subtotalCost: 14,
      bufferCost: 1,
      totalCost: 15,
      unitCost: overrides.unitCost ?? 9.5,
      minimumViablePrice: 15,
      suggestedPrice: overrides.suggestedPrice ?? (channel === "direct" ? 29.99 : 34.99),
      profitPerUnit: overrides.profitPerUnit ?? 20.49,
      profitPerBatch: 81.96,
      estimatedMarginPct: overrides.estimatedMarginPct ?? 0.5,
    },
  };
}

function snapshot(
  id: number,
  batchId: number,
  channel: "direct" | "etsy",
  createdAt: string,
  overrides: Parameters<typeof quote>[1] = {},
): SavedPriceSnapshot {
  return {
    id,
    batch_id: batchId,
    channel,
    created_at: createdAt,
    quote: quote(channel, overrides),
  };
}

function batch(
  batchId: number,
  createdAt: string,
  overrides: Parameters<typeof quote>[1] = {},
): SavedProductPricingBatch {
  return {
    batch_id: batchId,
    created_at: createdAt,
    sellable_units: 4,
    job_ids: [2, 8],
    notes: null,
    snapshots: {
      direct: snapshot(batchId * 2, batchId, "direct", createdAt, overrides),
      etsy: snapshot(batchId * 2 + 1, batchId, "etsy", createdAt, overrides),
    },
  };
}

describe("saved Product pricing history request lifecycle", () => {
  it("clears Product A history when Product B begins loading", () => {
    const first = beginProductPricingHistoryRequest(initialProductPricingHistoryRequestState(), 1);
    const withFirstHistory = resolveProductPricingHistoryRequest(
      first.state,
      first.requestGeneration,
      [batch(10, "2026-07-25 12:00:00")],
    );

    const second = beginProductPricingHistoryRequest(withFirstHistory, 2);

    expect(second.state).toMatchObject({
      productId: 2,
      loading: true,
      history: [],
      error: null,
    });
  });

  it("rejects stale Product A data and keeps Product B empty after rejection", () => {
    const first = beginProductPricingHistoryRequest(initialProductPricingHistoryRequestState(), 1);
    const withFirstHistory = resolveProductPricingHistoryRequest(
      first.state,
      first.requestGeneration,
      [batch(10, "2026-07-25 12:00:00")],
    );
    const second = beginProductPricingHistoryRequest(withFirstHistory, 2);

    const afterStaleFirst = resolveProductPricingHistoryRequest(
      second.state,
      first.requestGeneration,
      [batch(11, "2026-07-25 13:00:00")],
    );
    const afterSecondFailure = rejectProductPricingHistoryRequest(
      afterStaleFirst,
      second.requestGeneration,
      "Failed to load pricing history.",
    );
    const afterLateSecondSuccess = resolveProductPricingHistoryRequest(
      afterSecondFailure,
      second.requestGeneration,
      [batch(12, "2026-07-25 14:00:00")],
    );

    expect(afterStaleFirst).toBe(second.state);
    expect(afterSecondFailure).toMatchObject({
      productId: 2,
      loading: false,
      history: [],
      error: "Failed to load pricing history.",
    });
    expect(afterLateSecondSuccess).toBe(afterSecondFailure);
  });
});

describe("saved Product pricing history view model", () => {
  it("returns no latest cards for empty stored history", () => {
    expect(latestPricingCards([])).toEqual([]);
  });

  it("formats Direct and Etsy cards entirely from the newest stored Batch", () => {
    const history = [
      batch(10, "2026-07-25 12:00:00", { unitCost: 4, suggestedPrice: 10 }),
      batch(12, "2026-07-25 13:00:00", {
        unitCost: 9.5,
        productionLossCost: 2.25,
        warnings: ["Used fallback material rate"],
      }),
    ];

    const cards = latestPricingCards(history);

    expect(cards).toEqual([
      expect.objectContaining({
        batchId: 12,
        channel: "direct",
        price: 29.99,
        unitCost: 9.5,
        productionLossCost: 2.25,
        warningCount: 1,
        linkedJobCount: 2,
        successfulQuantity: 4,
      }),
      expect.objectContaining({
        batchId: 12,
        channel: "etsy",
        price: 34.99,
        unitCost: 9.5,
        productionLossCost: 2.25,
        warningCount: 1,
      }),
    ]);
  });

  it("breaks same-time newest-Batch ties deterministically by Batch id", () => {
    const cards = latestPricingCards([
      batch(20, "2026-07-25 13:00:00", { suggestedPrice: 20 }),
      batch(21, "2026-07-25 13:00:00", { suggestedPrice: 21 }),
    ]);

    expect(cards.map((card) => card.batchId)).toEqual([21, 21]);
    expect(cards.map((card) => card.price)).toEqual([21, 21]);
  });
});
