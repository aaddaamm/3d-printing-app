import { h } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import htm from "htm";

import { fetchProducts, savePriceQuoteToProduct, type ProductSummary } from "../lib/api.js";
import {
  beginSaveProductRequest,
  buildSaveProductPricingRequest,
  canSaveToProduct,
  completeSaveProductRequest,
  initialSaveProductRequestState,
  initialSaveToProductModalState,
  invalidateSaveProductRequests,
  isCurrentSaveProductRequest,
  saveToProductSelection,
  setSaveToProductExistingProductId,
  setSaveToProductMode,
  setSaveToProductNewProductField,
  type PriceThisDraft,
  unmountSaveProductRequests,
} from "./price-this-helpers.js";
import { PRODUCT_LICENSES, PRODUCT_SOURCES } from "./product-card.js";
import type { Job } from "./jobs-view-types.js";
import { toast } from "./toast.js";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

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

function productOptionLabel(product: ProductSummary): string {
  const parts = [product.name, product.designer || product.status_label].filter(Boolean);
  return parts.join(" · ");
}

function enabledModalControls(dialog: HTMLElement): HTMLElement[] {
  return [
    ...dialog.querySelectorAll<HTMLElement>("a[href], button, input, select, textarea, [tabindex]"),
  ].filter(
    (element) =>
      !element.matches(":disabled") &&
      element.closest("[hidden]") === null &&
      element.getAttribute("tabindex") !== "-1" &&
      !(element instanceof HTMLInputElement && element.type === "hidden"),
  );
}

export function SavePriceToProductModal({
  draft,
  selectedJobs,
  navigate,
  onClose,
}: SavePriceToProductModalProps) {
  const [modalState, setModalState] = useState(() => initialSaveToProductModalState(selectedJobs));
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveRequestState = useRef(initialSaveProductRequestState());
  const saveController = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const existingSelectRef = useRef<HTMLSelectElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const openingTrigger = useRef<HTMLElement | null>(
    document.activeElement instanceof HTMLElement ? document.activeElement : null,
  );

  const restoreOpeningFocus = () => {
    if (openingTrigger.current?.isConnected) openingTrigger.current.focus();
  };

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      saveRequestState.current = unmountSaveProductRequests(saveRequestState.current);
      saveController.current?.abort();
      saveController.current = null;
      restoreOpeningFocus();
    };
  }, []);

  const dismiss = () => {
    saveController.current?.abort();
    saveController.current = null;
    saveRequestState.current = invalidateSaveProductRequests(saveRequestState.current);
    restoreOpeningFocus();
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dismiss();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const controls = enabledModalControls(dialogRef.current);
      if (controls.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = controls[0]!;
      const last = controls[controls.length - 1]!;
      const active = document.activeElement;
      if (!(active instanceof HTMLElement) || !controls.includes(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  });

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
    if (modalState.mode === "existing") {
      existingSelectRef.current?.focus();
      return;
    }
    nameInputRef.current?.focus();
  }, [modalState.mode]);

  const existingOptions = useMemo(
    () => [...products].sort((left, right) => left.name.localeCompare(right.name)),
    [products],
  );

  const canSave = canSaveToProduct(modalState, { loadingProducts, saving });

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    if (!canSave) return;

    const started = beginSaveProductRequest(saveRequestState.current);
    if (!started) return;

    const controller = new AbortController();
    saveController.current = controller;
    saveRequestState.current = started.state;
    setSaving(true);
    try {
      const result = await savePriceQuoteToProduct(
        buildSaveProductPricingRequest(draft, saveToProductSelection(modalState)),
        controller.signal,
      );
      if (
        mounted.current &&
        isCurrentSaveProductRequest(saveRequestState.current, started.requestGeneration)
      ) {
        saveRequestState.current = completeSaveProductRequest(
          saveRequestState.current,
          started.requestGeneration,
        );
        saveController.current = null;
        toast("Saved price quote to product.", "success");
        onClose();
        navigate(`/products/${result.saved.product.id}`);
      }
    } catch (error: unknown) {
      if (
        mounted.current &&
        !controller.signal.aborted &&
        isCurrentSaveProductRequest(saveRequestState.current, started.requestGeneration)
      ) {
        toast(error instanceof Error ? error.message : "Failed to save product pricing.", "error");
      }
    } finally {
      if (saveController.current === controller) saveController.current = null;
      if (
        mounted.current &&
        isCurrentSaveProductRequest(saveRequestState.current, started.requestGeneration)
      ) {
        saveRequestState.current = completeSaveProductRequest(
          saveRequestState.current,
          started.requestGeneration,
        );
        setSaving(false);
      }
    }
  };

  return html`
    <div class="overlay" onClick=${overlayClose(dismiss)}>
      <div
        class="modal save-price-modal"
        ref=${dialogRef}
        role="dialog"
        tabindex=${-1}
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
            onClick=${dismiss}
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
                  checked=${modalState.mode === "new"}
                  onChange=${() => setModalState((current) => setSaveToProductMode(current, "new"))}
                />
                <span>Create Product</span>
              </label>
              <label class="save-price-modal-choice">
                <input
                  type="radio"
                  name="save-product-mode"
                  value="existing"
                  checked=${modalState.mode === "existing"}
                  onChange=${() =>
                    setModalState((current) => setSaveToProductMode(current, "existing"))}
                />
                <span>Use existing Product</span>
              </label>
            </fieldset>

            ${
              modalState.mode === "existing"
                ? html`<label class="form-label">
                    Product
                    <select
                      class="form-input"
                      ref=${existingSelectRef}
                      value=${modalState.existingProductId}
                      onChange=${(event: Event) =>
                        setModalState((current) =>
                          setSaveToProductExistingProductId(
                            current,
                            (event.target as HTMLSelectElement).value,
                          ),
                        )}
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
                      >${
                        loadingProducts
                          ? "Loading products…"
                          : existingOptions.length > 0
                            ? "Pick the Product that should receive this saved pricing batch."
                            : "No Products found yet. Switch to Create Product to save this quote."
                      }</span
                    >
                  </label>`
                : html`<div class="save-price-modal-grid">
                    <label class="form-label">
                      Name
                      <input
                        class="form-input"
                        ref=${nameInputRef}
                        type="text"
                        value=${modalState.newProduct.name}
                        onInput=${(event: Event) =>
                          setModalState((current) =>
                            setSaveToProductNewProductField(
                              current,
                              "name",
                              (event.target as HTMLInputElement).value,
                            ),
                          )}
                        required
                      />
                    </label>
                    <label class="form-label">
                      Designer
                      <input
                        class="form-input"
                        type="text"
                        value=${modalState.newProduct.designer}
                        onInput=${(event: Event) =>
                          setModalState((current) =>
                            setSaveToProductNewProductField(
                              current,
                              "designer",
                              (event.target as HTMLInputElement).value,
                            ),
                          )}
                      />
                    </label>
                    <label class="form-label">
                      Source
                      <select
                        class="form-input"
                        value=${modalState.newProduct.sourceId}
                        onChange=${(event: Event) =>
                          setModalState((current) =>
                            setSaveToProductNewProductField(
                              current,
                              "sourceId",
                              (event.target as HTMLSelectElement).value,
                            ),
                          )}
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
                        value=${modalState.newProduct.licenseId}
                        onChange=${(event: Event) =>
                          setModalState((current) =>
                            setSaveToProductNewProductField(
                              current,
                              "licenseId",
                              (event.target as HTMLSelectElement).value,
                            ),
                          )}
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
                        value=${modalState.newProduct.modelUrl}
                        onInput=${(event: Event) =>
                          setModalState((current) =>
                            setSaveToProductNewProductField(
                              current,
                              "modelUrl",
                              (event.target as HTMLInputElement).value,
                            ),
                          )}
                      />
                    </label>
                    <label class="form-label save-price-modal-field-wide">
                      Notes
                      <textarea
                        class="form-input form-textarea"
                        value=${modalState.newProduct.notes}
                        onInput=${(event: Event) =>
                          setModalState((current) =>
                            setSaveToProductNewProductField(
                              current,
                              "notes",
                              (event.target as HTMLTextAreaElement).value,
                            ),
                          )}
                      />
                    </label>
                  </div>`
            }

            <div class="form-actions save-price-modal-actions">
              <button type="button" class="btn-secondary" onClick=${dismiss} disabled=${saving}>
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
