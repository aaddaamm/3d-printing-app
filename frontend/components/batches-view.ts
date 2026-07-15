import { h } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import htm from "htm";

import {
  PRICING_PROFILE_OPTIONS,
  createBatch,
  fetchBatches,
  fetchProducts,
  type BatchSummary,
  type ProductSummary,
} from "../lib/api.js";
import { positiveIntegerOrNull } from "../lib/form-values.js";
import { BatchCard } from "./batch-card.js";
import { toast } from "./toast.js";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

type CreateFormState = {
  productId: string;
  pricingProfileId: string;
  plannedQuantity: string;
};

function BatchCreateCard({
  products,
  onCreated,
}: {
  products: ProductSummary[];
  onCreated: (batch: BatchSummary) => void;
}) {
  const [form, setForm] = useState<CreateFormState>({
    productId: "",
    pricingProfileId: "booth",
    plannedQuantity: "1",
  });
  const [saving, setSaving] = useState(false);
  const setField = (field: keyof CreateFormState, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event: Event) => {
    event.preventDefault();
    const productId = positiveIntegerOrNull(form.productId);
    const plannedQuantity = positiveIntegerOrNull(form.plannedQuantity);
    if (!productId || !plannedQuantity) return;

    setSaving(true);
    try {
      const batch = await createBatch({
        product_id: productId,
        pricing_profile_id: form.pricingProfileId,
        planned_quantity: plannedQuantity,
      });
      if (!batch) return;
      onCreated(batch);
      setForm({ productId: "", pricingProfileId: "booth", plannedQuantity: "1" });
      toast("Batch created.", "success");
    } finally {
      setSaving(false);
    }
  };

  return html`<form class="batch-create-card" onSubmit=${submit}>
    <select
      class="form-input"
      value=${form.productId}
      onChange=${(event: Event) => setField("productId", (event.target as HTMLSelectElement).value)}
    >
      <option value="">Select product…</option>
      ${products.map(
        (product) =>
          html`<option key=${product.id} value=${String(product.id)}>${product.name}</option>`,
      )}
    </select>
    <select
      class="form-input"
      value=${form.pricingProfileId}
      onChange=${(event: Event) =>
        setField("pricingProfileId", (event.target as HTMLSelectElement).value)}
    >
      ${PRICING_PROFILE_OPTIONS.map(
        (profile) => html`<option key=${profile.id} value=${profile.id}>${profile.label}</option>`,
      )}
    </select>
    <input
      class="form-input"
      inputmode="numeric"
      value=${form.plannedQuantity}
      placeholder="Planned qty"
      onInput=${(event: Event) =>
        setField("plannedQuantity", (event.target as HTMLInputElement).value)}
    />
    <button
      class="btn-primary"
      type="submit"
      disabled=${saving ||
      !positiveIntegerOrNull(form.productId) ||
      !positiveIntegerOrNull(form.plannedQuantity)}
    >
      ${saving ? "Adding…" : "Add Batch"}
    </button>
  </form>`;
}

export function BatchesView({ navigate }: { navigate: (path: string) => void }) {
  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [profileId, setProfileId] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchBatches(), fetchProducts()])
      .then(([batchItems, productItems]) => {
        if (cancelled) return;
        setBatches(batchItems);
        setProducts(productItems);
      })
      .catch((error: unknown) => {
        toast(error instanceof Error ? error.message : "Failed to load batches.", "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return batches.filter((batch) => {
      if (profileId && batch.pricing_profile_id !== profileId) return false;
      if (!normalizedQuery) return true;
      const haystack = [
        batch.product_name,
        batch.pricing_profile_label,
        batch.material_type,
        batch.primary_color,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [batches, profileId, query]);

  return html`<main class="products-page batches-page">
    <section class="products-hero">
      <div>
        <p class="products-kicker">Batch pricing</p>
        <h2>Production Batches</h2>
        <p>Card-based batch runs for booth, Etsy, personal, and custom pricing decisions.</p>
      </div>
      <button class="product-tab" onClick=${() => navigate("/products")}>Products</button>
    </section>

    <div class="product-toolbar">
      <input
        type="search"
        placeholder="Search batches…"
        value=${query}
        onInput=${(event: Event) => setQuery((event.target as HTMLInputElement).value)}
      />
      <select
        value=${profileId}
        onChange=${(event: Event) => setProfileId((event.target as HTMLSelectElement).value)}
      >
        <option value="">All channels</option>
        ${PRICING_PROFILE_OPTIONS.map(
          (profile) =>
            html`<option key=${profile.id} value=${profile.id}>${profile.label}</option>`,
        )}
      </select>
      <span class="product-count">${filtered.length} of ${batches.length} batches</span>
    </div>

    <section class="product-create-section">
      <${BatchCreateCard}
        products=${products}
        onCreated=${(batch: BatchSummary) => setBatches((items) => [batch, ...items])}
      />
    </section>

    ${loading
      ? html`<div class="empty">Loading batches…</div>`
      : filtered.length
        ? html`<div class="batch-grid">
            ${filtered.map(
              (batch) =>
                html`<${BatchCard}
                  key=${batch.id}
                  batch=${batch}
                  onOpen=${() => navigate(`/batches/${batch.id}`)}
                />`,
            )}
          </div>`
        : html`<div class="empty">No batches match your filters.</div>`}
  </main>`;
}
