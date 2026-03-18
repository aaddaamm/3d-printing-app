// ── Atoms ────────────────────────────────────────────────────────────────────

import { h } from 'https://esm.sh/preact@10';
import { useState } from 'https://esm.sh/preact@10/hooks';
import htm from 'https://esm.sh/htm@3';

const html = htm.bind(h);

export const BADGE_CLS = {
  finish:  'badge badge-finish',
  running: 'badge badge-running',
  failed:  'badge badge-failed',
  cancel:  'badge badge-cancel',
  pause:   'badge badge-pause',
};

export function Badge({ status }) {
  const s = (status || '').toLowerCase();
  return html`<span class=${BADGE_CLS[s] || 'badge badge-default'}>${s || 'unknown'}</span>`;
}

export function RowThumb({ url }) {
  const [err, setErr] = useState(false);
  if (!url || err) return html`<div class="row-thumb-ph">🖨</div>`;
  return html`<img class="row-thumb" src=${url} alt="" loading="lazy" onError=${() => setErr(true)} />`;
}

export function CoverImg({ url, className }) {
  const [err, setErr] = useState(false);
  if (!url || err) return html`<div class="cover-placeholder">🖨</div>`;
  return html`<img class=${className} src=${url} alt="" loading="lazy" onError=${() => setErr(true)} />`;
}

export function FilamentSwatches({ colors }) {
  if (!colors?.length) return null;
  // Colors are stored as RRGGBBAA — take first 6 chars for CSS; filter pure white (default/unset)
  const hexes = [...new Set(colors.map(c => c.slice(0, 6).toUpperCase()))].filter(c => c !== 'FFFFFF');
  if (!hexes.length) return null;
  return html`<span class="swatches">${hexes.map(h => html`<span class="swatch" style=${'background:#' + h} title=${'#' + h} />`)}</span>`;
}
