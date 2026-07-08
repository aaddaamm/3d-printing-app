import { h } from "preact";
import htm from "htm";

import type { ProductSummary } from "../lib/api.js";
import { ProductSellability } from "./product-sellability.js";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

export const PRODUCT_STATUSES = [
  { id: "idea", label: "Idea" },
  { id: "downloaded_designed", label: "Downloaded / Designed" },
  { id: "test_print", label: "Test Print" },
  { id: "needs_tuning", label: "Needs Tuning" },
  { id: "ready_for_photos", label: "Ready for Photos" },
  { id: "listed", label: "Listed" },
  { id: "active", label: "Active" },
  { id: "selling_well", label: "Selling Well" },
  { id: "retired", label: "Retired" },
] as const;

export const PRODUCT_CATEGORIES = [
  { id: "gaming", label: "Gaming" },
  { id: "workshop", label: "Workshop" },
  { id: "home_organization", label: "Home Organization" },
  { id: "decor", label: "Decor" },
  { id: "personalized", label: "Personalized" },
  { id: "seasonal", label: "Seasonal" },
  { id: "custom_repair_parts", label: "Custom / Repair Parts" },
] as const;

export const PRODUCT_SOURCES = [
  { id: "hive", label: "Hive" },
  { id: "original", label: "Original" },
  { id: "printables", label: "Printables" },
  { id: "makerworld", label: "MakerWorld" },
  { id: "thangs", label: "Thangs" },
  { id: "stlflix", label: "STLFlix" },
  { id: "custom_commission", label: "Custom Commission" },
] as const;

export const PRODUCT_LICENSES = [
  { id: "commercial_allowed", label: "Commercial Allowed" },
  { id: "personal_use_only", label: "Personal Use Only" },
  { id: "attribution_required", label: "Attribution Required" },
  { id: "hive_community", label: "Hive Community" },
  { id: "hive_plus", label: "Hive Plus" },
  { id: "original_owned", label: "Original / Owned" },
  { id: "unknown_verify", label: "Unknown / Verify" },
] as const;

export const RESTOCK_PRIORITIES = [
  { id: "none", label: "No restock" },
  { id: "normal", label: "Normal" },
  { id: "high", label: "High" },
  { id: "urgent", label: "Urgent" },
] as const;

function formatPrice(price: number | null): string {
  if (price === null) return "No price";
  return `$${price.toFixed(2)}`;
}

function ProductPhoto({ product }: { product: ProductSummary }) {
  if (product.main_photo_path) {
    return html`<img
      class="product-card-photo"
      src=${product.main_photo_path}
      alt=""
      loading="lazy"
    />`;
  }
  return html`<div class="product-card-photo product-card-photo--empty" aria-hidden="true">▧</div>`;
}

export function ProductCard({
  product,
  onOpen,
  onStatusChange,
}: {
  product: ProductSummary;
  onOpen: (product: ProductSummary) => void;
  onStatusChange?: (product: ProductSummary, statusId: string) => void;
}) {
  const stop = (event: Event) => event.stopPropagation();

  return html`
    <article class="product-card" onClick=${() => onOpen(product)}>
      <${ProductPhoto} product=${product} />
      <div class="product-card-body">
        <div class="product-card-title-row">
          <h3 class="product-card-title">${product.name}</h3>
          <span class=${"product-priority product-priority--" + product.restock_priority}>
            ${product.restock_priority === "none" ? "" : product.restock_priority}
          </span>
        </div>
        <div class="product-card-meta">
          <span>${product.category_label || "Uncategorized"}</span>
          <span>${product.source_label || "No source"}</span>
        </div>
        <div class="product-card-badges">
          <${ProductSellability}
            level=${product.can_sell_level}
            label=${product.can_sell_label}
            readyToList=${product.ready_to_list}
          />
          <span class="product-license-badge">${product.license_label || "License unknown"}</span>
        </div>
        <div class="product-card-footer">
          <strong>${formatPrice(product.target_sale_price)}</strong>
          ${onStatusChange
            ? html`<label class="product-status-select" onClick=${stop}>
                <span>Status</span>
                <select
                  value=${product.status_id}
                  onChange=${(event: Event) => {
                    event.stopPropagation();
                    onStatusChange(product, (event.target as HTMLSelectElement).value);
                  }}
                >
                  ${PRODUCT_STATUSES.map(
                    (status) =>
                      html`<option key=${status.id} value=${status.id}>${status.label}</option>`,
                  )}
                </select>
              </label>`
            : html`<span class="product-status-pill">${product.status_label}</span>`}
        </div>
      </div>
    </article>
  `;
}
