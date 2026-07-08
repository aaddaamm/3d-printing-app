import { h } from "preact";
import htm from "htm";

import type { BatchSummary } from "../lib/api.js";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

export function formatBatchMoney(value: number | null | undefined): string {
  return value == null ? "—" : `$${value.toFixed(2)}`;
}

export function formatBatchMargin(value: number | null | undefined): string {
  return value == null ? "—" : `${Math.round(value * 100)}%`;
}

export function formatBatchTime(seconds: number | null | undefined): string {
  if (seconds == null) return "—";
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  return `${(seconds / 3600).toFixed(1)} h`;
}

export function batchMarginClass(value: number | null | undefined): string {
  if (value == null) return "batch-margin batch-margin--unknown";
  if (value >= 0.45) return "batch-margin batch-margin--good";
  if (value >= 0.25) return "batch-margin batch-margin--ok";
  return "batch-margin batch-margin--low";
}

function PriceMetric({ label, value }: { label: string; value: string }) {
  return html`<div class="batch-price-metric"><span>${label}</span><strong>${value}</strong></div>`;
}

export function BatchPriceBreakdown({ batch }: { batch: BatchSummary }) {
  return html`<div class="batch-price-breakdown" aria-label="Batch price breakdown">
    <${PriceMetric} label="Unit cost" value=${formatBatchMoney(batch.unit_cost)} />
    <${PriceMetric} label="Suggested" value=${formatBatchMoney(batch.suggested_price)} />
    <${PriceMetric} label="Margin" value=${formatBatchMargin(batch.estimated_margin_pct)} />
    <${PriceMetric}
      label="Material"
      value=${batch.total_filament_g == null ? "—" : `${batch.total_filament_g.toFixed(1)} g`}
    />
    <${PriceMetric} label="Print time" value=${formatBatchTime(batch.total_print_time_s)} />
  </div>`;
}
