import { h, render, createContext } from 'https://esm.sh/preact@10';
import { useState, useEffect, useMemo, useCallback, useContext } from 'https://esm.sh/preact@10/hooks';
import htm from 'https://esm.sh/htm@3';

const html = htm.bind(h);

// ── Router ───────────────────────────────────────────────────────────────────

const LocationContext = createContext(null);

function RouterProvider({ base, children }) {
  const strip = path => path.startsWith(base) ? path.slice(base.length) || '/' : path;
  const [path, setPath] = useState(() => strip(location.pathname));
  useEffect(() => {
    const onPop = () => setPath(strip(location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const navigate = useCallback(to => {
    history.pushState(null, '', base + (to === '/' ? '' : to));
    setPath(to);
  }, [base]);
  return html`<${LocationContext.Provider} value=${[path, navigate]}>${children}</${LocationContext.Provider}>`;
}

function useLocation() { return useContext(LocationContext); }

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(s) {
  if (!s) return '—';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h === 0 ? `${m}m` : `${h}h${m > 0 ? ` ${m}m` : ''}`;
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso), now = new Date();
  const opts = d.getFullYear() === now.getFullYear()
    ? { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }
    : { month: 'short', day: 'numeric', year: '2-digit', hour: 'numeric', minute: '2-digit' };
  return d.toLocaleString(undefined, opts);
}

function fmtDateShort(iso) {
  if (!iso) return '—';
  const d = new Date(iso), now = new Date();
  const opts = d.getFullYear() === now.getFullYear()
    ? { month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: '2-digit' };
  return d.toLocaleDateString(undefined, opts);
}

function fmtCurrency(n) {
  return '$' + n.toFixed(2);
}

function fmtWeight(g) {
  if (g == null) return '—';
  return g >= 1000 ? `${(g / 1000).toFixed(2)} kg` : `${g.toFixed(1)} g`;
}

function fmtWeightTotal(g) {
  if (!g) return '0 g';
  return g >= 1000 ? `${(g / 1000).toFixed(2)} kg` : `${Math.round(g)} g`;
}

// ── Atoms ────────────────────────────────────────────────────────────────────

const BADGE_CLS = {
  finish:  'badge badge-finish',
  running: 'badge badge-running',
  failed:  'badge badge-failed',
  cancel:  'badge badge-cancel',
  pause:   'badge badge-pause',
};

function Badge({ status }) {
  const s = (status || '').toLowerCase();
  return html`<span class=${BADGE_CLS[s] || 'badge badge-default'}>${s || 'unknown'}</span>`;
}

function RowThumb({ url }) {
  const [err, setErr] = useState(false);
  if (!url || err) return html`<div class="row-thumb-ph">🖨</div>`;
  return html`<img class="row-thumb" src=${url} alt="" loading="lazy" onError=${() => setErr(true)} />`;
}

function CoverImg({ url, className }) {
  const [err, setErr] = useState(false);
  if (!url || err) return html`<div class="cover-placeholder">🖨</div>`;
  return html`<img class=${className} src=${url} alt="" loading="lazy" onError=${() => setErr(true)} />`;
}

function FilamentSwatches({ colors }) {
  if (!colors?.length) return null;
  // Colors are stored as RRGGBBAA — take first 6 chars for CSS; filter pure white (default/unset)
  const hexes = [...new Set(colors.map(c => c.slice(0, 6).toUpperCase()))].filter(c => c !== 'FFFFFF');
  if (!hexes.length) return null;
  return html`<span class="swatches">${hexes.map(h => html`<span class="swatch" style=${'background:#' + h} title=${'#' + h} />`)}</span>`;
}

// ── Header ───────────────────────────────────────────────────────────────────

function Header({ summary }) {
  const [loc, navigate] = useLocation();
  const t = summary?.totals;
  return html`
    <header>
      <div class="header-left">
        <h1>Bambu <span>Print History</span></h1>
        <nav class="top-nav">
          <button class=${'nav-btn' + (!loc.startsWith('/projects') ? ' active' : '')}
            onClick=${() => navigate('/')}>Jobs</button>
          <button class=${'nav-btn' + (loc.startsWith('/projects') ? ' active' : '')}
            onClick=${() => navigate('/projects')}>Projects</button>
        </nav>
      </div>
      <div class="stats">
        <div class="stat">
          <div class="stat-val">${t ? t.total_jobs.toLocaleString() : '—'}</div>
          <div class="stat-lbl">Total Jobs</div>
        </div>
        <div class="stat">
          <div class="stat-val">${t ? (t.total_weight_g / 1000).toFixed(2) : '—'}</div>
          <div class="stat-lbl">Filament kg</div>
        </div>
        <div class="stat">
          <div class="stat-val">${t ? (t.total_time_s / 3600).toFixed(1) : '—'}</div>
          <div class="stat-lbl">Print Hours</div>
        </div>
        <div class="stat">
          <div class="stat-val">${t ? t.total_plates.toLocaleString() : '—'}</div>
          <div class="stat-lbl">Plates</div>
        </div>
      </div>
    </header>
  `;
}

// ── Toolbar ──────────────────────────────────────────────────────────────────

function Toolbar({ q, setQ, statusFilter, setStatusFilter, deviceFilter, setDeviceFilter, devices, view, setView, filteredCount, totalCount }) {
  const csvUrl = useMemo(() => {
    const p = new URLSearchParams();
    if (statusFilter) p.set('status', statusFilter);
    if (deviceFilter) p.set('device', deviceFilter);
    const qs = p.toString();
    return '/jobs/export.csv' + (qs ? '?' + qs : '');
  }, [statusFilter, deviceFilter]);

  return html`
    <div class="toolbar">
      <input type="search" placeholder="Search title or customer…"
        value=${q} onInput=${e => setQ(e.target.value)} />
      <select value=${statusFilter} onChange=${e => setStatusFilter(e.target.value)}>
        <option value="">All Statuses</option>
        <option value="finish">Finished</option>
        <option value="cancel">Cancelled</option>
        <option value="running">Running</option>
        <option value="failed">Failed</option>
        <option value="pause">Paused</option>
      </select>
      <select value=${deviceFilter} onChange=${e => setDeviceFilter(e.target.value)}>
        <option value="">All Printers</option>
        ${devices.map(d => html`<option key=${d} value=${d}>${d}</option>`)}
      </select>
      <div class="view-toggle">
        <button class=${'view-btn' + (view === 'table' ? ' active' : '')}
          onClick=${() => setView('table')}>☰ Table</button>
        <button class=${'view-btn' + (view === 'grid' ? ' active' : '')}
          onClick=${() => setView('grid')}>⊞ Grid</button>
      </div>
      <div class="toolbar-right">
        <a class="btn-csv" href=${csvUrl} download>↓ CSV</a>
        <span class="job-count">${filteredCount} / ${totalCount} jobs</span>
      </div>
    </div>
  `;
}

// ── Totals bar ───────────────────────────────────────────────────────────────

function TotalsBar({ filtered, isFiltered }) {
  if (!isFiltered || !filtered.length) return null;
  const totW = filtered.reduce((s, j) => s + (j.total_weight_g || 0), 0);
  const totT = filtered.reduce((s, j) => s + (j.total_time_s || 0), 0);
  return html`
    <div class="totals-bar">
      <span class="totals-label">Selection</span>
      <span>Jobs: <strong>${filtered.length}</strong></span>
      <span>Filament: <strong>${fmtWeightTotal(totW)}</strong></span>
      <span>Print time: <strong>${fmtTime(totT)}</strong></span>
    </div>
  `;
}

// ── Table ────────────────────────────────────────────────────────────────────

const TABLE_COLS = [
  { col: 'designTitle',    label: 'Title',    cls: 'sortable td-title' },
  { col: 'deviceModel',    label: 'Printer',  cls: 'sortable' },
  { col: 'startTime',      label: 'Date',     cls: 'sortable' },
  { col: null,             label: 'Status',   cls: '' },
  { col: 'total_weight_g', label: 'Filament', cls: 'sortable td-num' },
  { col: 'total_time_s',   label: 'Time',     cls: 'sortable td-num' },
  { col: 'final_price',    label: 'Price',    cls: 'sortable td-num' },
  { col: null,             label: 'Plates',   cls: 'td-num' },
  { col: null,             label: 'Customer', cls: '' },
];

function JobRow({ job, onJobClick }) {
  return html`
    <tr onClick=${() => onJobClick(job)}>
      <td class="td-thumb"><${RowThumb} url=${job.cover_url} /></td>
      <td class="td-title">
        <span class="row-title" title=${job.designTitle || 'Untitled'}>
          ${job.designTitle || 'Untitled Job'}
        </span>
        ${job.print_run > 1 && html`<span class="run-badge">Run ${job.print_run}</span>`}
        <${FilamentSwatches} colors=${job.filament_colors} />
      </td>
      <td>${job.deviceModel || '—'}</td>
      <td title=${fmtDate(job.startTime)}>${fmtDateShort(job.startTime)}</td>
      <td><${Badge} status=${job.status} /></td>
      <td class="td-num"><strong>${fmtWeight(job.total_weight_g)}</strong></td>
      <td class="td-num">${fmtTime(job.total_time_s)}</td>
      <td class="td-num">${job.final_price != null ? html`<strong>${fmtCurrency(job.final_price)}</strong>` : '—'}</td>
      <td class="td-num">${job.plate_count ?? '—'}</td>
      <td>${job.customer && html`<span class="customer-pill">${job.customer}</span>`}</td>
    </tr>
  `;
}

function TableView({ sorted, sortCol, sortDir, onSort, onJobClick }) {
  return html`
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th class="td-thumb"></th>
            ${TABLE_COLS.map(({ col, label, cls }) => {
              const active = col && col === sortCol;
              const thCls = [cls, active ? `sort-${sortDir}` : ''].filter(Boolean).join(' ');
              return html`
                <th key=${label} class=${thCls || undefined}
                  onClick=${col ? () => onSort(col) : undefined}>${label}</th>
              `;
            })}
          </tr>
        </thead>
        <tbody>
          ${sorted.map(job => html`<${JobRow} key=${job.id} job=${job} onJobClick=${onJobClick} />`)}
        </tbody>
      </table>
    </div>
  `;
}

// ── Grid ─────────────────────────────────────────────────────────────────────

function JobCard({ job, onJobClick }) {
  return html`
    <div class="card" onClick=${() => onJobClick(job)}>
      <${CoverImg} url=${job.cover_url} className="cover" />
      <div class="card-body">
        <div class="card-title">${job.designTitle || 'Untitled Job'}</div>
        <div class="card-meta">
          <span>🖨 ${job.deviceModel || '—'}</span>
          <span>📅 ${fmtDateShort(job.startTime)}</span>
          <span>⏱ ${fmtTime(job.total_time_s)}</span>
          <span>🧵 ${fmtWeight(job.total_weight_g)}</span>
          ${job.final_price != null && html`<span>💰 ${fmtCurrency(job.final_price)}</span>`}
        </div>
        <div class="card-footer">
          <${Badge} status=${job.status} />
          ${job.print_run > 1 && html`<span class="run-badge">Run ${job.print_run}</span>`}
          ${job.customer && html`<span class="customer-pill">${job.customer}</span>`}
          <${FilamentSwatches} colors=${job.filament_colors} />
        </div>
      </div>
    </div>
  `;
}

function GridView({ sorted, onJobClick }) {
  return html`
    <div class="grid-view">
      ${sorted.map(job => html`<${JobCard} key=${job.id} job=${job} onJobClick=${onJobClick} />`)}
    </div>
  `;
}

// ── Modal ────────────────────────────────────────────────────────────────────

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

function Modal({ job, onClose, onPatch, projects, onJobProjectChange, onJobStatusChange, onJobExtraLaborChange, onNavigateToProject }) {
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

// ── Projects view ─────────────────────────────────────────────────────────────

function NewProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [customer, setCustomer] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = useCallback(async e => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), customer: customer || null, notes: notes || null }),
      });
      const data = await res.json();
      if (res.ok) { onCreate(data.project); onClose(); }
    } finally {
      setSaving(false);
    }
  }, [name, customer, notes, onCreate, onClose]);

  return html`
    <div class="overlay" onClick=${e => e.target === e.currentTarget && onClose()}>
      <div class="modal">
        <div class="modal-header">
          <h2>New Project</h2>
          <button class="modal-close" onClick=${onClose}>✕</button>
        </div>
        <div class="modal-body">
          <form class="project-form" onSubmit=${handleSubmit}>
            <label class="form-label">Name *
              <input class="form-input" type="text" value=${name}
                onInput=${e => setName(e.target.value)} placeholder="Project name" required />
            </label>
            <label class="form-label">Customer
              <input class="form-input" type="text" value=${customer}
                onInput=${e => setCustomer(e.target.value)} placeholder="Optional" />
            </label>
            <label class="form-label">Notes
              <textarea class="form-input form-textarea" value=${notes}
                onInput=${e => setNotes(e.target.value)} placeholder="Optional" />
            </label>
            <div class="form-actions">
              <button type="button" class="btn-secondary" onClick=${onClose}>Cancel</button>
              <button type="submit" class="btn-primary" disabled=${saving || !name.trim()}>
                ${saving ? 'Creating…' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

function ProjectCard({ project, totalPrice, onClick }) {
  const totalW = project.total_weight_g;
  const totalT = project.total_time_s;
  return html`
    <div class="proj-card" onClick=${onClick}>
      ${project.cover_url
        ? html`<img class="proj-card-cover" src=${project.cover_url} alt="" />`
        : html`<div class="proj-card-cover proj-card-cover--empty">🖨️</div>`}
      <div class="proj-card-name">${project.name}</div>
      <div class="proj-card-meta">
        ${project.customer && html`<span class="customer-pill">${project.customer}</span>`}
        ${totalPrice != null && html`<span class="proj-card-price">${fmtCurrency(totalPrice)}</span>`}
      </div>
      <div class="proj-card-stats">
        <span><strong>${project.job_count}</strong> job${project.job_count !== 1 ? 's' : ''}</span>
        ${totalW != null && html`<span>${fmtWeightTotal(totalW)}</span>`}
        ${totalT != null && html`<span>${fmtTime(totalT)}</span>`}
      </div>
      ${project.notes && html`<div class="proj-card-notes">${project.notes}</div>`}
    </div>
  `;
}

function AddJobsModal({ unassignedJobs, onClose, onAdd }) {
  const [q, setQ] = useState('');
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);
  const filtered = useMemo(() => {
    if (!q) return unassignedJobs;
    const lc = q.toLowerCase();
    return unassignedJobs.filter(j =>
      ((j.designTitle || '') + ' ' + (j.customer || '')).toLowerCase().includes(lc)
    );
  }, [unassignedJobs, q]);
  return html`
    <div class="overlay" onClick=${e => e.target === e.currentTarget && onClose()}>
      <div class="modal">
        <div class="modal-header">
          <h2>Add Jobs to Project</h2>
          <button class="modal-close" onClick=${onClose}>✕</button>
        </div>
        <div class="modal-body">
          <input type="search" class="add-jobs-search" placeholder="Search…"
            value=${q} onInput=${e => setQ(e.target.value)} />
          ${filtered.length === 0
            ? html`<div class="empty" style="padding:16px 0">${q ? 'No matches.' : 'All jobs are already assigned to projects.'}</div>`
            : html`<div class="add-jobs-list">
              ${filtered.map(job => html`
                <div class="add-jobs-row" key=${job.id} onClick=${() => onAdd(job.id)}>
                  <${RowThumb} url=${job.cover_url} />
                  <div class="add-jobs-info">
                    <div class="add-jobs-title">${job.designTitle || 'Untitled Job'}</div>
                    <div class="add-jobs-meta">${fmtDateShort(job.startTime)} · ${job.deviceModel || '—'}</div>
                  </div>
                  <button class="btn-primary add-jobs-btn">Add</button>
                </div>
              `)}
            </div>`
          }
        </div>
      </div>
    </div>
  `;
}

function ProjectDetail({ project, jobs, unassignedJobs, onBack, onDelete, onJobClick, onAddJob, onRemoveJob }) {
  const [showAddJobs, setShowAddJobs] = useState(false);
  const [price, setPrice] = useState(null);
  const totW = jobs.reduce((s, j) => s + (j.total_weight_g || 0), 0);
  const totT = jobs.reduce((s, j) => s + (j.total_time_s || 0), 0);

  useEffect(() => {
    setPrice(null);
    if (!jobs.length) return;
    fetch(`/projects/${project.id}/price`).then(r => r.json()).then(setPrice).catch(() => {});
  }, [project.id, jobs.length]);

  const handleDelete = useCallback(async () => {
    if (!confirm(`Delete project "${project.name}"? Jobs will be unassigned but not deleted.`)) return;
    await fetch(`/projects/${project.id}`, { method: 'DELETE' });
    onDelete(project.id);
  }, [project, onDelete]);

  const handleAdd = useCallback(jobId => {
    onAddJob(jobId);
  }, [onAddJob]);

  return html`
    <div class="proj-detail">
      <div class="proj-detail-header">
        <button class="btn-back" onClick=${onBack}>← Projects</button>
        <div class="proj-detail-title">
          <h2>${project.name}</h2>
          ${project.customer && html`<span class="customer-pill">${project.customer}</span>`}
        </div>
        <button class="btn-secondary" onClick=${() => setShowAddJobs(true)}>+ Add Jobs</button>
        <button class="btn-danger" onClick=${handleDelete}>Delete</button>
      </div>
      ${project.notes && html`<div class="proj-detail-notes">${project.notes}</div>`}
      <div class="totals-bar">
        <span class="totals-label">Project</span>
        <span>Jobs: <strong>${jobs.length}</strong></span>
        <span>Filament: <strong>${fmtWeightTotal(totW)}</strong></span>
        <span>Print time: <strong>${fmtTime(totT)}</strong></span>
        ${price && html`
          <span>Material: <strong>${fmtCurrency(price.material_cost)}</strong></span>
          <span>Machine: <strong>${fmtCurrency(price.machine_cost)}</strong></span>
          <span>Labor: <strong>${fmtCurrency(price.labor_cost)}</strong></span>
          ${price.extra_labor_cost > 0 && html`<span>Extra labor: <strong>${fmtCurrency(price.extra_labor_cost)}</strong></span>`}
          <span class="totals-total">Total: <strong>${fmtCurrency(price.final_price)}</strong></span>
        `}
      </div>
      ${jobs.length === 0
        ? html`<div class="empty">No jobs assigned yet. Use "+ Add Jobs" to assign them.</div>`
        : html`
          <div class="table-wrap">
            <table>
              <thead><tr>
                <th class="td-thumb"></th>
                <th>Title</th>
                <th>Printer</th>
                <th>Date</th>
                <th>Status</th>
                <th class="td-num">Filament</th>
                <th class="td-num">Time</th>
                <th class="td-num">Price</th>
                <th></th>
              </tr></thead>
              <tbody>
                ${jobs.map(job => html`
                  <tr key=${job.id} onClick=${() => onJobClick(job)}>
                    <td class="td-thumb"><${RowThumb} url=${job.cover_url} /></td>
                    <td class="td-title"><span class="row-title">${job.designTitle || 'Untitled Job'}</span></td>
                    <td>${job.deviceModel || '—'}</td>
                    <td title=${fmtDate(job.startTime)}>${fmtDateShort(job.startTime)}</td>
                    <td><${Badge} status=${job.status} /></td>
                    <td class="td-num"><strong>${fmtWeight(job.total_weight_g)}</strong></td>
                    <td class="td-num">${fmtTime(job.total_time_s)}</td>
                    <td class="td-num">${job.final_price != null ? html`<strong>${fmtCurrency(job.final_price)}</strong>` : '—'}</td>
                    <td><button class="btn-remove-job" title="Remove from project"
                      onClick=${e => { e.stopPropagation(); onRemoveJob(job.id); }}>×</button></td>
                  </tr>
                `)}
              </tbody>
            </table>
          </div>
        `
      }
      ${showAddJobs && html`<${AddJobsModal}
        unassignedJobs=${unassignedJobs}
        onClose=${() => setShowAddJobs(false)}
        onAdd=${handleAdd}
      />`}
    </div>
  `;
}

function ProjectsView({ projects, setProjects, onAutoGroup, projectPrices }) {
  const [showNew, setShowNew] = useState(false);
  const [grouping, setGrouping] = useState(false);
  const [q, setQ] = useState('');
  const [, navigate] = useLocation();

  const handleAutoGroup = useCallback(async () => {
    setGrouping(true);
    try {
      const res = await fetch('/projects/auto-group', { method: 'POST' });
      const { projects_created, jobs_assigned } = await res.json();
      await onAutoGroup();
      if (projects_created === 0) {
        alert('No ungrouped jobs found — everything is already assigned to a project.');
      } else {
        alert(`Created ${projects_created} project${projects_created !== 1 ? 's' : ''}, assigned ${jobs_assigned} job${jobs_assigned !== 1 ? 's' : ''}.`);
      }
    } finally {
      setGrouping(false);
    }
  }, [onAutoGroup]);

  const handleCreate = useCallback(project => {
    setProjects(ps => [project, ...ps]);
    navigate(`/projects/${project.id}`);
  }, [setProjects, navigate]);

  const filtered = useMemo(() => {
    if (!q) return projects;
    const lc = q.toLowerCase();
    return projects.filter(p =>
      [p.name, p.customer, p.notes].filter(Boolean).join(' ').toLowerCase().includes(lc)
    );
  }, [projects, q]);

  return html`
    <div class="proj-list-header">
      <input type="search" class="proj-search" placeholder="Search projects…"
        value=${q} onInput=${e => setQ(e.target.value)} />
      <span class="proj-list-count">
        ${q ? `${filtered.length} of ${projects.length}` : projects.length}
        ${' '}project${projects.length !== 1 ? 's' : ''}
      </span>
      <button class="btn-secondary" onClick=${handleAutoGroup} disabled=${grouping}>
        ${grouping ? 'Grouping…' : '⚡ Auto-group by design'}
      </button>
      <button class="btn-primary" onClick=${() => setShowNew(true)}>+ New Project</button>
    </div>
    ${filtered.length === 0
      ? html`<div class="empty">${q ? 'No projects match your search.' : 'No projects yet. Create one to group related jobs together.'}</div>`
      : html`
        <div class="proj-grid">
          ${filtered.map(p => html`<${ProjectCard} key=${p.id} project=${p} totalPrice=${projectPrices[p.id] ?? null} onClick=${() => navigate(`/projects/${p.id}`)} />`)}
        </div>
      `
    }
    ${showNew && html`<${NewProjectModal} onClose=${() => setShowNew(false)} onCreate=${handleCreate} />`}
  `;
}

// ── App ──────────────────────────────────────────────────────────────────────

function App() {
  const [jobs, setJobs]                 = useState([]);
  const [projects, setProjects]         = useState([]);
  const [projectPrices, setProjectPrices] = useState({});
  const [summary, setSummary]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [, navigate]            = useLocation();

  const [view, setView]                 = useState('table');
  const [q, setQ]                       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('');
  const [sortCol, setSortCol]           = useState('startTime');
  const [sortDir, setSortDir]           = useState('desc');
  const [selectedJob, setSelectedJob]   = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/ui/data').then(r => r.json()),
      fetch('/summary').then(r => r.json()),
      fetch('/projects').then(r => r.json()),
    ]).then(([data, sum, proj]) => {
      setJobs(data.jobs);
      setSummary(sum);
      setProjects(proj.projects);
      setLoading(false);
      // Prices fetched separately — won't block the UI if pricing isn't configured
      fetch('/jobs/prices').then(r => r.json()).then(({ prices }) => {
        setJobs(js => js.map(j => ({ ...j, final_price: prices[j.id] ?? null })));
      }).catch(() => {});
      fetch('/projects/prices').then(r => r.json()).then(({ prices }) => {
        setProjectPrices(prices);
      }).catch(() => {});
    }).catch(err => {
      setError(err.message);
      setLoading(false);
    });
  }, []);

  const devices = useMemo(() =>
    [...new Set(jobs.map(j => j.deviceModel).filter(Boolean))].sort(),
  [jobs]);

  const isFiltered = !!(q || statusFilter || deviceFilter);

  const filtered = useMemo(() => jobs.filter(j => {
    const text = ((j.designTitle || '') + ' ' + (j.customer || '')).toLowerCase();
    if (q && !text.includes(q.toLowerCase())) return false;
    if (statusFilter && (j.status || '').toLowerCase() !== statusFilter) return false;
    if (deviceFilter && j.deviceModel !== deviceFilter) return false;
    return true;
  }), [jobs, q, statusFilter, deviceFilter]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    let av = a[sortCol], bv = b[sortCol];
    if (av == null) av = sortDir === 'asc' ? Infinity : -Infinity;
    if (bv == null) bv = sortDir === 'asc' ? Infinity : -Infinity;
    if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    return sortDir === 'asc' ? av - bv : bv - av;
  }), [filtered, sortCol, sortDir]);

  const handleSort = useCallback(col => {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir(col === 'startTime' ? 'desc' : 'asc');
    }
  }, [sortCol]);

  const closeModal = useCallback(() => setSelectedJob(null), []);

  // Generic job patch helper — updates local state from the returned job
  const patchJob = useCallback(async (jobId, fields) => {
    const res = await fetch(`/jobs/${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    });
    if (!res.ok) return;
    const { job } = await res.json();
    setJobs(js => js.map(j => j.id === jobId ? { ...j, ...job } : j));
    setSelectedJob(j => j && j.id === jobId ? { ...j, ...job } : j);
    return job;
  }, []);

  const handleJobProjectChange = useCallback(async (jobId, projectId) => {
    await patchJob(jobId, { project_id: projectId });
    // Refresh project stats and prices (job counts / totals changed)
    fetch('/projects').then(r => r.json()).then(d => setProjects(d.projects));
    fetch('/projects/prices').then(r => r.json()).then(({ prices }) => setProjectPrices(prices)).catch(() => {});
  }, [patchJob]);

  const handleJobStatusChange = useCallback((jobId, statusOverride) => {
    patchJob(jobId, { status_override: statusOverride });
  }, [patchJob]);

  const handleJobExtraLaborChange = useCallback((jobId, minutes) => {
    patchJob(jobId, { extra_labor_minutes: minutes });
  }, [patchJob]);

  const handleNavigateToProject = useCallback(projectId => {
    setSelectedJob(null);
    navigate(`/projects/${projectId}`);
  }, [navigate]);

  const handleDeleteProject = useCallback(id => {
    setProjects(ps => ps.filter(p => p.id !== id));
    setJobs(js => js.map(j => j.project_id === id ? { ...j, project_id: null } : j));
    navigate('/projects');
  }, [navigate]);

  const handleAutoGroup = useCallback(async () => {
    const [jobsData, projData] = await Promise.all([
      fetch('/ui/data').then(r => r.json()),
      fetch('/projects').then(r => r.json()),
    ]);
    setJobs(jobsData.jobs);
    setProjects(projData.projects);
    fetch('/jobs/prices').then(r => r.json()).then(({ prices }) => {
      setJobs(js => js.map(j => ({ ...j, final_price: prices[j.id] ?? j.final_price ?? null })));
    }).catch(() => {});
    fetch('/projects/prices').then(r => r.json()).then(({ prices }) => setProjectPrices(prices)).catch(() => {});
  }, []);

  if (loading) return html`<div class="loading"><div class="spinner"></div>Loading print jobs…</div>`;
  if (error)   return html`<div class="loading"><span style="color:var(--red)">Failed to load: ${error}</span></div>`;

  const [loc] = useLocation();
  const projectDetailMatch = loc.match(/^\/projects\/(\d+)$/);
  const isProjects = loc.startsWith('/projects');

  const renderMain = () => {
    if (projectDetailMatch) {
      const id = Number(projectDetailMatch[1]);
      const project = projects.find(p => p.id === id);
      const projectJobs = jobs.filter(j => j.project_id === id);
      if (!project) return html`<div class="empty">Project not found.</div>`;
      const unassignedJobs = jobs.filter(j => j.project_id == null);
      return html`<${ProjectDetail}
        project=${project}
        jobs=${projectJobs}
        unassignedJobs=${unassignedJobs}
        onBack=${() => navigate('/projects')}
        onDelete=${handleDeleteProject}
        onJobClick=${setSelectedJob}
        onAddJob=${(jobId) => handleJobProjectChange(jobId, id)}
        onRemoveJob=${(jobId) => handleJobProjectChange(jobId, null)}
      />`;
    }
    if (isProjects) {
      return html`<${ProjectsView} projects=${projects} setProjects=${setProjects} onAutoGroup=${handleAutoGroup} projectPrices=${projectPrices} />`;
    }
    return html`
      <${Toolbar}
        q=${q} setQ=${setQ}
        statusFilter=${statusFilter} setStatusFilter=${setStatusFilter}
        deviceFilter=${deviceFilter} setDeviceFilter=${setDeviceFilter}
        devices=${devices}
        view=${view} setView=${setView}
        filteredCount=${filtered.length} totalCount=${jobs.length}
      />
      <${TotalsBar} filtered=${filtered} isFiltered=${isFiltered} />
      ${sorted.length === 0
        ? html`<div class="empty">No jobs match your filters.</div>`
        : view === 'table'
          ? html`<${TableView} sorted=${sorted} sortCol=${sortCol} sortDir=${sortDir} onSort=${handleSort} onJobClick=${setSelectedJob} />`
          : html`<${GridView} sorted=${sorted} onJobClick=${setSelectedJob} />`
      }
    `;
  };

  return html`
    <${Header} summary=${summary} />
    ${renderMain()}
    ${selectedJob && html`<${Modal}
      key=${selectedJob.id}
      job=${selectedJob} onClose=${closeModal}
      onPatch=${patchJob}
      projects=${projects} onJobProjectChange=${handleJobProjectChange}
      onJobStatusChange=${handleJobStatusChange}
      onJobExtraLaborChange=${handleJobExtraLaborChange}
      onNavigateToProject=${handleNavigateToProject}
    />`}
  `;
}

render(html`<${RouterProvider} base="/ui"><${App} /></${RouterProvider}>`, document.getElementById('app'));
