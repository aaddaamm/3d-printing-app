import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCreateProduct,
  mockCreateProductFromJob,
  mockCreateProductFromProject,
  mockListProducts,
  mockListProductsToPrintNext,
  mockUpdateProduct,
  MockProductValidationError,
} = vi.hoisted(() => {
  class ProductValidationError extends Error {}
  return {
    mockCreateProduct: vi.fn(),
    mockCreateProductFromJob: vi.fn(),
    mockCreateProductFromProject: vi.fn(),
    mockListProducts: vi.fn(),
    mockListProductsToPrintNext: vi.fn(),
    mockUpdateProduct: vi.fn(),
    MockProductValidationError: ProductValidationError,
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

import { products } from "../routes/products.js";

const sampleProduct = {
  id: 1,
  name: "Controller Stand",
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
