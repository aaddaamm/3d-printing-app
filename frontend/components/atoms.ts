// ── Atoms ────────────────────────────────────────────────────────────────────

import { h } from "preact";
import { useState } from "preact/hooks";
import htm from "htm";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

const BADGE_CLS: Record<string, string> = {
  finish: "badge badge-finish",
  running: "badge badge-running",
  failed: "badge badge-failed",
  cancel: "badge badge-cancel",
  pause: "badge badge-pause",
};

export function Badge({ status }: { status?: string | null }) {
  const s = (status || "").toLowerCase();
  return html`<span class=${BADGE_CLS[s] || "badge badge-default"}>${s || "unknown"}</span>`;
}

export function RowThumb({ url }: { url?: string | null }) {
  const [err, setErr] = useState(false);
  if (!url || err) return html`<div class="row-thumb-ph">🖨</div>`;
  return html`<img
    class="row-thumb"
    src=${url}
    alt=""
    loading="lazy"
    onError=${() => setErr(true)}
  />`;
}

export function CoverImg({ url, className }: { url?: string | null; className?: string }) {
  const [err, setErr] = useState(false);
  if (!url || err) return html`<div class="cover-placeholder">🖨</div>`;
  return html`<img
    class=${className}
    src=${url}
    alt=""
    loading="lazy"
    onError=${() => setErr(true)}
  />`;
}

export function FilamentSwatches({ colors }: { colors?: string[] | null }) {
  if (!colors?.length) return null;
  const hexes = [...new Set(colors.map((c) => c.slice(0, 6).toUpperCase()))].filter(
    (c) => c !== "FFFFFF",
  );
  if (!hexes.length) return null;
  return html`<span class="swatches"
    >${hexes.map(
      (hex) => html`<span class="swatch" style=${"background:#" + hex} title=${"#" + hex} />`,
    )}</span
  >`;
}
