// ── Modal ────────────────────────────────────────────────────────────────────

import { h } from 'https://esm.sh/preact@10';
import { useState, useEffect, useCallback } from 'https://esm.sh/preact@10/hooks';
import htm from 'https://esm.sh/htm@3';

import { fmtTime, fmtDate, fmtWeight, fmtCurrency } from './helpers.js';
import { Badge, CoverImg, FilamentSwatches } from './atoms.js';

const html = htm.bind(h);

function PricingSection({ jobId }) {
  const [price, setPrice] = useState(null);   // null = loading, false = unavailable
  useEffect(() => {
    setPrice(null);
    fetch(`/jobs/${jobId}/price`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setPrice(d ?? false))
      .catch(() => setPrice(false));
  }, [jobId]);

  if (price === null) return html`<div class="pricing-row pricing-loading">Loading price…</div>`;
  if (price === false) return html`<div class="pricing-row pricing-na">Pricing not configured</div>`;

  const markup = price.final_price - price.base_price;
  const markupPct = price.base_price > 0 ? Math.round(markup / price.base_price * 100) : 0;

  return html`
    <div class="pricing-box">
      <div class="pricing-row"><span>Material</span><span>${fmtCurrency(price.material_cost)}</span></div>
      <div class="pricing-row"><span>Machine</span><span>${fmtCurrency(price.machine_cost)}</span></div>
      <div class="pricing-row"><span>Labor</span><span>${fmtCurrency(price.labor_cost)}</span></div>
      ${price.extra_labor_cost > 0 && html`
        <div class="pricing-row pricing-extra-labor"><span>Extra labor</span><span>${fmtCurrency(price.extra_labor_cost)}</span></div>
      `}
      <div class="pricing-divider"></div>
      <div class="pricing-row pricing-base"><span>Base</span><span>${fmtCurrency(price.base_price)}</span></div>
      ${markup !== 0 && html`
        <div class="pricing-row pricing-markup">
          <span>Markup</span>
          <span>${markup > 0 ? '+' : ''}${fmtCurrency(markup)} (${markupPct > 0 ? '+' : ''}${markupPct}%)</span>
        </div>
      `}
      <div class="pricing-row pricing-final">
        <span>Final${price.is_override ? html`<span class="override-tag">override</span>` : ''}</span>
        <span>${fmtCurrency(price.final_price)}</span>
      </div>
    </div>
  `;
}

const STATUS_OPTIONS = ['finish', 'failed', 'cancel', 'running', 'pause'];

export function Modal({ job, onClose, onPatch, projects, onJobProjectChange, onJobStatusChange, onJobExtraLaborChange, onNavigateToProject }) {
  const [localCustomer, setLocalCustomer] = useState(job.customer ?? '');
  const [localNotes, setLocalNotes] = useState(job.notes ?? '');
  const [localPriceOverride, setLocalPriceOverride] = useState(
    job.price_override != null ? String(job.price_override) : ''
  );

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleProjectChange = useCallback(e => {
    const val = e.target.value;
    onJobProjectChange(job.id, val === '' ? null : Number(val));
  }, [job.id, onJobProjectChange]);

  const handleStatusChange = useCallback(e => {
    const val = e.target.value;
    onJobStatusChange(job.id, val === '' ? null : val);
  }, [job.id, onJobStatusChange]);

  return html`
    <div class="overlay" onClick=${e => e.target === e.currentTarget && onClose()}>
      <div class="modal">
        <div class="modal-header">
          <h2>${job.designTitle || 'Untitled Job'}</h2>
          <button class="modal-close" onClick=${onClose}>✕</button>
        </div>
        ${job.cover_url && html`<img class="modal-img" src=${job.cover_url} alt="" />`}
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <label>Status</label>
              <div class="detail-val">
                <${Badge} status=${job.status} />
                ${job.status_override && html`<span class="override-tag">override</span>`}
              </div>
            </div>
            <div class="detail-item"><label>Printer</label><div class="detail-val">${job.deviceModel || '—'}</div></div>
            <div class="detail-item"><label>Started</label><div class="detail-val">${fmtDate(job.startTime)}</div></div>
            <div class="detail-item"><label>Duration</label><div class="detail-val">${fmtTime(job.total_time_s)}</div></div>
            <div class="detail-item"><label>Filament</label>
              <div class="detail-val">${fmtWeight(job.total_weight_g)} <${FilamentSwatches} colors=${job.filament_colors} /></div>
            </div>
            <div class="detail-item"><label>Plates</label><div class="detail-val">${job.plate_count ?? '—'}</div></div>
            <div class="detail-item"><label>Print Run</label><div class="detail-val">
              ${job.print_run > 1 ? `Run #${job.print_run} of this design` : '1st print of this design'}
            </div></div>
          </div>
          <${PricingSection} jobId=${job.id} key=${job.id + '-' + job.extra_labor_minutes} />
          <div class="modal-project-row">
            <label class="modal-project-label">Customer</label>
            <input class="modal-project-select" type="text" placeholder="—"
              value=${localCustomer}
              onInput=${e => setLocalCustomer(e.target.value)}
              onBlur=${() => onPatch(job.id, { customer: localCustomer.trim() || null })}
              onKeyDown=${e => e.key === 'Enter' && e.target.blur()} />
          </div>
          <div class="modal-project-row">
            <label class="modal-project-label">Notes</label>
            <textarea class="modal-project-select modal-notes" placeholder="—"
              value=${localNotes}
              onInput=${e => setLocalNotes(e.target.value)}
              onBlur=${() => onPatch(job.id, { notes: localNotes.trim() || null })} />
          </div>
          <div class="modal-project-row">
            <label class="modal-project-label">Price override</label>
            <input class="modal-project-select" type="number" min="0" step="0.01" placeholder="Calculated"
              value=${localPriceOverride}
              onInput=${e => setLocalPriceOverride(e.target.value)}
              onBlur=${() => {
                const v = localPriceOverride === '' ? null : Number(localPriceOverride);
                onPatch(job.id, { price_override: v });
              }}
              onKeyDown=${e => e.key === 'Enter' && e.target.blur()} />
          </div>
          <div class="modal-project-row">
            <label class="modal-project-label">Extra labor (min)</label>
            <input type="number" class="modal-project-select" min="0" step="1"
              placeholder="0"
              value=${job.extra_labor_minutes ?? ''}
              onChange=${e => {
                const v = e.target.value === '' ? null : Number(e.target.value);
                onJobExtraLaborChange(job.id, v);
              }} />
          </div>
          <div class="modal-project-row">
            <label class="modal-project-label">Status override</label>
            <select class="modal-project-select" value=${job.status_override ?? ''} onChange=${handleStatusChange}>
              <option value="">Auto (from printer)</option>
              ${STATUS_OPTIONS.map(s => html`<option key=${s} value=${s}>${s}</option>`)}
            </select>
          </div>
          ${projects && html`
            <div class="modal-project-row">
              <label class="modal-project-label">Project</label>
              <select class="modal-project-select" value=${job.project_id ?? ''} onChange=${handleProjectChange}>
                <option value="">— None —</option>
                ${projects.map(p => html`<option key=${p.id} value=${p.id}>${p.name}</option>`)}
              </select>
              ${job.project_id != null && html`
                <button class="btn-link" onClick=${() => { onClose(); onNavigateToProject(job.project_id); }}>View →</button>
              `}
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}
