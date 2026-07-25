import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCalculatePriceQuote, MockPriceQuoteValidationError } = vi.hoisted(() => {
  class PriceQuoteValidationError extends Error {}
  return {
    mockCalculatePriceQuote: vi.fn(),
    MockPriceQuoteValidationError: PriceQuoteValidationError,
  };
});

vi.mock("../models/price-quotes.js", () => ({
  calculatePriceQuote: mockCalculatePriceQuote,
  PriceQuoteValidationError: MockPriceQuoteValidationError,
}));

import { priceQuotes } from "../routes/price-quotes.js";

const validBody = {
  job_ids: [4, 9],
  sellable_units: 3,
  batch_labor_minutes: 12,
  per_unit_labor_minutes: 2.5,
  packaging_cost_per_unit: 0.75,
  extra_cost: 1.25,
  channel: "etsy",
  target_margin_pct: 0.45,
};

const sampleQuote = {
  channel: "etsy",
  assumptions: {
    labor_hourly_rate: 30,
    target_margin_pct: 0.45,
    platform_fee_pct: 0.12,
    fixed_fee_per_order: 0.45,
  },
  attempts: [],
  warnings: [],
  breakdown: { suggestedPrice: 12.5 },
};

function apiApp(): Hono {
  const app = new Hono();
  app.route("/api/price-quotes", priceQuotes);
  return app;
}

async function post(body: string): Promise<Response> {
  return apiApp().request("/api/price-quotes/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

describe("price quote routes", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockCalculatePriceQuote.mockReturnValue(sampleQuote);
  });

  it("forwards a valid request exactly and returns the quote", async () => {
    const res = await post(JSON.stringify(validBody));

    expect(res.status).toBe(200);
    expect(mockCalculatePriceQuote).toHaveBeenCalledWith(validBody);
    expect(await res.json()).toEqual({ quote: sampleQuote });
  });

  it("returns 400 for invalid JSON", async () => {
    const res = await post("{");

    expect(res.status).toBe(400);
    expect(mockCalculatePriceQuote).not.toHaveBeenCalled();
  });

  it("returns 400 for unknown fields", async () => {
    const res = await post(JSON.stringify({ ...validBody, unexpected: true }));

    expect(res.status).toBe(400);
    expect(mockCalculatePriceQuote).not.toHaveBeenCalled();
  });

  it.each([undefined, []])("returns 400 for missing or empty job_ids: %s", async (jobIds) => {
    const body = { ...validBody, job_ids: jobIds };
    if (jobIds === undefined) delete (body as Partial<typeof validBody>).job_ids;

    const res = await post(JSON.stringify(body));

    expect(res.status).toBe(400);
    expect(mockCalculatePriceQuote).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid channel", async () => {
    const res = await post(JSON.stringify({ ...validBody, channel: "wholesale" }));

    expect(res.status).toBe(400);
    expect(mockCalculatePriceQuote).not.toHaveBeenCalled();
  });

  it.each([
    ["job_ids", ["4", 9]],
    ["sellable_units", "3"],
    ["batch_labor_minutes", "12"],
    ["per_unit_labor_minutes", "2.5"],
    ["packaging_cost_per_unit", "0.75"],
    ["extra_cost", "1.25"],
    ["target_margin_pct", "0.45"],
  ])("returns 400 for nonnumeric %s values", async (field, value) => {
    const res = await post(JSON.stringify({ ...validBody, [field]: value }));

    expect(res.status).toBe(400);
    expect(mockCalculatePriceQuote).not.toHaveBeenCalled();
  });

  it("maps PriceQuoteValidationError to 400", async () => {
    mockCalculatePriceQuote.mockImplementation(() => {
      throw new MockPriceQuoteValidationError("Unknown job_ids: 999");
    });

    const res = await post(JSON.stringify(validBody));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Unknown job_ids: 999" });
  });

  it("propagates unexpected calculation errors", async () => {
    const unexpected = new Error("database unavailable");
    mockCalculatePriceQuote.mockImplementation(() => {
      throw unexpected;
    });
    const app = apiApp();
    app.onError((error) => {
      throw error;
    });

    await expect(
      app.request("/api/price-quotes/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validBody),
      }),
    ).rejects.toBe(unexpected);
  });
});
