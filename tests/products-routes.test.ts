import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCreateManualProductPhoto,
  mockCreateProduct,
  mockCreateProductFromJob,
  mockCreateProductFromProject,
  mockEnsureGeneratedProductImageCandidates,
  mockListProductPricingHistory,
  mockListProducts,
  mockListProductsToPrintNext,
  mockListSalesCompanionProducts,
  mockRemoveAppOwnedProductImage,
  mockReturnProductImageToAuto,
  mockSelectProductImage,
  mockStoreUploadedProductImage,
  mockUpdateProduct,
  MockProductImageValidationError,
  MockProductValidationError,
  MockSavedProductPricingValidationError,
} = vi.hoisted(() => {
  class ProductValidationError extends Error {}
  class ProductImageValidationError extends ProductValidationError {}
  class SavedProductPricingValidationError extends Error {}
  return {
    mockCreateManualProductPhoto: vi.fn(),
    mockCreateProduct: vi.fn(),
    mockCreateProductFromJob: vi.fn(),
    mockCreateProductFromProject: vi.fn(),
    mockEnsureGeneratedProductImageCandidates: vi.fn(),
    mockListProductPricingHistory: vi.fn(),
    mockListProducts: vi.fn(),
    mockListProductsToPrintNext: vi.fn(),
    mockListSalesCompanionProducts: vi.fn(),
    mockRemoveAppOwnedProductImage: vi.fn(),
    mockReturnProductImageToAuto: vi.fn(),
    mockSelectProductImage: vi.fn(),
    mockStoreUploadedProductImage: vi.fn(),
    mockUpdateProduct: vi.fn(),
    MockProductImageValidationError: ProductImageValidationError,
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
  listSalesCompanionProducts: mockListSalesCompanionProducts,
  updateProduct: mockUpdateProduct,
}));

vi.mock("../models/saved-product-pricing.js", () => ({
  SavedProductPricingValidationError: MockSavedProductPricingValidationError,
  listProductPricingHistory: mockListProductPricingHistory,
}));

vi.mock("../models/product-images.js", () => ({
  ProductImageValidationError: MockProductImageValidationError,
  createManualProductPhoto: mockCreateManualProductPhoto,
  ensureGeneratedProductImageCandidates: mockEnsureGeneratedProductImageCandidates,
  returnProductImageToAuto: mockReturnProductImageToAuto,
  selectProductImage: mockSelectProductImage,
}));

vi.mock("../lib/product-image-files.js", () => ({
  removeAppOwnedProductImage: mockRemoveAppOwnedProductImage,
  storeUploadedProductImage: mockStoreUploadedProductImage,
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
  main_photo_id: null,
  main_photo_path: null,
  main_photo_source_type: null,
  image_selection_mode: "auto",
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
  sales_companion_visible: false,
  can_sell_level: "green",
  can_sell_label: "Commercial use allowed",
  ready_to_list: false,
};

const sampleCandidates = [
  {
    candidate_key: "catalog_preview:4:abc",
    source_type: "catalog_preview",
    photo_id: null,
    url: "/catalog/previews/abc.png",
    label: "Controller Stand preview",
    priority: 30,
    available: true,
    warning: null,
  },
  {
    candidate_key: "manual_upload:missing",
    source_type: "manual_upload",
    photo_id: 8,
    url: "/ui/product-photos/8",
    label: "Missing upload",
    priority: 10,
    available: false,
    warning: "The saved image file is unavailable.",
  },
];

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
    mockListSalesCompanionProducts.mockReturnValue([
      {
        id: 1,
        name: "Controller Stand",
        identification_image_url: null,
        unit_cost: 9.5,
        production_loss_cost: 1.25,
        direct_price: 29.99,
        direct_margin_pct: 0.5,
        etsy_price: 34.99,
        etsy_margin_pct: 0.55,
        priced_at: "2026-07-25 12:00:00",
      },
    ]);
    mockEnsureGeneratedProductImageCandidates.mockResolvedValue({
      candidates: sampleCandidates,
      warnings: [],
    });
    mockListProductPricingHistory.mockReturnValue(samplePricingHistory);
    mockCreateProduct.mockReturnValue(sampleProduct);
    mockCreateProductFromJob.mockReturnValue({ ...sampleProduct, name: "Dragon Egg" });
    mockCreateProductFromProject.mockReturnValue({ ...sampleProduct, name: "Cubee Dragons" });
    mockReturnProductImageToAuto.mockReturnValue(sampleProduct);
    mockStoreUploadedProductImage.mockResolvedValue({
      path: "/tmp/product-images/1/uploads/upload.webp",
      contentType: "image/webp",
      width: 640,
      height: 480,
      contentHash: "a".repeat(64),
    });
    mockCreateManualProductPhoto.mockReturnValue({
      product: {
        ...sampleProduct,
        main_photo_id: 14,
        main_photo_source_type: "manual_upload",
        image_selection_mode: "manual",
      },
      photo: {
        id: 14,
        product_id: 1,
        path: "/tmp/product-images/1/uploads/upload.webp",
        source_type: "manual_upload",
        source_ref: "a".repeat(64),
        candidate_key: `manual_upload:${"a".repeat(64)}`,
        content_type: "image/webp",
        width: 640,
        height: 480,
        is_app_owned: 1,
      },
    });
    mockSelectProductImage.mockReturnValue({
      ...sampleProduct,
      main_photo_id: 12,
      main_photo_source_type: "catalog_preview",
      image_selection_mode: "manual",
    });
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

  it("returns the minimal Sales Companion publication projection", async () => {
    const res = await apiApp().request("/api/products/sales-companion");

    expect(res.status).toBe(200);
    expect(mockListSalesCompanionProducts).toHaveBeenCalledOnce();
    const body = (await res.json()) as { products: Array<Record<string, unknown>> };
    expect(body.products).toEqual([
      {
        id: 1,
        name: "Controller Stand",
        identification_image_url: null,
        unit_cost: 9.5,
        production_loss_cost: 1.25,
        direct_price: 29.99,
        direct_margin_pct: 0.5,
        etsy_price: 34.99,
        etsy_margin_pct: 0.55,
        priced_at: "2026-07-25 12:00:00",
      },
    ]);
    expect(Object.keys(body.products[0] ?? {})).not.toEqual(
      expect.arrayContaining(["job_ids", "source_url", "notes", "provider", "rates"]),
    );
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

  it("lists ranked image candidates for an existing product", async () => {
    const res = await apiApp().request("/api/products/1/image-candidates");

    expect(res.status).toBe(200);
    expect(mockEnsureGeneratedProductImageCandidates).toHaveBeenCalledWith(1);
    expect(await res.json()).toEqual({ candidates: sampleCandidates, warnings: [] });
  });

  it("uploads, normalizes, and transactionally selects a Manual product photo", async () => {
    const form = new FormData();
    form.set("photo", new File(["image bytes"], "dragon.png", { type: "image/png" }));

    const res = await apiApp().request("/api/products/1/photos", {
      method: "POST",
      body: form,
    });

    expect(res.status).toBe(201);
    expect(mockStoreUploadedProductImage).toHaveBeenCalledWith(1, expect.any(Uint8Array));
    expect(mockCreateManualProductPhoto).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ contentType: "image/webp" }),
    );
    const body = (await res.json()) as { product: object; photo: Record<string, unknown> };
    expect(body).toEqual(
      expect.objectContaining({
        product: expect.objectContaining({ image_selection_mode: "manual" }),
        photo: expect.objectContaining({
          source_type: "manual_upload",
          is_app_owned: 1,
          url: "/ui/product-photos/14",
        }),
      }),
    );
    expect(body.photo).not.toHaveProperty("path");
  });

  it("rejects multipart uploads over the declared and actual size limits", async () => {
    const declared = await apiApp().request("/api/products/1/photos", {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data; boundary=unused",
        "Content-Length": String(12 * 1024 * 1024 + 1),
      },
      body: "",
    });
    expect(declared.status).toBe(413);

    const form = new FormData();
    form.set("photo", new File([new Uint8Array(10 * 1024 * 1024 + 1)], "large.png"));
    const actual = await apiApp().request("/api/products/1/photos", {
      method: "POST",
      body: form,
    });
    expect(actual.status).toBe(413);
    expect(mockStoreUploadedProductImage).not.toHaveBeenCalled();
  });

  it("requires a multipart File in the photo field", async () => {
    const form = new FormData();
    form.set("photo", "not a file");

    const res = await apiApp().request("/api/products/1/photos", {
      method: "POST",
      body: form,
    });

    expect(res.status).toBe(400);
    expect(mockStoreUploadedProductImage).not.toHaveBeenCalled();
  });

  it("removes only the stored owned upload when the database transaction fails", async () => {
    mockCreateManualProductPhoto.mockImplementation(() => {
      throw new Error("database failed");
    });
    const form = new FormData();
    form.set("photo", new File(["image bytes"], "dragon.png", { type: "image/png" }));

    const res = await apiApp().request("/api/products/1/photos", {
      method: "POST",
      body: form,
    });

    expect(res.status).toBe(500);
    expect(mockRemoveAppOwnedProductImage).toHaveBeenCalledWith(
      "/tmp/product-images/1/uploads/upload.webp",
    );
  });

  it("maps invalid uploaded image bytes to 400 without database cleanup", async () => {
    mockStoreUploadedProductImage.mockRejectedValue(new Error("Invalid image"));
    const form = new FormData();
    form.set("photo", new File(["bad"], "bad.png", { type: "image/png" }));

    const res = await apiApp().request("/api/products/1/photos", {
      method: "POST",
      body: form,
    });

    expect(res.status).toBe(400);
    expect(mockCreateManualProductPhoto).not.toHaveBeenCalled();
    expect(mockRemoveAppOwnedProductImage).not.toHaveBeenCalled();
  });

  it("selects Manual candidates and returns the Product", async () => {
    const res = await apiApp().request("/api/products/1/image-selection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "manual", candidate_key: "catalog_preview:4:abc" }),
    });

    expect(res.status).toBe(200);
    expect(mockSelectProductImage).toHaveBeenCalledWith(1, "catalog_preview:4:abc");
    expect((await res.json()) as object).toEqual({
      product: expect.objectContaining({ image_selection_mode: "manual" }),
    });
  });

  it("returns image selection to Auto mode", async () => {
    const res = await apiApp().request("/api/products/1/image-selection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "auto" }),
    });

    expect(res.status).toBe(200);
    expect(mockReturnProductImageToAuto).toHaveBeenCalledWith(1);
    expect(mockSelectProductImage).not.toHaveBeenCalled();
  });

  it.each([
    { mode: "auto", candidate_key: "catalog_preview:4:abc" },
    { mode: "manual" },
    { mode: "manual", candidate_key: "catalog_preview:4:abc", extra: true },
    { mode: "automatic" },
    { mode: 1 },
  ])("rejects non-strict image selection bodies: %o", async (body) => {
    const res = await apiApp().request("/api/products/1/image-selection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    expect(res.status).toBe(400);
    expect(mockReturnProductImageToAuto).not.toHaveBeenCalled();
    expect(mockSelectProductImage).not.toHaveBeenCalled();
  });

  it("rejects unavailable image candidates", async () => {
    mockSelectProductImage.mockImplementation(() => {
      throw new MockProductImageValidationError(
        "Image candidate is unavailable: manual_upload:missing",
      );
    });
    const res = await apiApp().request("/api/products/1/image-selection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "manual", candidate_key: "manual_upload:missing" }),
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "Image candidate is unavailable: manual_upload:missing",
    });
  });

  it("returns 404 for image routes when the product does not exist", async () => {
    mockListProducts.mockReturnValue([]);

    const listRes = await apiApp().request("/api/products/99/image-candidates");
    const uploadForm = new FormData();
    uploadForm.set("photo", new File(["bytes"], "photo.png"));
    const uploadRes = await apiApp().request("/api/products/99/photos", {
      method: "POST",
      body: uploadForm,
    });
    const selectRes = await apiApp().request("/api/products/99/image-selection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "auto" }),
    });

    expect(listRes.status).toBe(404);
    expect(uploadRes.status).toBe(404);
    expect(selectRes.status).toBe(404);
    expect(mockEnsureGeneratedProductImageCandidates).not.toHaveBeenCalled();
    expect(mockReturnProductImageToAuto).not.toHaveBeenCalled();
  });

  it("rejects generic cross-Product main photo selection", async () => {
    const createRes = await apiApp().request("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Other Product", main_photo_id: 12 }),
    });
    const patchRes = await apiApp().request("/api/products/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ main_photo_id: 12 }),
    });

    expect(createRes.status).toBe(400);
    expect(await createRes.json()).toEqual({ error: "Unknown fields: main_photo_id" });
    expect(patchRes.status).toBe(400);
    expect(await patchRes.json()).toEqual({ error: "Unknown fields: main_photo_id" });
    expect(mockCreateProduct).not.toHaveBeenCalled();
    expect(mockUpdateProduct).not.toHaveBeenCalled();
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

  it("allows explicit Sales Companion visibility updates", async () => {
    mockUpdateProduct.mockReturnValue({ ...sampleProduct, sales_companion_visible: true });

    const res = await apiApp().request("/api/products/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sales_companion_visible: true }),
    });

    expect(res.status).toBe(200);
    expect(mockUpdateProduct).toHaveBeenCalledWith(1, { sales_companion_visible: true });
  });

  it("rejects invalid Sales Companion visibility values", async () => {
    mockUpdateProduct.mockImplementation(() => {
      throw new MockProductValidationError("sales_companion_visible must be a boolean");
    });

    const res = await apiApp().request("/api/products/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sales_companion_visible: "yes" }),
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "sales_companion_visible must be a boolean" });
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
