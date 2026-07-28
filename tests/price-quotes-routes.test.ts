import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCalculatePriceQuote,
  mockSaveProductPricing,
  MockPriceQuoteValidationError,
  MockSavedProductPricingValidationError,
} = vi.hoisted(() => {
  class PriceQuoteValidationError extends Error {}
  class SavedProductPricingValidationError extends Error {}
  return {
    mockCalculatePriceQuote: vi.fn(),
    mockSaveProductPricing: vi.fn(),
    MockPriceQuoteValidationError: PriceQuoteValidationError,
    MockSavedProductPricingValidationError: SavedProductPricingValidationError,
  };
});

vi.mock("../models/price-quotes.js", () => ({
  calculatePriceQuote: mockCalculatePriceQuote,
  PriceQuoteValidationError: MockPriceQuoteValidationError,
}));

vi.mock("../models/saved-product-pricing.js", () => ({
  saveProductPricing: mockSaveProductPricing,
  SavedProductPricingValidationError: MockSavedProductPricingValidationError,
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

const validSaveBody = {
  job_ids: [4, 9],
  sellable_units: 3,
  batch_labor_minutes: 12,
  per_unit_labor_minutes: 2.5,
  packaging_cost_per_unit: 0.75,
  extra_cost: 1.25,
  target_margin_pct: 0.45,
  product_id: 7,
  notes: "Save this version",
};

const sampleQuote = {
  channel: "etsy",
  assumptions: {
    labor_hourly_rate: 30,
    target_margin_pct: 0.45,
    platform_fee_pct: 0.12,
    fixed_fee_per_order: 0.45,
    failure_buffer_pct: 0.1,
    overhead_buffer_pct: 0.05,
    material_contributions: [
      {
        job_id: 4,
        task_id: "task-4",
        filament_row_id: 12,
        ams_id: 0,
        slot_id: 1,
        recorded_material_type: "PLA",
        resolved_material_type: "PLA",
        weight_g: 25,
        material_rate_per_kg: 20,
        material_cost: 0.5,
        used_material_fallback: false,
      },
    ],
    machine_contributions: [
      {
        job_id: 4,
        task_id: "task-4",
        duration_seconds: 3600,
        printer: "P1S",
        machine_rate_per_hr: 2,
        machine_cost: 2,
        used_machine_fallback: false,
      },
    ],
  },
  attempts: [],
  warnings: [],
  breakdown: { suggestedPrice: 12.5 },
};

const sampleSavedPricing = {
  product: {
    id: 7,
    name: "Controller Stand",
    designer: "PrintWorks",
    category_id: null,
    category_label: null,
    status_id: "idea",
    status_label: "Idea",
    source_id: null,
    source_label: null,
    license_id: null,
    license_label: null,
    main_photo_path: null,
    target_sale_price: 12.5,
    restock_priority: "none",
    model_url: null,
    etsy_listing_url: null,
    default_material: null,
    primary_color: null,
    accent_color: null,
    preferred_printer_id: null,
    estimated_print_time_s: null,
    estimated_filament_g: null,
    booth_price: 12.5,
    etsy_price: 14.5,
    packaging_cost: null,
    handling_minutes: null,
    target_margin_pct: null,
    pricing_notes: null,
    notes: null,
    can_sell_level: "green",
    can_sell_label: "Ready",
    ready_to_list: false,
  },
  batch_id: 11,
  snapshots: {
    direct: {
      id: 21,
      batch_id: 11,
      channel: "direct",
      created_at: "2026-07-25 12:00:00",
      quote: { ...sampleQuote, channel: "direct" },
    },
    etsy: {
      id: 22,
      batch_id: 11,
      channel: "etsy",
      created_at: "2026-07-25 12:00:00",
      quote: sampleQuote,
    },
  },
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

async function postSave(body: string): Promise<Response> {
  return apiApp().request("/api/price-quotes/save-to-product", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

describe("price quote routes", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockCalculatePriceQuote.mockReturnValue(sampleQuote);
    mockSaveProductPricing.mockReturnValue(sampleSavedPricing);
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

  it("saves valid product pricing and returns the saved payload", async () => {
    const res = await postSave(JSON.stringify(validSaveBody));

    expect(res.status).toBe(201);
    expect(mockSaveProductPricing).toHaveBeenCalledWith(validSaveBody);
    expect(await res.json()).toEqual({ saved: sampleSavedPricing, image_warnings: [] });
  });

  it("returns 400 for invalid save JSON", async () => {
    const res = await postSave("{");

    expect(res.status).toBe(400);
    expect(mockSaveProductPricing).not.toHaveBeenCalled();
  });

  it("returns 400 for unknown save fields", async () => {
    const res = await postSave(JSON.stringify({ ...validSaveBody, channel: "etsy" }));

    expect(res.status).toBe(400);
    expect(mockSaveProductPricing).not.toHaveBeenCalled();
  });

  it("returns 400 for empty save job_ids", async () => {
    const res = await postSave(JSON.stringify({ ...validSaveBody, job_ids: [] }));

    expect(res.status).toBe(400);
    expect(mockSaveProductPricing).not.toHaveBeenCalled();
  });

  it.each([
    ["sellable_units", "3"],
    ["batch_labor_minutes", "12"],
    ["per_unit_labor_minutes", "2.5"],
    ["packaging_cost_per_unit", "0.75"],
    ["extra_cost", "1.25"],
    ["target_margin_pct", "0.45"],
    ["product_id", "7"],
  ])("returns 400 for invalid save %s values", async (field, value) => {
    const res = await postSave(JSON.stringify({ ...validSaveBody, [field]: value }));

    expect(res.status).toBe(400);
    expect(mockSaveProductPricing).not.toHaveBeenCalled();
  });

  it("returns 400 when both product selectors are provided", async () => {
    const res = await postSave(
      JSON.stringify({
        ...validSaveBody,
        new_product: { name: "Controller Stand", designer: "PrintWorks" },
      }),
    );

    expect(res.status).toBe(400);
    expect(mockSaveProductPricing).not.toHaveBeenCalled();
  });

  it("returns 400 when neither product selector is provided", async () => {
    const body = { ...validSaveBody };
    delete (body as Partial<typeof validSaveBody>).product_id;

    const res = await postSave(JSON.stringify(body));

    expect(res.status).toBe(400);
    expect(mockSaveProductPricing).not.toHaveBeenCalled();
  });

  it("maps SavedProductPricingValidationError to 400", async () => {
    mockSaveProductPricing.mockImplementation(() => {
      throw new MockSavedProductPricingValidationError("Unknown product_id: 999");
    });

    const res = await postSave(JSON.stringify(validSaveBody));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Unknown product_id: 999" });
  });
});
