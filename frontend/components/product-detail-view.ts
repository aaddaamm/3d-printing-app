import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import htm from "htm";

import { fetchProduct, updateProduct, type ProductInput, type ProductSummary } from "../lib/api.js";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_LICENSES,
  PRODUCT_SOURCES,
  PRODUCT_STATUSES,
  RESTOCK_PRIORITIES,
} from "./product-card.js";
import { ProductSellability } from "./product-sellability.js";
import { toast } from "./toast.js";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

type DetailFormState = {
  name: string;
  categoryId: string;
  statusId: string;
  sourceId: string;
  licenseId: string;
  targetSalePrice: string;
  restockPriority: string;
  modelUrl: string;
  etsyListingUrl: string;
  estimatedPrintTimeHours: string;
  estimatedFilamentG: string;
  notes: string;
};

function initialForm(product: ProductSummary): DetailFormState {
  return {
    name: product.name,
    categoryId: product.category_id ?? "",
    statusId: product.status_id,
    sourceId: product.source_id ?? "",
    licenseId: product.license_id ?? "",
    targetSalePrice: product.target_sale_price === null ? "" : String(product.target_sale_price),
    restockPriority: product.restock_priority,
    modelUrl: "",
    etsyListingUrl: "",
    estimatedPrintTimeHours: "",
    estimatedFilamentG: "",
    notes: "",
  };
}

function numberOrNull(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function secondsFromHours(value: string): number | null {
  const hours = numberOrNull(value);
  return hours === null ? null : Math.round(hours * 3600);
}

function optionList(
  items: readonly { id: string; label: string }[],
  includeEmptyLabel?: string,
): unknown[] {
  const options = includeEmptyLabel ? [html`<option value="">${includeEmptyLabel}</option>`] : [];
  return [
    ...options,
    ...items.map((item) => html`<option key=${item.id} value=${item.id}>${item.label}</option>`),
  ];
}

function DetailPhoto({ product }: { product: ProductSummary }) {
  if (product.main_photo_path) {
    return html`<img class="product-detail-photo" src=${product.main_photo_path} alt="" />`;
  }
  return html`<div class="product-detail-photo product-detail-photo--empty">No product photo</div>`;
}

function DetailFacts({ product }: { product: ProductSummary }) {
  return html`<div class="product-detail-facts">
    <div><span>Category</span><strong>${product.category_label || "Uncategorized"}</strong></div>
    <div><span>Status</span><strong>${product.status_label}</strong></div>
    <div><span>Source</span><strong>${product.source_label || "Not set"}</strong></div>
    <div><span>License</span><strong>${product.license_label || "Verify"}</strong></div>
    <div>
      <span>Price</span
      ><strong
        >${product.target_sale_price === null
          ? "—"
          : `$${product.target_sale_price.toFixed(2)}`}</strong
      >
    </div>
    <div><span>Restock</span><strong>${product.restock_priority}</strong></div>
  </div>`;
}

export function ProductDetailView({
  productId,
  navigate,
}: {
  productId: number;
  navigate: (path: string) => void;
}) {
  const [product, setProduct] = useState<ProductSummary | null>(null);
  const [form, setForm] = useState<DetailFormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchProduct(productId)
      .then((item) => {
        if (cancelled) return;
        setProduct(item);
        setForm(initialForm(item));
      })
      .catch((error: unknown) => {
        toast(error instanceof Error ? error.message : "Failed to load product.", "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const setField = (field: keyof DetailFormState, value: string) => {
    setForm((current) => (current ? { ...current, [field]: value } : current));
  };

  const save = async (event: Event) => {
    event.preventDefault();
    if (!form || !product) return;

    const payload: ProductInput = {
      name: form.name,
      category_id: form.categoryId || null,
      status_id: form.statusId,
      source_id: form.sourceId || null,
      license_id: form.licenseId || null,
      target_sale_price: numberOrNull(form.targetSalePrice),
      restock_priority: form.restockPriority,
    };

    if (form.modelUrl.trim()) payload.model_url = form.modelUrl.trim();
    if (form.etsyListingUrl.trim()) payload.etsy_listing_url = form.etsyListingUrl.trim();
    if (form.estimatedPrintTimeHours.trim()) {
      payload.estimated_print_time_s = secondsFromHours(form.estimatedPrintTimeHours);
    }
    if (form.estimatedFilamentG.trim()) {
      payload.estimated_filament_g = numberOrNull(form.estimatedFilamentG);
    }
    if (form.notes.trim()) payload.notes = form.notes.trim();

    setSaving(true);
    try {
      const updated = await updateProduct(product.id, payload);
      if (!updated) return;
      setProduct(updated);
      setForm(initialForm(updated));
      toast("Product updated.", "success");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return html`<div class="empty">Loading product…</div>`;
  if (!product || !form) return html`<div class="empty">Product not found.</div>`;

  return html`<main class="product-detail-page">
    <div class="product-detail-header">
      <button class="btn-back" onClick=${() => navigate("/products")}>← Products</button>
      <div>
        <p class="products-kicker">Product detail</p>
        <h2>${product.name}</h2>
      </div>
      <${ProductSellability}
        level=${product.can_sell_level}
        label=${product.can_sell_label}
        readyToList=${product.ready_to_list}
      />
    </div>

    <section class="product-detail-layout">
      <aside class="product-detail-card">
        <${DetailPhoto} product=${product} />
        <${DetailFacts} product=${product} />
        <div class=${"product-license-warning product-license-warning--" + product.can_sell_level}>
          ${product.can_sell_level === "red"
            ? "Do not list until commercial rights are verified."
            : product.can_sell_level === "yellow"
              ? "Listing may need attribution or additional notes."
              : "Commercial listing appears allowed."}
        </div>
      </aside>

      <form class="product-detail-form" onSubmit=${save}>
        <section class="admin-section">
          <h3 class="admin-section-title">Core fields</h3>
          <div class="product-form-grid">
            <label class="form-label">
              Name
              <input
                class="form-input"
                value=${form.name}
                onInput=${(event: Event) =>
                  setField("name", (event.target as HTMLInputElement).value)}
              />
            </label>
            <label class="form-label">
              Status
              <select
                class="form-input"
                value=${form.statusId}
                onChange=${(event: Event) =>
                  setField("statusId", (event.target as HTMLSelectElement).value)}
              >
                ${optionList(PRODUCT_STATUSES)}
              </select>
            </label>
            <label class="form-label">
              Category
              <select
                class="form-input"
                value=${form.categoryId}
                onChange=${(event: Event) =>
                  setField("categoryId", (event.target as HTMLSelectElement).value)}
              >
                ${optionList(PRODUCT_CATEGORIES, "Uncategorized")}
              </select>
            </label>
            <label class="form-label">
              Source
              <select
                class="form-input"
                value=${form.sourceId}
                onChange=${(event: Event) =>
                  setField("sourceId", (event.target as HTMLSelectElement).value)}
              >
                ${optionList(PRODUCT_SOURCES, "Source TBD")}
              </select>
            </label>
            <label class="form-label">
              License
              <select
                class="form-input"
                value=${form.licenseId}
                onChange=${(event: Event) =>
                  setField("licenseId", (event.target as HTMLSelectElement).value)}
              >
                ${optionList(PRODUCT_LICENSES, "Verify license")}
              </select>
            </label>
            <label class="form-label">
              Target price
              <input
                class="form-input"
                inputmode="decimal"
                placeholder="18.00"
                value=${form.targetSalePrice}
                onInput=${(event: Event) =>
                  setField("targetSalePrice", (event.target as HTMLInputElement).value)}
              />
            </label>
            <label class="form-label">
              Restock priority
              <select
                class="form-input"
                value=${form.restockPriority}
                onChange=${(event: Event) =>
                  setField("restockPriority", (event.target as HTMLSelectElement).value)}
              >
                ${optionList(RESTOCK_PRIORITIES)}
              </select>
            </label>
          </div>
        </section>

        <section class="admin-section">
          <h3 class="admin-section-title">Listing, files, and production notes</h3>
          <p class="admin-section-desc">
            Summary fields load from the product API today; optional fields below can be saved when
            adding model URLs, listing URLs, estimates, and notes.
          </p>
          <div class="product-form-grid">
            <label class="form-label">
              Model URL
              <input
                class="form-input"
                value=${form.modelUrl}
                placeholder="https://…"
                onInput=${(event: Event) =>
                  setField("modelUrl", (event.target as HTMLInputElement).value)}
              />
            </label>
            <label class="form-label">
              Etsy listing URL
              <input
                class="form-input"
                value=${form.etsyListingUrl}
                placeholder="https://…"
                onInput=${(event: Event) =>
                  setField("etsyListingUrl", (event.target as HTMLInputElement).value)}
              />
            </label>
            <label class="form-label">
              Estimated print time (hours)
              <input
                class="form-input"
                inputmode="decimal"
                value=${form.estimatedPrintTimeHours}
                placeholder="4.5"
                onInput=${(event: Event) =>
                  setField("estimatedPrintTimeHours", (event.target as HTMLInputElement).value)}
              />
            </label>
            <label class="form-label">
              Estimated filament (g)
              <input
                class="form-input"
                inputmode="decimal"
                value=${form.estimatedFilamentG}
                placeholder="120"
                onInput=${(event: Event) =>
                  setField("estimatedFilamentG", (event.target as HTMLInputElement).value)}
              />
            </label>
          </div>
          <label class="form-label product-notes-field">
            Notes
            <textarea
              class="form-input form-textarea"
              value=${form.notes}
              placeholder="Tuning notes, photo needs, listing copy reminders…"
              onInput=${(event: Event) =>
                setField("notes", (event.target as HTMLTextAreaElement).value)}
            ></textarea>
          </label>
        </section>

        <div class="form-actions">
          <button class="btn-secondary" type="button" onClick=${() => navigate("/products")}>
            Cancel
          </button>
          <button class="btn-primary" type="submit" disabled=${saving || !form.name.trim()}>
            ${saving ? "Saving…" : "Save Product"}
          </button>
        </div>
      </form>
    </section>
  </main>`;
}
