// ── Helpers ──────────────────────────────────────────────────────────────────

export function fmtTime(s) {
  if (!s) return '—';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h === 0 ? `${m}m` : `${h}h${m > 0 ? ` ${m}m` : ''}`;
}

export function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso), now = new Date();
  const opts = d.getFullYear() === now.getFullYear()
    ? { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }
    : { month: 'short', day: 'numeric', year: '2-digit', hour: 'numeric', minute: '2-digit' };
  return d.toLocaleString(undefined, opts);
}

export function fmtDateShort(iso) {
  if (!iso) return '—';
  const d = new Date(iso), now = new Date();
  const opts = d.getFullYear() === now.getFullYear()
    ? { month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: '2-digit' };
  return d.toLocaleDateString(undefined, opts);
}

export function fmtCurrency(n) {
  return '$' + n.toFixed(2);
}

export function fmtWeight(g) {
  if (g == null) return '—';
  return g >= 1000 ? `${(g / 1000).toFixed(2)} kg` : `${g.toFixed(1)} g`;
}

export function fmtWeightTotal(g) {
  if (!g) return '0 g';
  return g >= 1000 ? `${(g / 1000).toFixed(2)} kg` : `${Math.round(g)} g`;
}
