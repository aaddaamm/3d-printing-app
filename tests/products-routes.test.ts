import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCreateProduct,
  mockListProducts,
  mockListProductsToPrintNext,
  mockUpdateProduct,
  MockProductValidationError,
} = vi.hoisted(() => {
  class ProductValidationError extends Error {}
  return {
    mockCreateProduct: vi.fn(),
    mockListProducts: vi.fn(),
    mockListProductsToPrintNext: vi.fn(),
    mockUpdateProduct: vi.fn(),
    MockProductValidationError: ProductValidationError,
  };
});

vi.mock("../models/products.js", () => ({
  ProductValidationError: MockProductValidationError,
  createProduct: mockCreateProduct,
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

  it("patches product status", async () => {
    const res = await apiApp().request("/api/products/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status_id: "active" }),
    });

    expect(res.status).toBe(200);
    expect(mockUpdateProduct).toHaveBeenCalledWith(1, { status_id: "active" });
    expect(await res.json()).toEqual({
      product: { ...sampleProduct, status_id: "active", status_label: "Active" },
    });
  });
});
