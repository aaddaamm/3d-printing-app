import { h } from "preact";
import htm from "htm";

import type { SellabilityLevel } from "../lib/api.js";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

export function sellabilityBadgeClass(level: SellabilityLevel | string | null | undefined): string {
  if (level === "green") return "product-sellability product-sellability--green";
  if (level === "yellow") return "product-sellability product-sellability--yellow";
  return "product-sellability product-sellability--red";
}

export function ProductSellability({
  level,
  label,
  readyToList,
}: {
  level: SellabilityLevel;
  label: string;
  readyToList?: boolean;
}) {
  return html`<span class=${sellabilityBadgeClass(level)} title=${label}>
    <span class="product-sellability-dot" aria-hidden="true"></span>
    ${label}${readyToList ? " · ready" : ""}
  </span>`;
}
