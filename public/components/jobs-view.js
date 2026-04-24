// ── Jobs view — Header, Toolbar, TotalsBar, Table, Grid ──────────────────────

import { h } from 'https://esm.sh/preact@10';
import { useMemo } from 'https://esm.sh/preact@10/hooks';
import htm from 'https://esm.sh/htm@3';

import { fmtTime, fmtDate, fmtDateShort, fmtCurrency, fmtWeight, fmtWeightTotal } from './helpers.js';
import { Badge, RowThumb, CoverImg, FilamentSwatches } from './atoms.js';
import { useLocation } from './router.js';

const html = htm.bind(h);

// ── Header ───────────────────────────────────────────────────────────────────

export function Header({ summary }) {
  const [loc, navigate] = useLocation();
  const t = summary?.totals;
  return html`
    <header>
      <div class="header-left">
        <h1><span class="brand-cursor" aria-hidden="true"></span><span>bambu history</span></h1>
        <nav class="top-nav">
          <button class=${'nav-btn' + (!loc.startsWith('/projects') && !loc.startsWith('/admin') ? ' active' : '')}
            onClick=${() => navigate('/')}>Jobs</button>
          <button class=${'nav-btn' + (loc.startsWith('/projects') ? ' active' : '')}
            onClick=${() => navigate('/projects')}>Projects</button>
          <button class=${'nav-btn' + (loc.startsWith('/admin') ? ' active' : '')}
            onClick=${() => navigate('/admin')}>Rates</button>
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

export function Toolbar({ q, setQ, statusFilter, setStatusFilter, deviceFilter, setDeviceFilter, devices, view, setView, filteredCount, totalCount }) {
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

export function TotalsBar({ filtered, isFiltered }) {
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

export function TableView({ sorted, sortCol, sortDir, onSort, onJobClick }) {
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

export function GridView({ sorted, onJobClick }) {
  return html`
    <div class="grid-view">
      ${sorted.map(job => html`<${JobCard} key=${job.id} job=${job} onJobClick=${onJobClick} />`)}
    </div>
  `;
}
