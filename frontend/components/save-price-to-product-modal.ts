import { h } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import htm from "htm";

import { fetchProducts, savePriceQuoteToProduct, type ProductSummary } from "../lib/api.js";
import { useEscapeClose } from "../hooks/use-escape-close.js";
import {
  buildSaveProductPricingRequest,
  suggestedProductName,
  type ExistingOrNewProductSelection,
  type PriceThisDraft,
} from "./price-this-helpers.js";
import { PRODUCT_LICENSES, PRODUCT_SOURCES } from "./product-card.js";
import type { Job } from "./jobs-view-types.js";
import { toast } from "./toast.js";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

type NewProductFormState = Extract<ExistingOrNewProductSelection, { mode: "new" }>;

type SavePriceToProductModalProps = {
  draft: PriceThisDraft;
  selectedJobs: Array<Job | undefined>;
  navigate: (path: string) => void;
  onClose: () => void;
};

function overlayClose(onClose: () => void) {
  return (event: MouseEvent) => {
    if (event.target === event.currentTarget) onClose();
  };
}

function initialNewProductState(selectedJobs: Array<Job | undefined>): NewProductFormState {
  return {
    mode: "new",
    name: suggestedProductName(selectedJobs),
    designer: "",
    sourceId: "",
    licenseId: "unknown_verify",
    modelUrl: "",
    notes: "",
  };
}

function productOptionLabel(product: ProductSummary): string {
  const parts = [product.name, product.designer || product.status_label].filter(Boolean);
  return parts.join(" · ");
}

export function SavePriceToProductModal({
  draft,
  selectedJobs,
  navigate,
  onClose,
}: SavePriceToProductModalProps) {
  const [mode, setMode] = useState<ExistingOrNewProductSelection["mode"]>("new");
  const [existingProductId, setExistingProductId] = useState("");
  const [newProduct, setNewProduct] = useState<NewProductFormState>(() =>
    initialNewProductState(selectedJobs),
  );
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const existingSelectRef = useRef<HTMLSelectElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEscapeClose(onClose);

  useEffect(() => {
    let cancelled = false;
    fetchProducts()
      .then((items) => {
        if (!cancelled) setProducts(items);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        toast(error instanceof Error ? error.message : "Failed to load products.", "error");
      })
      .finally(() => {
        if (!cancelled) setLoadingProducts(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (mode === "existing") {
      existingSelectRef.current?.focus();
      return;
    }
    nameInputRef.current?.focus();
  }, [mode]);

  const existingOptions = useMemo(
    () => [...products].sort((left, right) => left.name.localeCompare(right.name)),
    [products],
  );

  const existingProductNumber = Number(existingProductId);
  const canSave =
    !saving &&
    (mode === "existing"
      ? Number.isSafeInteger(existingProductNumber) && existingProductNumber > 0 && !loadingProducts
      : Boolean(newProduct.name.trim()));

  const setNewProductField = (field: keyof Omit<NewProductFormState, "mode">, value: string) => {
    setNewProduct((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    if (!canSave || savingRef.current) return;

    const selection: ExistingOrNewProductSelection =
      mode === "existing" ? { mode, productId: existingProductNumber } : { ...newProduct };

    savingRef.current = true;
    setSaving(true);
    try {
      const result = await savePriceQuoteToProduct(
        buildSaveProductPricingRequest(draft, selection),
      );
      if (!result) return;
      toast("Saved price quote to product.", "success");
      onClose();
      navigate(`/products/${result.saved.product.id}`);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return html`
    <div class="overlay" onClick=${overlayClose(onClose)}>
      <div
        class="modal save-price-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-price-modal-title"
        onClick=${(event: MouseEvent) => event.stopPropagation()}
      >
        <div class="modal-header">
          <div>
            <h2 id="save-price-modal-title">Save to Product</h2>
            <p class="save-price-modal-subtitle">
              Save these manufacturing inputs and recalculate both direct and Etsy pricing.
            </p>
          </div>
          <button
            class="modal-close"
            type="button"
            onClick=${onClose}
            aria-label="Close save to product dialog"
          >
            ✕
          </button>
        </div>
        <div class="modal-body">
          <form class="save-price-modal-form" onSubmit=${handleSubmit}>
            <fieldset class="save-price-modal-mode">
              <legend>Save pricing to</legend>
              <label class="save-price-modal-choice">
                <input
                  type="radio"
                  name="save-product-mode"
                  value="new"
                  checked=${mode === "new"}
                  onChange=${() => setMode("new")}
                />
                <span>Create Product</span>
              </label>
              <label class="save-price-modal-choice">
                <input
                  type="radio"
                  name="save-product-mode"
                  value="existing"
                  checked=${mode === "existing"}
                  onChange=${() => setMode("existing")}
                />
                <span>Use existing Product</span>
              </label>
            </fieldset>

            ${mode === "existing"
              ? html`<label class="form-label">
                  Product
                  <select
                    class="form-input"
                    ref=${existingSelectRef}
                    value=${existingProductId}
                    onChange=${(event: Event) =>
                      setExistingProductId((event.target as HTMLSelectElement).value)}
                  >
                    <option value="">Choose a Product</option>
                    ${existingOptions.map(
                      (product) =>
                        html`<option key=${product.id} value=${String(product.id)}>
                          ${productOptionLabel(product)}
                        </option>`,
                    )}
                  </select>
                  <span class="form-help"
                    >${loadingProducts
                      ? "Loading products…"
                      : existingOptions.length > 0
                        ? "Pick the Product that should receive this saved pricing batch."
                        : "No Products found yet. Switch to Create Product to save this quote."}</span
                  >
                </label>`
              : html`<div class="save-price-modal-grid">
                  <label class="form-label">
                    Name
                    <input
                      class="form-input"
                      ref=${nameInputRef}
                      type="text"
                      value=${newProduct.name}
                      onInput=${(event: Event) =>
                        setNewProductField("name", (event.target as HTMLInputElement).value)}
                      required
                    />
                  </label>
                  <label class="form-label">
                    Designer
                    <input
                      class="form-input"
                      type="text"
                      value=${newProduct.designer}
                      onInput=${(event: Event) =>
                        setNewProductField("designer", (event.target as HTMLInputElement).value)}
                    />
                  </label>
                  <label class="form-label">
                    Source
                    <select
                      class="form-input"
                      value=${newProduct.sourceId}
                      onChange=${(event: Event) =>
                        setNewProductField("sourceId", (event.target as HTMLSelectElement).value)}
                    >
                      <option value="">Source TBD</option>
                      ${PRODUCT_SOURCES.map(
                        (source) =>
                          html`<option key=${source.id} value=${source.id}>
                            ${source.label}
                          </option>`,
                      )}
                    </select>
                  </label>
                  <label class="form-label">
                    License
                    <select
                      class="form-input"
                      value=${newProduct.licenseId}
                      onChange=${(event: Event) =>
                        setNewProductField("licenseId", (event.target as HTMLSelectElement).value)}
                    >
                      ${PRODUCT_LICENSES.map(
                        (license) =>
                          html`<option key=${license.id} value=${license.id}>
                            ${license.label}
                          </option>`,
                      )}
                    </select>
                  </label>
                  <label class="form-label save-price-modal-field-wide">
                    Model URL
                    <input
                      class="form-input"
                      type="url"
                      value=${newProduct.modelUrl}
                      onInput=${(event: Event) =>
                        setNewProductField("modelUrl", (event.target as HTMLInputElement).value)}
                    />
                  </label>
                  <label class="form-label save-price-modal-field-wide">
                    Notes
                    <textarea
                      class="form-input form-textarea"
                      value=${newProduct.notes}
                      onInput=${(event: Event) =>
                        setNewProductField("notes", (event.target as HTMLTextAreaElement).value)}
                    />
                  </label>
                </div>`}

            <div class="form-actions save-price-modal-actions">
              <button type="button" class="btn-secondary" onClick=${onClose} disabled=${saving}>
                Cancel
              </button>
              <button type="submit" class="btn-primary" disabled=${!canSave}>
                ${saving ? "Saving…" : "Save to Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}
