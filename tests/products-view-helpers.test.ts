import { expect, it } from "vitest";
import {
  batchMarginClass,
  formatBatchMargin,
  formatBatchMoney,
} from "../frontend/components/batch-price-breakdown.js";
import { initialBatchDetailForm } from "../frontend/components/batch-detail-view.js";
import {
  applyProductReconciliation,
  beginProductDetailRequest,
  beginProductReconciliationMount,
  beginProductReconciliationRequest,
  initialProductDetailForm,
  initialProductDetailRequestState,
  initialProductReconciliationState,
  invalidateProductReconciliation,
  isCurrentProductReconciliation,
  mergeProductFormResponse,
  mergeProductImageResponse,
  rejectProductDetailRequest,
  resolveProductDetailRequest,
} from "../frontend/components/product-detail-view.js";
import { productImageModeHint } from "../frontend/components/product-card.js";
import { sellabilityBadgeClass } from "../frontend/components/product-sellability.js";
import { groupProductsByStatus } from "../frontend/components/products-view.js";
import type { BatchSummary, ProductSummary } from "../frontend/lib/api.js";

function product(overrides: Partial<ProductSummary>): ProductSummary {
  return {
    id: 1,
    name: "Test Product",
    designer: null,
    category_id: null,
    category_label: null,
    status_id: "idea",
    status_label: "Idea",
    source_id: null,
    source_label: null,
    license_id: "unknown_verify",
    license_label: "Unknown / Verify",
    main_photo_id: null,
    main_photo_path: null,
    main_photo_source_type: null,
    image_selection_mode: "auto",
    target_sale_price: null,
    restock_priority: "none",
    model_url: null,
    etsy_listing_url: null,
    default_material: null,
    primary_color: null,
    accent_color: null,
    preferred_printer_id: null,
    estimated_print_time_s: null,
    estimated_filament_g: null,
    booth_price: null,
    etsy_price: null,
    packaging_cost: null,
    handling_minutes: null,
    target_margin_pct: null,
    pricing_notes: null,
    notes: null,
    can_sell_level: "red",
    can_sell_label: "Verify license",
    ready_to_list: false,
    ...overrides,
    sales_companion_visible: overrides.sales_companion_visible ?? false,
  };
}

function batch(overrides: Partial<BatchSummary>): BatchSummary {
  return {
    id: 1,
    product_id: 2,
    product_name: "Controller Stand",
    pricing_profile_id: "booth",
    pricing_profile_label: "Booth",
    planned_quantity: 10,
    completed_quantity: 8,
    failed_quantity: 1,
    material_type: "PLA",
    primary_color: "White",
    total_filament_g: 120,
    total_print_time_s: 7200,
    setup_minutes: 10,
    handling_minutes_per_unit: 3,
    packaging_cost_per_unit: 0.75,
    unit_cost: 2.5,
    suggested_price: 5.99,
    estimated_margin_pct: 0.5,
    fixed_fee_per_order: 0,
    notes: "Booth restock",
    ...overrides,
  };
}

it("groups product cards into known status columns", () => {
  const columns = groupProductsByStatus([
    product({ id: 1, status_id: "active", status_label: "Active" }),
    product({ id: 2, status_id: "idea", status_label: "Idea" }),
    product({ id: 3, status_id: "active", status_label: "Active" }),
  ]);

  expect(
    columns.find((column) => column.statusId === "idea")?.products.map((item) => item.id),
  ).toEqual([2]);
  expect(
    columns.find((column) => column.statusId === "active")?.products.map((item) => item.id),
  ).toEqual([1, 3]);
});

it("clears Product detail state on an id change and rejects stale responses", () => {
  const firstProduct = product({ id: 1, name: "Product A" });
  const secondProduct = product({ id: 2, name: "Product B" });
  const first = beginProductDetailRequest(initialProductDetailRequestState(), firstProduct.id);
  const withFirstProduct = resolveProductDetailRequest(
    first.state,
    first.requestGeneration,
    firstProduct,
  );

  const second = beginProductDetailRequest(withFirstProduct, secondProduct.id);
  const afterStaleFirst = resolveProductDetailRequest(
    second.state,
    first.requestGeneration,
    firstProduct,
  );
  const afterSecondFailure = rejectProductDetailRequest(
    afterStaleFirst,
    second.requestGeneration,
    "Failed to load Product B.",
  );

  expect(second.state).toMatchObject({
    productId: 2,
    product: null,
    form: null,
    loading: true,
    error: null,
  });
  expect(afterStaleFirst).toBe(second.state);
  expect(afterSecondFailure).toMatchObject({
    productId: 2,
    product: null,
    form: null,
    loading: false,
    error: "Failed to load Product B.",
  });
});

it("accepts only the latest same-Product reconciliation generation", () => {
  const mounted = beginProductReconciliationMount(initialProductReconciliationState(), 4);
  const first = beginProductReconciliationRequest(mounted.state, 4);
  const second = beginProductReconciliationRequest(first.state, 4);

  expect(isCurrentProductReconciliation(second.state, first.requestGeneration, 4)).toBe(false);
  expect(isCurrentProductReconciliation(second.state, second.requestGeneration, 4)).toBe(true);
  expect(isCurrentProductReconciliation(second.state, second.requestGeneration, 5)).toBe(false);

  const nextProduct = beginProductReconciliationMount(second.state, 5);
  expect(isCurrentProductReconciliation(nextProduct.state, second.requestGeneration, 4)).toBe(
    false,
  );
  expect(
    isCurrentProductReconciliation(
      invalidateProductReconciliation(nextProduct.state),
      nextProduct.state.generation,
      5,
    ),
  ).toBe(false);
});

it("merges form and image responses without either stale summary overwriting the other", () => {
  const original = product({
    id: 4,
    name: "Original name",
    main_photo_id: 10,
    main_photo_path: "/old.webp",
    main_photo_source_type: "print_cover",
    image_selection_mode: "auto",
    ready_to_list: false,
  });
  const formResponse = product({
    id: 4,
    name: "Saved name",
    notes: "Saved notes",
    main_photo_id: 10,
    main_photo_path: "/old.webp",
    main_photo_source_type: "print_cover",
    image_selection_mode: "auto",
    ready_to_list: true,
  });
  const imageResponse = product({
    id: 4,
    name: "Original name",
    notes: null,
    main_photo_id: 22,
    main_photo_path: "/manual.webp",
    main_photo_source_type: "manual_upload",
    image_selection_mode: "manual",
    ready_to_list: true,
  });
  const authoritative = product({
    id: 4,
    name: "Saved name",
    notes: "Saved notes",
    main_photo_id: 22,
    main_photo_path: "/manual.webp",
    main_photo_source_type: "manual_upload",
    image_selection_mode: "manual",
    can_sell_level: "green",
    can_sell_label: "Ready to sell",
    ready_to_list: true,
  });

  const formThenImage = mergeProductImageResponse(
    mergeProductFormResponse(original, formResponse),
    imageResponse,
  );
  const imageThenForm = mergeProductFormResponse(
    mergeProductImageResponse(original, imageResponse),
    formResponse,
  );

  for (const merged of [formThenImage, imageThenForm]) {
    expect(merged).toMatchObject({
      id: 4,
      name: "Saved name",
      notes: "Saved notes",
      main_photo_id: 22,
      main_photo_path: "/manual.webp",
      main_photo_source_type: "manual_upload",
      image_selection_mode: "manual",
      ready_to_list: false,
    });
    expect(applyProductReconciliation(merged, authoritative)).toEqual(authoritative);
  }
});

it("ignores Product response merges for a different current Product", () => {
  const current = product({ id: 4, name: "Current" });
  const other = product({ id: 5, name: "Other", image_selection_mode: "manual" });

  expect(mergeProductImageResponse(current, other)).toBe(current);
  expect(mergeProductFormResponse(current, other)).toBe(current);
  expect(applyProductReconciliation(current, other)).toBe(current);
  expect(mergeProductImageResponse(null, other)).toBeNull();
  expect(mergeProductFormResponse(null, other)).toBeNull();
});

it("initializes product detail form from editable API fields", () => {
  expect(
    initialProductDetailForm(
      product({
        model_url: "https://example.com/model",
        etsy_listing_url: "https://etsy.com/listing/123",
        default_material: "PLA",
        primary_color: "#ffffff",
        accent_color: "#222222",
        preferred_printer_id: 3,
        estimated_print_time_s: 5400,
        estimated_filament_g: 42.5,
        booth_price: 12,
        etsy_price: 14.99,
        packaging_cost: 0.75,
        handling_minutes: 3,
        target_margin_pct: 0.5,
        pricing_notes: "Round Etsy to .99.",
        notes: "Use a brim.",
      }),
    ),
  ).toMatchObject({
    modelUrl: "https://example.com/model",
    etsyListingUrl: "https://etsy.com/listing/123",
    defaultMaterial: "PLA",
    primaryColor: "#ffffff",
    accentColor: "#222222",
    preferredPrinterId: "3",
    estimatedPrintTimeHours: "1.5",
    estimatedFilamentG: "42.5",
    boothPrice: "12",
    etsyPrice: "14.99",
    packagingCost: "0.75",
    handlingMinutes: "3",
    targetMarginPct: "0.5",
    pricingNotes: "Round Etsy to .99.",
    notes: "Use a brim.",
  });
});

it("initializes batch detail form from editable API fields", () => {
  expect(initialBatchDetailForm(batch({}))).toMatchObject({
    productId: "2",
    pricingProfileId: "booth",
    plannedQuantity: "10",
    completedQuantity: "8",
    failedQuantity: "1",
    materialType: "PLA",
    primaryColor: "White",
    totalFilamentG: "120",
    totalPrintTimeHours: "2",
    setupMinutes: "10",
    handlingMinutesPerUnit: "3",
    packagingCostPerUnit: "0.75",
    notes: "Booth restock",
  });
});

it("formats batch pricing helper values", () => {
  expect(formatBatchMoney(5.995)).toBe("$6.00");
  expect(formatBatchMargin(0.5)).toBe("50%");
  expect(batchMarginClass(0.5)).toContain("batch-margin--good");
  expect(batchMarginClass(null)).toContain("batch-margin--unknown");
});

it("provides compact Product card image provenance hints", () => {
  expect(productImageModeHint("auto")).toBe("Auto image");
  expect(productImageModeHint("manual")).toBe("Manual image");
});

it("maps sellability levels to badge classes", () => {
  expect(sellabilityBadgeClass("green")).toContain("product-sellability--green");
  expect(sellabilityBadgeClass("yellow")).toContain("product-sellability--yellow");
  expect(sellabilityBadgeClass("red")).toContain("product-sellability--red");
  expect(sellabilityBadgeClass(null)).toContain("product-sellability--red");
});
