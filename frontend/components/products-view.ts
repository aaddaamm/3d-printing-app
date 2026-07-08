import { h } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import htm from "htm";

import {
  createProduct as createProductRequest,
  fetchProducts,
  updateProduct,
  type ProductSummary,
} from "../lib/api.js";
import { ProductCard } from "./product-card.js";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_SOURCES,
  PRODUCT_STATUSES,
  PRODUCT_LICENSES,
} from "./product-card.js";
import { toast } from "./toast.js";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

const SELLABILITY_OPTIONS = [
  { id: "", label: "All sellability" },
  { id: "green", label: "Green" },
  { id: "yellow", label: "Yellow" },
  { id: "red", label: "Red" },
] as const;

type ProductFilters = {
  q: string;
  categoryId: string;
  statusId: string;
  sourceId: string;
  sellability: string;
};

export function groupProductsByStatus(
  products: ProductSummary[],
): Array<{ statusId: string; statusLabel: string; products: ProductSummary[] }> {
  const byStatus = new Map<string, ProductSummary[]>();
  for (const product of products) {
    const items = byStatus.get(product.status_id) ?? [];
    items.push(product);
    byStatus.set(product.status_id, items);
  }

  const knownColumns = PRODUCT_STATUSES.map((status) => ({
    statusId: status.id,
    statusLabel: status.label,
    products: byStatus.get(status.id) ?? [],
  }));

  const knownStatusIds = new Set(PRODUCT_STATUSES.map((status) => status.id));
  const unknownColumns = [...byStatus.entries()]
    .filter(
      ([statusId]) => !knownStatusIds.has(statusId as (typeof PRODUCT_STATUSES)[number]["id"]),
    )
    .map(([statusId, items]) => ({
      statusId,
      statusLabel: items[0]?.status_label ?? statusId,
      products: items,
    }));

  return [...knownColumns, ...unknownColumns];
}

function productMatchesFilters(product: ProductSummary, filters: ProductFilters): boolean {
  const query = filters.q.trim().toLowerCase();
  if (query) {
    const haystack = [
      product.name,
      product.category_label,
      product.status_label,
      product.source_label,
      product.license_label,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  if (filters.categoryId && product.category_id !== filters.categoryId) return false;
  if (filters.statusId && product.status_id !== filters.statusId) return false;
  if (filters.sourceId && product.source_id !== filters.sourceId) return false;
  if (filters.sellability && product.can_sell_level !== filters.sellability) return false;
  return true;
}

function ProductNav({
  mode,
  navigate,
}: {
  mode: "catalog" | "pipeline";
  navigate: (path: string) => void;
}) {
  const itemClass = (active: boolean) => "product-tab" + (active ? " active" : "");
  return html`<div class="product-tabs" aria-label="Product views">
    <button class=${itemClass(mode === "pipeline")} onClick=${() => navigate("/products/pipeline")}>
      Pipeline
    </button>
    <button class=${itemClass(mode === "catalog")} onClick=${() => navigate("/products")}>
      Catalog
    </button>
    <button class="product-tab" onClick=${() => navigate("/products/print-next")}>
      Print Next
    </button>
  </div>`;
}

function ProductFiltersBar({
  filters,
  setFilters,
  count,
  total,
  showStatusFilter,
}: {
  filters: ProductFilters;
  setFilters: (filters: ProductFilters) => void;
  count: number;
  total: number;
  showStatusFilter: boolean;
}) {
  const setField = (field: keyof ProductFilters, value: string) =>
    setFilters({ ...filters, [field]: value });

  return html`<div class="product-toolbar">
    <input
      type="search"
      placeholder="Search products…"
      value=${filters.q}
      onInput=${(event: Event) => setField("q", (event.target as HTMLInputElement).value)}
    />
    <select
      value=${filters.categoryId}
      onChange=${(event: Event) =>
        setField("categoryId", (event.target as HTMLSelectElement).value)}
    >
      <option value="">All categories</option>
      ${PRODUCT_CATEGORIES.map(
        (category) =>
          html`<option key=${category.id} value=${category.id}>${category.label}</option>`,
      )}
    </select>
    ${showStatusFilter
      ? html`<select
          value=${filters.statusId}
          onChange=${(event: Event) =>
            setField("statusId", (event.target as HTMLSelectElement).value)}
        >
          <option value="">All statuses</option>
          ${PRODUCT_STATUSES.map(
            (status) => html`<option key=${status.id} value=${status.id}>${status.label}</option>`,
          )}
        </select>`
      : null}
    <select
      value=${filters.sourceId}
      onChange=${(event: Event) => setField("sourceId", (event.target as HTMLSelectElement).value)}
    >
      <option value="">All sources</option>
      ${PRODUCT_SOURCES.map(
        (source) => html`<option key=${source.id} value=${source.id}>${source.label}</option>`,
      )}
    </select>
    <select
      value=${filters.sellability}
      onChange=${(event: Event) =>
        setField("sellability", (event.target as HTMLSelectElement).value)}
    >
      ${SELLABILITY_OPTIONS.map(
        (option) => html`<option key=${option.id} value=${option.id}>${option.label}</option>`,
      )}
    </select>
    <span class="product-count"
      >${count.toLocaleString()} of ${total.toLocaleString()} products</span
    >
  </div>`;
}

function CreateProductForm({ onCreated }: { onCreated: (product: ProductSummary) => void }) {
  const [name, setName] = useState("");
  const [licenseId, setLicenseId] = useState("unknown_verify");
  const [sourceId, setSourceId] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: Event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const product = await createProductRequest({
        name: trimmed,
        status_id: "idea",
        license_id: licenseId,
        source_id: sourceId || null,
      });
      if (!product) return;
      onCreated(product);
      setName("");
      setLicenseId("unknown_verify");
      setSourceId("");
      toast("Product created.", "success");
    } finally {
      setSaving(false);
    }
  };

  return html`<form class="product-create-card" onSubmit=${submit}>
    <input
      class="form-input"
      placeholder="New product idea…"
      value=${name}
      onInput=${(event: Event) => setName((event.target as HTMLInputElement).value)}
    />
    <select
      class="form-input"
      value=${sourceId}
      onChange=${(event: Event) => setSourceId((event.target as HTMLSelectElement).value)}
    >
      <option value="">Source TBD</option>
      ${PRODUCT_SOURCES.map(
        (source) => html`<option key=${source.id} value=${source.id}>${source.label}</option>`,
      )}
    </select>
    <select
      class="form-input"
      value=${licenseId}
      onChange=${(event: Event) => setLicenseId((event.target as HTMLSelectElement).value)}
    >
      ${PRODUCT_LICENSES.map(
        (license) => html`<option key=${license.id} value=${license.id}>${license.label}</option>`,
      )}
    </select>
    <button class="btn-primary" type="submit" disabled=${saving || !name.trim()}>
      ${saving ? "Adding…" : "Add Product"}
    </button>
  </form>`;
}

function CatalogGrid({
  products,
  navigate,
  onStatusChange,
}: {
  products: ProductSummary[];
  navigate: (path: string) => void;
  onStatusChange: (product: ProductSummary, statusId: string) => void;
}) {
  if (!products.length) return html`<div class="empty">No products match your filters.</div>`;
  return html`<div class="product-grid">
    ${products.map(
      (product) =>
        html`<${ProductCard}
          key=${product.id}
          product=${product}
          onOpen=${() => navigate(`/products/${product.id}`)}
          onStatusChange=${onStatusChange}
        />`,
    )}
  </div>`;
}

function PipelineBoard({
  columns,
  navigate,
  onStatusChange,
}: {
  columns: Array<{ statusId: string; statusLabel: string; products: ProductSummary[] }>;
  navigate: (path: string) => void;
  onStatusChange: (product: ProductSummary, statusId: string) => void;
}) {
  return html`<div class="product-kanban" role="list">
    ${columns.map(
      (column) =>
        html`<section class="product-kanban-column" key=${column.statusId} role="listitem">
          <div class="product-kanban-header">
            <h3>${column.statusLabel}</h3>
            <span>${column.products.length}</span>
          </div>
          <div class="product-kanban-cards">
            ${column.products.length
              ? column.products.map(
                  (product) =>
                    html`<${ProductCard}
                      key=${product.id}
                      product=${product}
                      onOpen=${() => navigate(`/products/${product.id}`)}
                      onStatusChange=${onStatusChange}
                    />`,
                )
              : html`<div class="product-column-empty">No products</div>`}
          </div>
        </section>`,
    )}
  </div>`;
}

export function ProductsView({
  mode,
  navigate,
}: {
  mode: "catalog" | "pipeline";
  navigate: (path: string) => void;
}) {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>({
    q: "",
    categoryId: "",
    statusId: "",
    sourceId: "",
    sellability: "",
  });

  useEffect(() => {
    let cancelled = false;
    fetchProducts()
      .then((items) => {
        if (!cancelled) setProducts(items);
      })
      .catch((error: unknown) => {
        toast(error instanceof Error ? error.message : "Failed to load products.", "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => products.filter((product) => productMatchesFilters(product, filters)),
    [products, filters],
  );
  const columns = useMemo(() => groupProductsByStatus(filtered), [filtered]);

  const handleStatusChange = async (product: ProductSummary, statusId: string) => {
    if (statusId === product.status_id) return;
    const updated = await updateProduct(product.id, { status_id: statusId });
    if (!updated) return;
    setProducts((items) => items.map((item) => (item.id === updated.id ? updated : item)));
    toast("Product status updated.", "success");
  };

  return html`<main class="products-page">
    <section class="products-hero">
      <div>
        <p class="products-kicker">Product workflow</p>
        <h2>${mode === "pipeline" ? "Product Pipeline" : "Product Catalog"}</h2>
        <p>
          Card-based product tracking for sellability, listing readiness, and what to print next.
        </p>
      </div>
      <${ProductNav} mode=${mode} navigate=${navigate} />
    </section>

    <${ProductFiltersBar}
      filters=${filters}
      setFilters=${setFilters}
      count=${filtered.length}
      total=${products.length}
      showStatusFilter=${mode === "catalog"}
    />

    ${mode === "catalog"
      ? html`<section class="product-create-section">
          <${CreateProductForm}
            onCreated=${(product: ProductSummary) => setProducts((items) => [product, ...items])}
          />
        </section>`
      : null}
    ${loading
      ? html`<div class="empty">Loading products…</div>`
      : mode === "pipeline"
        ? html`<${PipelineBoard}
            columns=${columns}
            navigate=${navigate}
            onStatusChange=${handleStatusChange}
          />`
        : html`<${CatalogGrid}
            products=${filtered}
            navigate=${navigate}
            onStatusChange=${handleStatusChange}
          />`}
  </main>`;
}
