import { h } from "preact";
import htm from "htm";

import type { BatchSummary } from "../lib/api.js";
import { batchMarginClass, formatBatchMargin, formatBatchMoney } from "./batch-price-breakdown.js";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

export function BatchCard({
  batch,
  onOpen,
}: {
  batch: BatchSummary;
  onOpen: (batch: BatchSummary) => void;
}) {
  const productionTotal = batch.completed_quantity + batch.failed_quantity;
  return html`<article class="batch-card" onClick=${() => onOpen(batch)}>
    <div class="batch-card-header">
      <div>
        <p class="products-kicker">${batch.pricing_profile_label}</p>
        <h3>${batch.product_name}</h3>
      </div>
      <span class=${batchMarginClass(batch.estimated_margin_pct)}>
        ${formatBatchMargin(batch.estimated_margin_pct)}
      </span>
    </div>
    <div class="batch-card-meta">
      <span>${batch.material_type || "Material TBD"}</span>
      <span>${batch.primary_color || "Color TBD"}</span>
      <span>${batch.completed_quantity}/${batch.planned_quantity} sellable</span>
    </div>
    <div class="batch-card-quantities">
      <div><span>Completed</span><strong>${batch.completed_quantity}</strong></div>
      <div><span>Failed</span><strong>${batch.failed_quantity}</strong></div>
      <div><span>Produced</span><strong>${productionTotal}</strong></div>
    </div>
    <div class="batch-card-prices">
      <div><span>Unit cost</span><strong>${formatBatchMoney(batch.unit_cost)}</strong></div>
      <div>
        <span>Suggested price</span><strong>${formatBatchMoney(batch.suggested_price)}</strong>
      </div>
    </div>
    ${batch.notes ? html`<p class="batch-card-notes">${batch.notes}</p>` : null}
  </article>`;
}
