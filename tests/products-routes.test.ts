import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCreateProduct,
  mockCreateProductFromJob,
  mockCreateProductFromProject,
  mockListProductPricingHistory,
  mockListProducts,
  mockListProductsToPrintNext,
  mockUpdateProduct,
  MockProductValidationError,
  MockSavedProductPricingValidationError,
} = vi.hoisted(() => {
  class ProductValidationError extends Error {}
  class SavedProductPricingValidationError extends Error {}
  return {
    mockCreateProduct: vi.fn(),
    mockCreateProductFromJob: vi.fn(),
    mockCreateProductFromProject: vi.fn(),
    mockListProductPricingHistory: vi.fn(),
    mockListProducts: vi.fn(),
    mockListProductsToPrintNext: vi.fn(),
    mockUpdateProduct: vi.fn(),
    MockProductValidationError: ProductValidationError,
    MockSavedProductPricingValidationError: SavedProductPricingValidationError,
  };
});

vi.mock("../models/products.js", () => ({
  ProductValidationError: MockProductValidationError,
  createProduct: mockCreateProduct,
  createProductFromJob: mockCreateProductFromJob,
  createProductFromProject: mockCreateProductFromProject,
  listProducts: mockListProducts,
  listProductsToPrintNext: mockListProductsToPrintNext,
  updateProduct: mockUpdateProduct,
}));

vi.mock("../models/saved-product-pricing.js", () => ({
  SavedProductPricingValidationError: MockSavedProductPricingValidationError,
  listProductPricingHistory: mockListProductPricingHistory,
}));

import { products } from "../routes/products.js";

const sampleProduct = {
  id: 1,
  name: "Controller Stand",
  designer: "PrintWorks",
  category_id: "gaming",
  category_label: "Gaming",
  status_id: "idea",
  status_label: "Idea",
  source_id: "printables",
  source_label: "Printables",
  license_id: "commercial_allowed",
  license_label: "Commercial Allowed",
  main_photo_path: null,
  target_sale_price: 20,
  restock_priority: "none",
  model_url: "https://example.com/controller-stand",
  etsy_listing_url: "https://etsy.com/listing/123",
  default_material: "PLA",
  primary_color: "#ffffff",
  accent_color: "#222222",
  preferred_printer_id: 3,
  estimated_print_time_s: 5400,
  estimated_filament_g: 42.5,
  booth_price: 12,
  etsy_price: 15.99,
  packaging_cost: 0.75,
  handling_minutes: 3,
  target_margin_pct: 0.5,
  pricing_notes: "Round to market-friendly prices.",
  notes: "Use a brim.",
  can_sell_level: "green",
  can_sell_label: "Commercial use allowed",
  ready_to_list: false,
};

const samplePricingHistory = [
  {
    batch_id: 11,
    created_at: "2026-07-25 12:00:00",
    sellable_units: 3,
    job_ids: [4, 9],
    notes: "Save this version",
    snapshots: {
      direct: {
        id: 21,
        batch_id: 11,
        channel: "direct",
        created_at: "2026-07-25 12:00:00",
        quote: {
          channel: "direct",
          assumptions: {
            labor_hourly_rate: 30,
            target_margin_pct: 0.45,
            platform_fee_pct: 0,
            fixed_fee_per_order: 0,
            failure_buffer_pct: 0.1,
            overhead_buffer_pct: 0.05,
            resolved_rates: [],
          },
          attempts: [],
          warnings: [],
          breakdown: { suggestedPrice: 12.5 },
        },
      },
      etsy: {
        id: 22,
        batch_id: 11,
        channel: "etsy",
        created_at: "2026-07-25 12:00:00",
        quote: {
          channel: "etsy",
          assumptions: {
            labor_hourly_rate: 30,
            target_margin_pct: 0.45,
            platform_fee_pct: 0.12,
            fixed_fee_per_order: 0.45,
            failure_buffer_pct: 0.1,
            overhead_buffer_pct: 0.05,
            resolved_rates: [],
          },
          attempts: [],
          warnings: [],
          breakdown: { suggestedPrice: 14.5 },
        },
      },
    },
  },
];

function apiApp(): Hono {
  const app = new Hono();
  app.route("/api/products", products);
  return app;
}

describe("product routes", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockListProducts.mockReturnValue([sampleProduct]);
    mockListProductsToPrintNext.mockReturnValue([{ ...sampleProduct, restock_priority: "high" }]);
    mockListProductPricingHistory.mockReturnValue(samplePricingHistory);
    mockCreateProduct.mockReturnValue(sampleProduct);
    mockCreateProductFromJob.mockReturnValue({ ...sampleProduct, name: "Dragon Egg" });
    mockCreateProductFromProject.mockReturnValue({ ...sampleProduct, name: "Cubee Dragons" });
    mockUpdateProduct.mockReturnValue({
      ...sampleProduct,
      status_id: "active",
      status_label: "Active",
    });
  });

  it("lists products under /api/products", async () => {
    const res = await apiApp().request("/api/products");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ products: [sampleProduct] });
  });

  it("gets a product by id with editable detail fields", async () => {
    const res = await apiApp().request("/api/products/1");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ product: sampleProduct });
  });

  it("lists products to print next", async () => {
    const res = await apiApp().request("/api/products/print-next");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      products: [{ ...sampleProduct, restock_priority: "high" }],
    });
  });

  it("creates a product from a source job", async () => {
    const res = await apiApp().request("/api/products/from-job/9", { method: "POST" });

    expect(res.status).toBe(201);
    expect(mockCreateProductFromJob).toHaveBeenCalledWith(9);
    expect(await res.json()).toEqual({ product: { ...sampleProduct, name: "Dragon Egg" } });
  });

  it("creates a product from a source project", async () => {
    const res = await apiApp().request("/api/products/from-project/4", { method: "POST" });

    expect(res.status).toBe(201);
    expect(mockCreateProductFromProject).toHaveBeenCalledWith(4);
    expect(await res.json()).toEqual({ product: { ...sampleProduct, name: "Cubee Dragons" } });
  });

  it("allows designer in mutable product input", async () => {
    const res = await apiApp().request("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Controller Stand", designer: "PrintWorks" }),
    });

    expect(res.status).toBe(201);
    expect(mockCreateProduct).toHaveBeenCalledWith({
      name: "Controller Stand",
      designer: "PrintWorks",
    });
  });

  it("returns pricing history for an existing product", async () => {
    const res = await apiApp().request("/api/products/1/pricing-history");

    expect(res.status).toBe(200);
    expect(mockListProductPricingHistory).toHaveBeenCalledWith(1);
    expect(await res.json()).toEqual({ history: samplePricingHistory });
  });

  it("returns 404 for pricing history when the product does not exist", async () => {
    mockListProducts.mockReturnValue([]);

    const res = await apiApp().request("/api/products/1/pricing-history");

    expect(res.status).toBe(404);
    expect(mockListProductPricingHistory).not.toHaveBeenCalled();
    expect(await res.json()).toEqual({ error: "Not found" });
  });

  it("returns 400 for invalid pricing history ids", async () => {
    const res = await apiApp().request("/api/products/not-a-number/pricing-history");

    expect(res.status).toBe(400);
    expect(mockListProductPricingHistory).not.toHaveBeenCalled();
    expect(await res.json()).toEqual({ error: "Invalid id" });
  });

  it("maps pricing history validation errors to 400", async () => {
    mockListProductPricingHistory.mockImplementation(() => {
      throw new MockSavedProductPricingValidationError("Saved pricing Batch 11 is incomplete");
    });

    const res = await apiApp().request("/api/products/1/pricing-history");

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Saved pricing Batch 11 is incomplete" });
  });

  it("rejects invalid status ids", async () => {
    mockCreateProduct.mockImplementation(() => {
      throw new MockProductValidationError("Unknown status_id: missing");
    });

    const res = await apiApp().request("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Bad", status_id: "missing" }),
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Unknown status_id: missing" });
  });

  it("rejects invalid license ids", async () => {
    mockUpdateProduct.mockImplementation(() => {
      throw new MockProductValidationError("Unknown license_id: missing");
    });

    const res = await apiApp().request("/api/products/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ license_id: "missing" }),
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Unknown license_id: missing" });
  });

  it("patches product status and pricing defaults", async () => {
    const res = await apiApp().request("/api/products/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status_id: "active", booth_price: 13, packaging_cost: 0.8 }),
    });

    expect(res.status).toBe(200);
    expect(mockUpdateProduct).toHaveBeenCalledWith(1, {
      status_id: "active",
      booth_price: 13,
      packaging_cost: 0.8,
    });
    expect(await res.json()).toEqual({
      product: { ...sampleProduct, status_id: "active", status_label: "Active" },
    });
  });
});
