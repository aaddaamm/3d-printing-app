import { h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import htm from "htm";

import { fetchProduct, updateProduct, type ProductInput, type ProductSummary } from "../lib/api.js";
import { numberOrNull, positiveIntegerOrNull, secondsFromHours } from "../lib/form-values.js";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_LICENSES,
  PRODUCT_SOURCES,
  PRODUCT_STATUSES,
  RESTOCK_PRIORITIES,
} from "./product-card.js";
import { ProductImagePanel } from "./product-image-panel.js";
import { ProductPricingHistory } from "./product-pricing-history.js";
import { ProductSellability } from "./product-sellability.js";
import { toast } from "./toast.js";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

export type DetailFormState = {
  name: string;
  categoryId: string;
  statusId: string;
  sourceId: string;
  licenseId: string;
  targetSalePrice: string;
  restockPriority: string;
  modelUrl: string;
  etsyListingUrl: string;
  defaultMaterial: string;
  primaryColor: string;
  accentColor: string;
  preferredPrinterId: string;
  estimatedPrintTimeHours: string;
  estimatedFilamentG: string;
  boothPrice: string;
  etsyPrice: string;
  packagingCost: string;
  handlingMinutes: string;
  targetMarginPct: string;
  pricingNotes: string;
  notes: string;
  salesCompanionVisible: boolean;
};

function hoursFromSeconds(value: number | null): string {
  return value === null ? "" : String(value / 3600);
}

export type ProductDetailRequestState = {
  generation: number;
  activeGeneration: number | null;
  productId: number | null;
  loading: boolean;
  product: ProductSummary | null;
  form: DetailFormState | null;
  error: string | null;
};

export function initialProductDetailRequestState(): ProductDetailRequestState {
  return {
    generation: 0,
    activeGeneration: null,
    productId: null,
    loading: true,
    product: null,
    form: null,
    error: null,
  };
}

export function beginProductDetailRequest(
  state: ProductDetailRequestState,
  productId: number,
): { state: ProductDetailRequestState; requestGeneration: number } {
  const requestGeneration = state.generation + 1;
  return {
    requestGeneration,
    state: {
      generation: requestGeneration,
      activeGeneration: requestGeneration,
      productId,
      loading: true,
      product: null,
      form: null,
      error: null,
    },
  };
}

export function isCurrentProductDetailRequest(
  state: ProductDetailRequestState,
  requestGeneration: number,
): boolean {
  return state.generation === requestGeneration && state.activeGeneration === requestGeneration;
}

export function resolveProductDetailRequest(
  state: ProductDetailRequestState,
  requestGeneration: number,
  product: ProductSummary,
): ProductDetailRequestState {
  if (!isCurrentProductDetailRequest(state, requestGeneration)) return state;
  return {
    ...state,
    activeGeneration: null,
    loading: false,
    product,
    form: initialProductDetailForm(product),
    error: null,
  };
}

export function rejectProductDetailRequest(
  state: ProductDetailRequestState,
  requestGeneration: number,
  error: string,
): ProductDetailRequestState {
  if (!isCurrentProductDetailRequest(state, requestGeneration)) return state;
  return {
    ...state,
    activeGeneration: null,
    loading: false,
    product: null,
    form: null,
    error,
  };
}

export type ProductReconciliationState = {
  mountGeneration: number;
  generation: number;
  productId: number | null;
  active: boolean;
};

export function initialProductReconciliationState(): ProductReconciliationState {
  return { mountGeneration: 0, generation: 0, productId: null, active: false };
}

export function beginProductReconciliationMount(
  state: ProductReconciliationState,
  productId: number,
): { state: ProductReconciliationState; mountGeneration: number } {
  const mountGeneration = state.mountGeneration + 1;
  return {
    mountGeneration,
    state: {
      ...state,
      mountGeneration,
      generation: state.generation + 1,
      productId,
      active: true,
    },
  };
}

export function beginProductReconciliationRequest(
  state: ProductReconciliationState,
  productId: number,
): { state: ProductReconciliationState; requestGeneration: number } {
  if (!state.active || state.productId !== productId) {
    throw new Error("Cannot reconcile an inactive Product detail.");
  }
  const requestGeneration = state.generation + 1;
  return {
    requestGeneration,
    state: { ...state, generation: requestGeneration },
  };
}

export function isCurrentProductReconciliation(
  state: ProductReconciliationState,
  requestGeneration: number,
  productId: number,
): boolean {
  return state.active && state.productId === productId && state.generation === requestGeneration;
}

export function invalidateProductReconciliation(
  state: ProductReconciliationState,
): ProductReconciliationState {
  return { ...state, active: false };
}

export function applyProductReconciliation(
  current: ProductSummary | null,
  authoritative: ProductSummary,
): ProductSummary | null {
  return current?.id === authoritative.id ? authoritative : current;
}

export function mergeProductImageResponse(
  current: ProductSummary | null,
  response: ProductSummary,
): ProductSummary | null {
  if (!current || current.id !== response.id) return current;
  return {
    ...current,
    main_photo_id: response.main_photo_id,
    main_photo_path: response.main_photo_path,
    main_photo_source_type: response.main_photo_source_type,
    image_selection_mode: response.image_selection_mode,
  };
}

export function mergeProductFormResponse(
  current: ProductSummary | null,
  response: ProductSummary,
): ProductSummary | null {
  if (!current || current.id !== response.id) return current;
  return {
    ...response,
    category_label: current.category_label,
    status_label: current.status_label,
    source_label: current.source_label,
    license_label: current.license_label,
    can_sell_level: current.can_sell_level,
    can_sell_label: current.can_sell_label,
    ready_to_list: current.ready_to_list,
    ...(current.model_url === response.model_url
      ? {
          main_photo_id: current.main_photo_id,
          main_photo_path: current.main_photo_path,
          main_photo_source_type: current.main_photo_source_type,
          image_selection_mode: current.image_selection_mode,
        }
      : {}),
  };
}

export function initialProductDetailForm(product: ProductSummary): DetailFormState {
  return {
    name: product.name,
    categoryId: product.category_id ?? "",
    statusId: product.status_id,
    sourceId: product.source_id ?? "",
    licenseId: product.license_id ?? "",
    targetSalePrice: product.target_sale_price === null ? "" : String(product.target_sale_price),
    restockPriority: product.restock_priority,
    modelUrl: product.model_url ?? "",
    etsyListingUrl: product.etsy_listing_url ?? "",
    defaultMaterial: product.default_material ?? "",
    primaryColor: product.primary_color ?? "",
    accentColor: product.accent_color ?? "",
    preferredPrinterId:
      product.preferred_printer_id === null ? "" : String(product.preferred_printer_id),
    estimatedPrintTimeHours: hoursFromSeconds(product.estimated_print_time_s),
    estimatedFilamentG:
      product.estimated_filament_g === null ? "" : String(product.estimated_filament_g),
    boothPrice: product.booth_price === null ? "" : String(product.booth_price),
    etsyPrice: product.etsy_price === null ? "" : String(product.etsy_price),
    packagingCost: product.packaging_cost === null ? "" : String(product.packaging_cost),
    handlingMinutes: product.handling_minutes === null ? "" : String(product.handling_minutes),
    targetMarginPct: product.target_margin_pct === null ? "" : String(product.target_margin_pct),
    pricingNotes: product.pricing_notes ?? "",
    notes: product.notes ?? "",
    salesCompanionVisible: product.sales_companion_visible,
  };
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

function DetailFacts({ product }: { product: ProductSummary }) {
  const colors = [product.primary_color, product.accent_color].filter(Boolean).join(" / ");
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
    <div>
      <span>Booth</span
      ><strong>${product.booth_price === null ? "—" : `$${product.booth_price.toFixed(2)}`}</strong>
    </div>
    <div>
      <span>Etsy</span
      ><strong>${product.etsy_price === null ? "—" : `$${product.etsy_price.toFixed(2)}`}</strong>
    </div>
    <div><span>Material</span><strong>${product.default_material || "Not set"}</strong></div>
    <div><span>Colors</span><strong>${colors || "Not set"}</strong></div>
    <div>
      <span>Printer</span
      ><strong
        >${product.preferred_printer_id === null
          ? "Not set"
          : `#${product.preferred_printer_id}`}</strong
      >
    </div>
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const requestState = useRef(initialProductDetailRequestState());
  const reconciliationState = useRef(initialProductReconciliationState());
  const reconciliationControllers = useRef(new Set<AbortController>());

  useEffect(() => {
    let cancelled = false;
    const started = beginProductDetailRequest(requestState.current, productId);
    requestState.current = started.state;
    reconciliationState.current = beginProductReconciliationMount(
      reconciliationState.current,
      productId,
    ).state;
    setProduct(null);
    setForm(null);
    setLoadError(null);
    setLoading(true);
    setSaving(false);

    fetchProduct(productId)
      .then((item) => {
        if (cancelled) return;
        const resolved = resolveProductDetailRequest(
          requestState.current,
          started.requestGeneration,
          item,
        );
        if (resolved === requestState.current) return;
        requestState.current = resolved;
        setProduct(resolved.product);
        setForm(resolved.form);
        setLoadError(resolved.error);
        setLoading(resolved.loading);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "Failed to load product.";
        const rejected = rejectProductDetailRequest(
          requestState.current,
          started.requestGeneration,
          message,
        );
        if (rejected === requestState.current) return;
        requestState.current = rejected;
        setProduct(null);
        setForm(null);
        setLoadError(message);
        setLoading(false);
        toast(message, "error");
      });
    return () => {
      cancelled = true;
      reconciliationState.current = invalidateProductReconciliation(reconciliationState.current);
      for (const controller of reconciliationControllers.current) controller.abort();
      reconciliationControllers.current.clear();
    };
  }, [productId]);

  const reconcileProduct = async (id: number) => {
    if (!reconciliationState.current.active || reconciliationState.current.productId !== id) {
      return;
    }
    const started = beginProductReconciliationRequest(reconciliationState.current, id);
    reconciliationState.current = started.state;
    const controller = new AbortController();
    reconciliationControllers.current.add(controller);
    try {
      const authoritative = await fetchProduct(id, { signal: controller.signal });
      if (
        !isCurrentProductReconciliation(reconciliationState.current, started.requestGeneration, id)
      ) {
        return;
      }
      const reconciled = applyProductReconciliation(requestState.current.product, authoritative);
      if (!reconciled) return;
      requestState.current = { ...requestState.current, product: reconciled };
      setProduct((current) => applyProductReconciliation(current, authoritative));
    } catch (error: unknown) {
      if (
        !isCurrentProductReconciliation(reconciliationState.current, started.requestGeneration, id)
      ) {
        return;
      }
      const message =
        error instanceof Error ? error.message : "Failed to reconcile the latest Product details.";
      toast(message, "error");
    } finally {
      reconciliationControllers.current.delete(controller);
    }
  };

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
      model_url: form.modelUrl.trim() || null,
      etsy_listing_url: form.etsyListingUrl.trim() || null,
      default_material: form.defaultMaterial.trim() || null,
      primary_color: form.primaryColor.trim() || null,
      accent_color: form.accentColor.trim() || null,
      preferred_printer_id: positiveIntegerOrNull(form.preferredPrinterId),
      estimated_print_time_s: secondsFromHours(form.estimatedPrintTimeHours),
      estimated_filament_g: numberOrNull(form.estimatedFilamentG),
      booth_price: numberOrNull(form.boothPrice),
      etsy_price: numberOrNull(form.etsyPrice),
      packaging_cost: numberOrNull(form.packagingCost),
      handling_minutes: numberOrNull(form.handlingMinutes),
      target_margin_pct: numberOrNull(form.targetMarginPct),
      pricing_notes: form.pricingNotes.trim() || null,
      notes: form.notes.trim() || null,
      sales_companion_visible: form.salesCompanionVisible,
    };

    const requestGeneration = requestState.current.generation;
    setSaving(true);
    try {
      const updated = await updateProduct(product.id, payload);
      if (
        !updated ||
        requestState.current.generation !== requestGeneration ||
        requestState.current.productId !== product.id
      ) {
        return;
      }
      const updatedForm = initialProductDetailForm(updated);
      const merged = mergeProductFormResponse(requestState.current.product, updated);
      if (!merged) return;
      requestState.current = { ...requestState.current, product: merged, form: updatedForm };
      setProduct((current) => mergeProductFormResponse(current, updated));
      setForm(updatedForm);
      void reconcileProduct(updated.id);
      toast("Product updated.", "success");
    } finally {
      if (
        requestState.current.generation === requestGeneration &&
        requestState.current.productId === product.id
      ) {
        setSaving(false);
      }
    }
  };

  const updateImageProduct = (updated: ProductSummary) => {
    if (requestState.current.productId !== updated.id) return;
    const merged = mergeProductImageResponse(requestState.current.product, updated);
    if (!merged) return;
    requestState.current = { ...requestState.current, product: merged };
    setProduct((current) => mergeProductImageResponse(current, updated));
    void reconcileProduct(updated.id);
  };

  if (requestState.current.productId !== productId || loading) {
    return html`<div class="empty">Loading product…</div>`;
  }
  if (loadError) {
    return html`<div class="empty">Unable to load product. ${loadError}</div>`;
  }
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
        <${ProductImagePanel} product=${product} onProductChange=${updateImageProduct} />
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
            Optional listing and production fields are loaded from product detail and saved with the
            rest of the product record.
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
              Default material
              <input
                class="form-input"
                value=${form.defaultMaterial}
                placeholder="PLA"
                onInput=${(event: Event) =>
                  setField("defaultMaterial", (event.target as HTMLInputElement).value)}
              />
            </label>
            <label class="form-label">
              Primary color
              <input
                class="form-input"
                value=${form.primaryColor}
                placeholder="#ffffff or White"
                onInput=${(event: Event) =>
                  setField("primaryColor", (event.target as HTMLInputElement).value)}
              />
            </label>
            <label class="form-label">
              Accent color
              <input
                class="form-input"
                value=${form.accentColor}
                placeholder="#000000 or Black"
                onInput=${(event: Event) =>
                  setField("accentColor", (event.target as HTMLInputElement).value)}
              />
            </label>
            <label class="form-label">
              Preferred printer ID
              <input
                class="form-input"
                inputmode="numeric"
                value=${form.preferredPrinterId}
                placeholder="1"
                onInput=${(event: Event) =>
                  setField("preferredPrinterId", (event.target as HTMLInputElement).value)}
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

        <section class="admin-section product-publication-section">
          <h3 class="admin-section-title">Sales Companion publication</h3>
          <label class="sales-companion-toggle">
            <input
              type="checkbox"
              checked=${form.salesCompanionVisible}
              onChange=${(event: Event) =>
                setForm((current) =>
                  current
                    ? {
                        ...current,
                        salesCompanionVisible: (event.target as HTMLInputElement).checked,
                      }
                    : current,
                )}
            />
            <span>Visible in Sales Companion</span>
          </label>
          <p class="admin-section-desc">
            ${form.salesCompanionVisible
              ? "Visible Products publish only their newest complete saved Direct and Etsy pricing."
              : "Private by default. Enable this only when the Product is ready for local Sales Companion use."}
          </p>
          ${!product.main_photo_path
            ? html`<p class="sales-companion-image-warning">
                No identification image is selected. Visibility is allowed, but Sales Companion will
                show this Product without an image.
              </p>`
            : null}
        </section>

        <section class="admin-section">
          <h3 class="admin-section-title">Product pricing defaults</h3>
          <p class="admin-section-desc">
            Defaults used when planning booth and Etsy batches. Batch-specific values can still
            override these when needed.
          </p>
          <div class="product-form-grid">
            <label class="form-label">
              Booth price
              <input
                class="form-input"
                inputmode="decimal"
                value=${form.boothPrice}
                placeholder="12.00"
                onInput=${(event: Event) =>
                  setField("boothPrice", (event.target as HTMLInputElement).value)}
              />
            </label>
            <label class="form-label">
              Etsy price
              <input
                class="form-input"
                inputmode="decimal"
                value=${form.etsyPrice}
                placeholder="14.99"
                onInput=${(event: Event) =>
                  setField("etsyPrice", (event.target as HTMLInputElement).value)}
              />
            </label>
            <label class="form-label">
              Packaging cost
              <input
                class="form-input"
                inputmode="decimal"
                value=${form.packagingCost}
                placeholder="0.75"
                onInput=${(event: Event) =>
                  setField("packagingCost", (event.target as HTMLInputElement).value)}
              />
            </label>
            <label class="form-label">
              Handling minutes
              <input
                class="form-input"
                inputmode="decimal"
                value=${form.handlingMinutes}
                placeholder="3"
                onInput=${(event: Event) =>
                  setField("handlingMinutes", (event.target as HTMLInputElement).value)}
              />
            </label>
            <label class="form-label">
              Target margin
              <input
                class="form-input"
                inputmode="decimal"
                value=${form.targetMarginPct}
                placeholder="0.50"
                onInput=${(event: Event) =>
                  setField("targetMarginPct", (event.target as HTMLInputElement).value)}
              />
            </label>
          </div>
          <label class="form-label product-notes-field">
            Pricing notes
            <textarea
              class="form-input form-textarea"
              value=${form.pricingNotes}
              placeholder="Booth/Etsy pricing rationale, packaging assumptions, margin notes…"
              onInput=${(event: Event) =>
                setField("pricingNotes", (event.target as HTMLTextAreaElement).value)}
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

    <${ProductPricingHistory} productId=${productId} />
  </main>`;
}
