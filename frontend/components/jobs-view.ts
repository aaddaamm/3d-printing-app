// ── Jobs view — Header, Toolbar, TotalsBar, Table, Grid ──────────────────────

import { h } from "preact";
import { useMemo } from "preact/hooks";
import htm from "htm";

import {
  fmtTime,
  fmtDate,
  fmtDateShort,
  fmtCurrency,
  fmtWeight,
  fmtWeightTotal,
} from "./helpers.js";
import { Badge, RowThumb, CoverImg, FilamentSwatches } from "./atoms.js";
import { useLocation } from "./router.js";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

type Job = {
  id: number;
  designTitle?: string;
  customer?: string | null;
  status?: string;
  deviceModel?: string;
  startTime?: string;
  total_weight_g?: number | null;
  total_time_s?: number | null;
  final_price?: number | null;
  plate_count?: number | null;
  print_run?: number;
  cover_url?: string | null;
  filament_colors?: string[];
};

type DeviceSummary = {
  deviceModel?: string | null;
  total_jobs?: number;
  total_plates?: number | null;
  total_time_s?: number | null;
};

type Summary = {
  totals?: Record<string, number> | null;
  by_device?: DeviceSummary[];
} | null;
type DataRange = { min_start?: string; max_start?: string; task_count?: number } | null;

function metricBreakdownTitle(summary: Summary, metric: "jobs" | "plates" | "hours") {
  const rows = summary?.by_device ?? [];
  if (!rows.length) return "No printer breakdown available";
  const lines = rows.map((row) => {
    const label = row.deviceModel || "Unknown printer";
    if (metric === "jobs") return `${label}: ${(row.total_jobs ?? 0).toLocaleString()} jobs`;
    if (metric === "plates") return `${label}: ${(row.total_plates ?? 0).toLocaleString()} plates`;
    return `${label}: ${((row.total_time_s ?? 0) / 3600).toFixed(1).toLocaleString()} h`;
  });
  return lines.join("\n");
}

export function Header({ summary, dataRange }: { summary: Summary; dataRange: DataRange }) {
  const [loc, navigate] = useLocation();
  const t = summary?.totals;
  return html`
    <header>
      <div class="header-left">
        <h1><span class="brand-cursor" aria-hidden="true"></span><span>bambu history</span></h1>
        ${dataRange?.min_start &&
        dataRange?.max_start &&
        html`
          <div class="header-range">
            History: ${fmtDateShort(dataRange.min_start)} → ${fmtDateShort(dataRange.max_start)}
            (${(dataRange.task_count || 0).toLocaleString()} tasks)
          </div>
        `}
        <nav class="top-nav">
          <button
            class=${"nav-btn" +
            (!loc.startsWith("/projects") && !loc.startsWith("/admin") ? " active" : "")}
            onClick=${() => navigate("/")}
          >
            Jobs
          </button>
          <button
            class=${"nav-btn" + (loc.startsWith("/projects") ? " active" : "")}
            onClick=${() => navigate("/projects")}
          >
            Projects
          </button>
          <button
            class=${"nav-btn" + (loc.startsWith("/printers") ? " active" : "")}
            onClick=${() => navigate("/printers")}
          >
            Printers
          </button>
          <button
            class=${"nav-btn" + (loc.startsWith("/admin") ? " active" : "")}
            onClick=${() => navigate("/admin")}
          >
            Rates
          </button>
        </nav>
      </div>
      <div class="stats">
        <div class="stat" title=${metricBreakdownTitle(summary, "jobs")}>
          <div class="stat-val">${t ? t.total_jobs?.toLocaleString() : "—"}</div>
          <div class="stat-lbl">Total Jobs</div>
        </div>
        <div class="stat">
          <div class="stat-val">${t ? ((t.total_weight_g ?? 0) / 1000).toFixed(2) : "—"}</div>
          <div class="stat-lbl">Filament kg</div>
        </div>
        <div class="stat" title=${metricBreakdownTitle(summary, "hours")}>
          <div class="stat-val">${t ? ((t.total_time_s ?? 0) / 3600).toFixed(1) : "—"}</div>
          <div class="stat-lbl">Print Hours</div>
        </div>
        <div class="stat" title=${metricBreakdownTitle(summary, "plates")}>
          <div class="stat-val">${t ? t.total_plates?.toLocaleString() : "—"}</div>
          <div class="stat-lbl">Plates</div>
        </div>
      </div>
    </header>
  `;
}

export function Toolbar({
  q,
  setQ,
  statusFilter,
  setStatusFilter,
  deviceFilter,
  setDeviceFilter,
  devices,
  view,
  setView,
  filteredCount,
  totalCount,
}: {
  q: string;
  setQ: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  deviceFilter: string;
  setDeviceFilter: (v: string) => void;
  devices: string[];
  view: string;
  setView: (v: string) => void;
  filteredCount: number;
  totalCount: number;
}) {
  const csvUrl = useMemo(() => {
    const p = new URLSearchParams();
    if (statusFilter) p.set("status", statusFilter);
    if (deviceFilter) p.set("device", deviceFilter);
    const qs = p.toString();
    return "/jobs/export.csv" + (qs ? "?" + qs : "");
  }, [statusFilter, deviceFilter]);

  return html`
    <div class="toolbar">
      <input
        type="search"
        placeholder="Search title or customer…"
        value=${q}
        onInput=${(e: Event) => setQ((e.target as HTMLInputElement).value)}
      />
      <select
        value=${statusFilter}
        onChange=${(e: Event) => setStatusFilter((e.target as HTMLSelectElement).value)}
      >
        <option value="">All Statuses</option>
        <option value="finish">Finished</option>
        <option value="cancel">Cancelled</option>
        <option value="running">Running</option>
        <option value="failed">Failed</option>
        <option value="pause">Paused</option>
      </select>
      <select
        value=${deviceFilter}
        onChange=${(e: Event) => setDeviceFilter((e.target as HTMLSelectElement).value)}
      >
        <option value="">All Printers</option>
        ${devices.map((d) => html`<option key=${d} value=${d}>${d}</option>`)}
      </select>
      <div class="view-toggle">
        <button
          class=${"view-btn" + (view === "table" ? " active" : "")}
          onClick=${() => setView("table")}
        >
          ☰ Table
        </button>
        <button
          class=${"view-btn" + (view === "grid" ? " active" : "")}
          onClick=${() => setView("grid")}
        >
          ⊞ Grid
        </button>
      </div>
      <div class="toolbar-right">
        <a class="btn-csv" href=${csvUrl} download>↓ CSV</a>
        <span class="job-count">${filteredCount} / ${totalCount} jobs</span>
      </div>
    </div>
  `;
}

export function PrinterBreakdownView({ summary }: { summary: Summary }) {
  const rows = summary?.by_device ?? [];
  if (!rows.length) return html`<div class="empty">No printer totals available yet.</div>`;

  return html`
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Printer</th>
            <th class="td-num">Jobs</th>
            <th class="td-num">Plates</th>
            <th class="td-num">Print Hours</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(
            (row) => html`
              <tr key=${row.deviceModel || "unknown"}>
                <td>${row.deviceModel || "Unknown printer"}</td>
                <td class="td-num"><strong>${(row.total_jobs ?? 0).toLocaleString()}</strong></td>
                <td class="td-num">${(row.total_plates ?? 0).toLocaleString()}</td>
                <td class="td-num">${((row.total_time_s ?? 0) / 3600).toFixed(1)} h</td>
              </tr>
            `,
          )}
        </tbody>
      </table>
    </div>
  `;
}

export function TotalsBar({ filtered, isFiltered }: { filtered: Job[]; isFiltered: boolean }) {
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

const TABLE_COLS: Array<{ col: string | null; label: string; cls: string }> = [
  { col: "designTitle", label: "Title", cls: "sortable td-title" },
  { col: "deviceModel", label: "Printer", cls: "sortable" },
  { col: "startTime", label: "Date", cls: "sortable" },
  { col: null, label: "Status", cls: "" },
  { col: "total_weight_g", label: "Filament", cls: "sortable td-num" },
  { col: "total_time_s", label: "Time", cls: "sortable td-num" },
  { col: "final_price", label: "Price", cls: "sortable td-num" },
  { col: null, label: "Plates", cls: "td-num" },
  { col: null, label: "Customer", cls: "" },
];

function JobRow({ job, onJobClick }: { job: Job; onJobClick: (job: Job) => void }) {
  return html`
    <tr onClick=${() => onJobClick(job)}>
      <td class="td-thumb"><${RowThumb} url=${job.cover_url} /></td>
      <td class="td-title">
        <span class="row-title" title=${job.designTitle || "Untitled"}>
          ${job.designTitle || "Untitled Job"}
        </span>
        ${(job.print_run ?? 1) > 1 && html`<span class="run-badge">Run ${job.print_run}</span>`}
        <${FilamentSwatches} colors=${job.filament_colors} />
      </td>
      <td>${job.deviceModel || "—"}</td>
      <td title=${fmtDate(job.startTime)}>${fmtDateShort(job.startTime)}</td>
      <td><${Badge} status=${job.status} /></td>
      <td class="td-num"><strong>${fmtWeight(job.total_weight_g)}</strong></td>
      <td class="td-num">${fmtTime(job.total_time_s)}</td>
      <td class="td-num">
        ${job.final_price != null ? html`<strong>${fmtCurrency(job.final_price)}</strong>` : "—"}
      </td>
      <td class="td-num">${job.plate_count ?? "—"}</td>
      <td>${job.customer && html`<span class="customer-pill">${job.customer}</span>`}</td>
    </tr>
  `;
}

export function TableView({
  sorted,
  sortCol,
  sortDir,
  onSort,
  onJobClick,
}: {
  sorted: Job[];
  sortCol: string;
  sortDir: "asc" | "desc";
  onSort: (col: string) => void;
  onJobClick: (job: Job) => void;
}) {
  return html`
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th class="td-thumb"></th>
            ${TABLE_COLS.map(({ col, label, cls }) => {
              const active = col && col === sortCol;
              const thCls = [cls, active ? `sort-${sortDir}` : ""].filter(Boolean).join(" ");
              return html`
                <th
                  key=${label}
                  class=${thCls || undefined}
                  onClick=${col ? () => onSort(col) : undefined}
                >
                  ${label}
                </th>
              `;
            })}
          </tr>
        </thead>
        <tbody>
          ${sorted.map(
            (job) => html`<${JobRow} key=${job.id} job=${job} onJobClick=${onJobClick} />`,
          )}
        </tbody>
      </table>
    </div>
  `;
}

function JobCard({ job, onJobClick }: { job: Job; onJobClick: (job: Job) => void }) {
  return html`
    <div class="card" onClick=${() => onJobClick(job)}>
      <${CoverImg} url=${job.cover_url} className="cover" />
      <div class="card-body">
        <div class="card-title">${job.designTitle || "Untitled Job"}</div>
        <div class="card-meta">
          <span>🖨 ${job.deviceModel || "—"}</span>
          <span>📅 ${fmtDateShort(job.startTime)}</span>
          <span>⏱ ${fmtTime(job.total_time_s)}</span>
          <span>🧵 ${fmtWeight(job.total_weight_g)}</span>
          ${job.final_price != null && html`<span>💰 ${fmtCurrency(job.final_price)}</span>`}
        </div>
        <div class="card-footer">
          <${Badge} status=${job.status} />
          ${(job.print_run ?? 1) > 1 && html`<span class="run-badge">Run ${job.print_run}</span>`}
          ${job.customer && html`<span class="customer-pill">${job.customer}</span>`}
          <${FilamentSwatches} colors=${job.filament_colors} />
        </div>
      </div>
    </div>
  `;
}

export function GridView({
  sorted,
  onJobClick,
}: {
  sorted: Job[];
  onJobClick: (job: Job) => void;
}) {
  return html`
    <div class="grid-view">
      ${sorted.map((job) => html`<${JobCard} key=${job.id} job=${job} onJobClick=${onJobClick} />`)}
    </div>
  `;
}
