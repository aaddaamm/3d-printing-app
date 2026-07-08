import { expect, it } from "vitest";
import { initialProductDetailForm } from "../frontend/components/product-detail-view.js";
import { sellabilityBadgeClass } from "../frontend/components/product-sellability.js";
import { groupProductsByStatus } from "../frontend/components/products-view.js";
import type { ProductSummary } from "../frontend/lib/api.js";

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
    notes: null,
    can_sell_level: "red",
    can_sell_label: "Verify license",
    ready_to_list: false,
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
    notes: "Use a brim.",
  });
});

it("maps sellability levels to badge classes", () => {
  expect(sellabilityBadgeClass("green")).toContain("product-sellability--green");
  expect(sellabilityBadgeClass("yellow")).toContain("product-sellability--yellow");
  expect(sellabilityBadgeClass("red")).toContain("product-sellability--red");
  expect(sellabilityBadgeClass(null)).toContain("product-sellability--red");
});
