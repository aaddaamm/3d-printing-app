import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import htm from "htm";

import { fetchPrintNextProducts, updateProduct, type ProductSummary } from "../lib/api.js";
import { ProductCard } from "./product-card.js";
import { ProductSellability } from "./product-sellability.js";
import { toast } from "./toast.js";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

const PRIORITY_WEIGHT: Record<string, number> = { urgent: 0, high: 1, normal: 2, none: 3 };

export function sortPrintNextProducts(products: ProductSummary[]): ProductSummary[] {
  return [...products].sort((a, b) => {
    const priorityDelta =
      (PRIORITY_WEIGHT[a.restock_priority] ?? 9) - (PRIORITY_WEIGHT[b.restock_priority] ?? 9);
    if (priorityDelta !== 0) return priorityDelta;
    return a.name.localeCompare(b.name);
  });
}

function PrintNextSummary({ products }: { products: ProductSummary[] }) {
  const urgent = products.filter((product) => product.restock_priority === "urgent").length;
  const high = products.filter((product) => product.restock_priority === "high").length;
  const ready = products.filter((product) => product.ready_to_list).length;

  return html`<div class="product-print-next-summary">
    <div><strong>${products.length}</strong><span>queued</span></div>
    <div><strong>${urgent}</strong><span>urgent</span></div>
    <div><strong>${high}</strong><span>high</span></div>
    <div><strong>${ready}</strong><span>ready to list</span></div>
  </div>`;
}

export function ProductPrintNextView({ navigate }: { navigate: (path: string) => void }) {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchPrintNextProducts()
      .then((items) => {
        if (!cancelled) setProducts(sortPrintNextProducts(items));
      })
      .catch((error: unknown) => {
        toast(
          error instanceof Error ? error.message : "Failed to load print-next products.",
          "error",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleStatusChange = async (product: ProductSummary, statusId: string) => {
    if (statusId === product.status_id) return;
    const updated = await updateProduct(product.id, { status_id: statusId });
    if (!updated) return;
    setProducts((items) =>
      sortPrintNextProducts(
        items
          .map((item) => (item.id === updated.id ? updated : item))
          .filter((item) => ["active", "selling_well"].includes(item.status_id)),
      ),
    );
    toast("Product status updated.", "success");
  };

  return html`<main class="products-page">
    <section class="products-hero">
      <div>
        <p class="products-kicker">Production queue</p>
        <h2>Print Next</h2>
        <p>Active and selling-well products with a restock priority, sorted urgent first.</p>
      </div>
      <div class="product-tabs" aria-label="Product views">
        <button class="product-tab" onClick=${() => navigate("/products/pipeline")}>
          Pipeline
        </button>
        <button class="product-tab" onClick=${() => navigate("/products")}>Catalog</button>
        <button class="product-tab active">Print Next</button>
      </div>
    </section>

    ${loading
      ? html`<div class="empty">Loading print queue…</div>`
      : products.length === 0
        ? html`<div class="empty">No active products need restocking.</div>`
        : html`
            <${PrintNextSummary} products=${products} />
            <div class="product-print-next-grid">
              ${products.map(
                (product) =>
                  html`<article class="product-print-next-card" key=${product.id}>
                    <div class="product-print-next-topline">
                      <span
                        class=${"product-priority product-priority--" + product.restock_priority}
                      >
                        ${product.restock_priority}
                      </span>
                      <${ProductSellability}
                        level=${product.can_sell_level}
                        label=${product.can_sell_label}
                        readyToList=${product.ready_to_list}
                      />
                    </div>
                    <${ProductCard}
                      product=${product}
                      onOpen=${() => navigate(`/products/${product.id}`)}
                      onStatusChange=${handleStatusChange}
                    />
                  </article>`,
              )}
            </div>
          `}
  </main>`;
}
