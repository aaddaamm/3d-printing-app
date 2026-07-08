import { expect, it } from "vitest";
import {
  batchMarginClass,
  formatBatchMargin,
  formatBatchMoney,
} from "../frontend/components/batch-price-breakdown.js";
import { initialBatchDetailForm } from "../frontend/components/batch-detail-view.js";
import { initialProductDetailForm } from "../frontend/components/product-detail-view.js";
import { sellabilityBadgeClass } from "../frontend/components/product-sellability.js";
import { groupProductsByStatus } from "../frontend/components/products-view.js";
import type { BatchSummary, ProductSummary } from "../frontend/lib/api.js";

function product(overrides: Partial<ProductSummary>): ProductSummary {
  return {
    id: 1,
    name: "Test Product",
    category_id: null,
    category_label: null,
    status_id: "idea",
    status_label: "Idea",
    source_id: null,
    source_label: null,
    license_id: "unknown_verify",
    license_label: "Unknown / Verify",
    main_photo_path: null,
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

it("maps sellability levels to badge classes", () => {
  expect(sellabilityBadgeClass("green")).toContain("product-sellability--green");
  expect(sellabilityBadgeClass("yellow")).toContain("product-sellability--yellow");
  expect(sellabilityBadgeClass("red")).toContain("product-sellability--red");
  expect(sellabilityBadgeClass(null)).toContain("product-sellability--red");
});
