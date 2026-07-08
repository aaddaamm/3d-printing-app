import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import htm from "htm";

import {
  PRICING_PROFILE_OPTIONS,
  fetchBatch,
  fetchProducts,
  updateBatch,
  type BatchInput,
  type BatchSummary,
  type ProductSummary,
} from "../lib/api.js";
import { BatchPriceBreakdown } from "./batch-price-breakdown.js";
import { toast } from "./toast.js";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

type BatchDetailFormState = {
  productId: string;
  pricingProfileId: string;
  plannedQuantity: string;
  completedQuantity: string;
  failedQuantity: string;
  materialType: string;
  primaryColor: string;
  totalFilamentG: string;
  totalPrintTimeHours: string;
  setupMinutes: string;
  handlingMinutesPerUnit: string;
  packagingCostPerUnit: string;
  notes: string;
};

function hoursFromSeconds(value: number | null | undefined): string {
  return value == null ? "" : String(value / 3600);
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

function positiveIntegerOrNull(value: string): number | null {
  const parsed = Number(value.trim());
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function nonNegativeIntegerOrNull(value: string): number | null {
  const parsed = Number(value.trim());
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function hasBatchField(batch: BatchSummary, field: keyof BatchSummary): boolean {
  return Object.prototype.hasOwnProperty.call(batch, field);
}

export function initialBatchDetailForm(batch: BatchSummary): BatchDetailFormState {
  return {
    productId: String(batch.product_id),
    pricingProfileId: batch.pricing_profile_id,
    plannedQuantity: String(batch.planned_quantity),
    completedQuantity: String(batch.completed_quantity),
    failedQuantity: String(batch.failed_quantity),
    materialType: batch.material_type ?? "",
    primaryColor: batch.primary_color ?? "",
    totalFilamentG: batch.total_filament_g == null ? "" : String(batch.total_filament_g),
    totalPrintTimeHours: hoursFromSeconds(batch.total_print_time_s),
    setupMinutes: batch.setup_minutes == null ? "" : String(batch.setup_minutes),
    handlingMinutesPerUnit:
      batch.handling_minutes_per_unit == null ? "" : String(batch.handling_minutes_per_unit),
    packagingCostPerUnit:
      batch.packaging_cost_per_unit == null ? "" : String(batch.packaging_cost_per_unit),
    notes: batch.notes ?? "",
  };
}

function FormField({ label, children }: { label: string; children: unknown }) {
  return html`<label class="form-label">${label}${children}</label>`;
}

export function BatchDetailView({
  batchId,
  navigate,
}: {
  batchId: number;
  navigate: (path: string) => void;
}) {
  const [batch, setBatch] = useState<BatchSummary | null>(null);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [form, setForm] = useState<BatchDetailFormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchBatch(batchId), fetchProducts()])
      .then(([batchItem, productItems]) => {
        if (cancelled) return;
        setBatch(batchItem);
        setProducts(productItems);
        setForm(initialBatchDetailForm(batchItem));
      })
      .catch((error: unknown) => {
        toast(error instanceof Error ? error.message : "Failed to load batch.", "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [batchId]);

  const setField = (field: keyof BatchDetailFormState, value: string) => {
    setForm((current) => (current ? { ...current, [field]: value } : current));
  };

  const canSave = Boolean(
    form &&
    positiveIntegerOrNull(form.productId) &&
    positiveIntegerOrNull(form.plannedQuantity) &&
    nonNegativeIntegerOrNull(form.completedQuantity) !== null &&
    nonNegativeIntegerOrNull(form.failedQuantity) !== null,
  );

  const save = async (event: Event) => {
    event.preventDefault();
    if (!form || !batch) return;
    const productId = positiveIntegerOrNull(form.productId);
    const plannedQuantity = positiveIntegerOrNull(form.plannedQuantity);
    const completedQuantity = nonNegativeIntegerOrNull(form.completedQuantity);
    const failedQuantity = nonNegativeIntegerOrNull(form.failedQuantity);
    if (!productId || !plannedQuantity || completedQuantity === null || failedQuantity === null) {
      return;
    }

    const payload: BatchInput = {
      product_id: productId,
      pricing_profile_id: form.pricingProfileId,
      planned_quantity: plannedQuantity,
      completed_quantity: completedQuantity,
      failed_quantity: failedQuantity,
      material_type: form.materialType.trim() || null,
      primary_color: form.primaryColor.trim() || null,
      total_filament_g: numberOrNull(form.totalFilamentG),
      total_print_time_s: secondsFromHours(form.totalPrintTimeHours),
      notes: form.notes.trim() || null,
    };

    if (hasBatchField(batch, "setup_minutes") || form.setupMinutes.trim()) {
      payload.setup_minutes = numberOrNull(form.setupMinutes);
    }
    if (hasBatchField(batch, "handling_minutes_per_unit") || form.handlingMinutesPerUnit.trim()) {
      payload.handling_minutes_per_unit = numberOrNull(form.handlingMinutesPerUnit);
    }
    if (hasBatchField(batch, "packaging_cost_per_unit") || form.packagingCostPerUnit.trim()) {
      payload.packaging_cost_per_unit = numberOrNull(form.packagingCostPerUnit);
    }

    setSaving(true);
    try {
      const updated = await updateBatch(batch.id, payload);
      if (!updated) return;
      setBatch(updated);
      setForm(initialBatchDetailForm(updated));
      toast("Batch updated.", "success");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return html`<div class="empty">Loading batch…</div>`;
  if (!batch || !form) return html`<div class="empty">Batch not found.</div>`;

  return html`<main class="product-detail-page batch-detail-page">
    <div class="product-detail-header">
      <button class="btn-back" onClick=${() => navigate("/batches")}>← Batches</button>
      <div>
        <p class="products-kicker">${batch.pricing_profile_label}</p>
        <h2>${batch.product_name}</h2>
      </div>
      <button class="product-tab" onClick=${() => navigate(`/products/${batch.product_id}`)}>
        Open Product
      </button>
    </div>

    <section class="product-detail-layout batch-detail-layout">
      <aside class="product-detail-card batch-detail-card">
        <div class="batch-detail-summary">
          <p class="products-kicker">Current pricing</p>
          <h3>${batch.completed_quantity} sellable / ${batch.failed_quantity} failed</h3>
          <p>${batch.material_type || "Material TBD"} · ${batch.primary_color || "Color TBD"}</p>
        </div>
        <${BatchPriceBreakdown} batch=${batch} />
      </aside>

      <form class="product-detail-form" onSubmit=${save}>
        <section class="admin-section">
          <h3 class="admin-section-title">Batch setup</h3>
          <div class="product-form-grid">
            <${FormField} label="Product">
              <select
                class="form-input"
                value=${form.productId}
                onChange=${(event: Event) =>
                  setField("productId", (event.target as HTMLSelectElement).value)}
              >
                ${products.map(
                  (product) =>
                    html`<option key=${product.id} value=${String(product.id)}>
                      ${product.name}
                    </option>`,
                )}
              </select>
            </${FormField}>
            <${FormField} label="Pricing profile">
              <select
                class="form-input"
                value=${form.pricingProfileId}
                onChange=${(event: Event) =>
                  setField("pricingProfileId", (event.target as HTMLSelectElement).value)}
              >
                ${PRICING_PROFILE_OPTIONS.map(
                  (profile) =>
                    html`<option key=${profile.id} value=${profile.id}>${profile.label}</option>`,
                )}
              </select>
            </${FormField}>
            <${FormField} label="Planned quantity">
              <input
                class="form-input"
                inputmode="numeric"
                value=${form.plannedQuantity}
                onInput=${(event: Event) =>
                  setField("plannedQuantity", (event.target as HTMLInputElement).value)}
              />
            </${FormField}>
            <${FormField} label="Completed quantity">
              <input
                class="form-input"
                inputmode="numeric"
                value=${form.completedQuantity}
                onInput=${(event: Event) =>
                  setField("completedQuantity", (event.target as HTMLInputElement).value)}
              />
            </${FormField}>
            <${FormField} label="Failed quantity">
              <input
                class="form-input"
                inputmode="numeric"
                value=${form.failedQuantity}
                onInput=${(event: Event) =>
                  setField("failedQuantity", (event.target as HTMLInputElement).value)}
              />
            </${FormField}>
          </div>
        </section>

        <section class="admin-section">
          <h3 class="admin-section-title">Costs and production totals</h3>
          <div class="product-form-grid">
            <${FormField} label="Material">
              <input
                class="form-input"
                value=${form.materialType}
                placeholder="PLA"
                onInput=${(event: Event) =>
                  setField("materialType", (event.target as HTMLInputElement).value)}
              />
            </${FormField}>
            <${FormField} label="Color">
              <input
                class="form-input"
                value=${form.primaryColor}
                placeholder="#ffffff or White"
                onInput=${(event: Event) =>
                  setField("primaryColor", (event.target as HTMLInputElement).value)}
              />
            </${FormField}>
            <${FormField} label="Total grams">
              <input
                class="form-input"
                inputmode="decimal"
                value=${form.totalFilamentG}
                placeholder="120"
                onInput=${(event: Event) =>
                  setField("totalFilamentG", (event.target as HTMLInputElement).value)}
              />
            </${FormField}>
            <${FormField} label="Total time (hours)">
              <input
                class="form-input"
                inputmode="decimal"
                value=${form.totalPrintTimeHours}
                placeholder="4.5"
                onInput=${(event: Event) =>
                  setField("totalPrintTimeHours", (event.target as HTMLInputElement).value)}
              />
            </${FormField}>
            <${FormField} label="Setup minutes">
              <input
                class="form-input"
                inputmode="decimal"
                value=${form.setupMinutes}
                placeholder="10"
                onInput=${(event: Event) =>
                  setField("setupMinutes", (event.target as HTMLInputElement).value)}
              />
            </${FormField}>
            <${FormField} label="Handling minutes / unit">
              <input
                class="form-input"
                inputmode="decimal"
                value=${form.handlingMinutesPerUnit}
                placeholder="3"
                onInput=${(event: Event) =>
                  setField("handlingMinutesPerUnit", (event.target as HTMLInputElement).value)}
              />
            </${FormField}>
            <${FormField} label="Packaging cost / unit">
              <input
                class="form-input"
                inputmode="decimal"
                value=${form.packagingCostPerUnit}
                placeholder="0.75"
                onInput=${(event: Event) =>
                  setField("packagingCostPerUnit", (event.target as HTMLInputElement).value)}
              />
            </${FormField}>
          </div>
          <label class="form-label product-notes-field">
            Notes
            <textarea
              class="form-input form-textarea"
              value=${form.notes}
              placeholder="Batch run notes, sales channel context, quality issues…"
              onInput=${(event: Event) => setField("notes", (event.target as HTMLTextAreaElement).value)}
            ></textarea>
          </label>
        </section>

        <div class="form-actions">
          <button class="btn-secondary" type="button" onClick=${() => navigate("/batches")}>
            Cancel
          </button>
          <button class="btn-primary" type="submit" disabled=${saving || !canSave}>
            ${saving ? "Saving…" : "Save Batch"}
          </button>
        </div>
      </form>
    </section>
  </main>`;
}
