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

function isJobsRoute(loc: string): boolean {
  return !loc.startsWith("/projects") && !loc.startsWith("/admin") && !loc.startsWith("/printers");
}

function buildJobsCsvUrl(statusFilter: string, deviceFilter: string): string {
  const params = new URLSearchParams();
  if (statusFilter) params.set("status", statusFilter);
  if (deviceFilter) params.set("device", deviceFilter);
  const query = params.toString();
  return "/jobs/export.csv" + (query ? "?" + query : "");
}

function getFilteredTotals(filtered: Job[]) {
  return filtered.reduce(
    (totals, job) => {
      totals.weight += job.total_weight_g || 0;
      totals.time += job.total_time_s || 0;
      return totals;
    },
    { weight: 0, time: 0 },
  );
}

const NAV_ITEMS = [
  {
    label: "Jobs",
    path: "/",
    active: isJobsRoute,
  },
  { label: "Projects", path: "/projects", active: (loc: string) => loc.startsWith("/projects") },
  { label: "Printers", path: "/printers", active: (loc: string) => loc.startsWith("/printers") },
  { label: "Rates", path: "/admin", active: (loc: string) => loc.startsWith("/admin") },
] as const;

const STATUS_OPTIONS = [
  ["", "All Statuses"],
  ["finish", "Finished"],
  ["cancel", "Cancelled"],
  ["running", "Running"],
  ["failed", "Failed"],
  ["pause", "Paused"],
] as const;

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

function metricBreakdownTitle(summary: Summary, metric: "jobs" | "plates" | "hours") {
  const rows = summary?.by_device ?? [];
  if (!rows.length) return "No printer breakdown available";

  return rows
    .map((row) => {
      const label = row.deviceModel || "Unknown printer";
      if (metric === "jobs") return `${label}: ${(row.total_jobs ?? 0).toLocaleString()} jobs`;
      if (metric === "plates")
        return `${label}: ${(row.total_plates ?? 0).toLocaleString()} plates`;
      return `${label}: ${((row.total_time_s ?? 0) / 3600).toFixed(1).toLocaleString()} h`;
    })
    .join("\n");
}

function HeaderNav({ loc, navigate }: { loc: string; navigate: (path: string) => void }) {
  return html`<nav class="top-nav">
    ${NAV_ITEMS.map((item) => {
      const isActive = item.active(loc);
      return html`
        <button
          key=${item.label}
          class=${"nav-btn" + (isActive ? " active" : "")}
          onClick=${() => navigate(item.path)}
        >
          ${item.label}
        </button>
      `;
    })}
  </nav>`;
}

function HeaderStats({ summary }: { summary: Summary }) {
  const t = summary?.totals;
  return html`
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
  `;
}

export function Header({ summary, dataRange }: { summary: Summary; dataRange: DataRange }) {
  const [loc, navigate] = useLocation();
  const hasHistoryRange = Boolean(dataRange?.min_start && dataRange?.max_start);
  const minStart = dataRange?.min_start ?? "";
  const maxStart = dataRange?.max_start ?? "";

  return html`
    <header>
      <div class="header-left">
        <h1><span class="brand-cursor" aria-hidden="true"></span><span>bambu history</span></h1>
        ${hasHistoryRange &&
        html`<div class="header-range">
          History: ${fmtDateShort(minStart)} → ${fmtDateShort(maxStart)}
          (${(dataRange?.task_count || 0).toLocaleString()} tasks)
        </div>`}
        <${HeaderNav} loc=${loc} navigate=${navigate} />
      </div>
      <${HeaderStats} summary=${summary} />
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
  const csvUrl = useMemo(
    () => buildJobsCsvUrl(statusFilter, deviceFilter),
    [statusFilter, deviceFilter],
  );

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
        ${STATUS_OPTIONS.map(
          ([value, label]) => html`<option key=${value} value=${value}>${label}</option> `,
        )}
      </select>
      <select
        value=${deviceFilter}
        onChange=${(e: Event) => setDeviceFilter((e.target as HTMLSelectElement).value)}
      >
        <option value="">All Printers</option>
        ${devices.map((d) => html`<option key=${d} value=${d}>${d}</option> `)}
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

  const totals = getFilteredTotals(filtered);
  return html`
    <div class="totals-bar">
      <span class="totals-label">Selection</span>
      <span>Jobs: <strong>${filtered.length}</strong></span>
      <span>Filament: <strong>${fmtWeightTotal(totals.weight)}</strong></span>
      <span>Print time: <strong>${fmtTime(totals.time)}</strong></span>
    </div>
  `;
}

function JobRunBadge({ printRun }: { printRun?: number }) {
  if ((printRun ?? 1) <= 1) return null;
  return html`<span class="run-badge">Run ${printRun}</span>`;
}

function JobRow({ job, onJobClick }: { job: Job; onJobClick: (job: Job) => void }) {
  return html`
    <tr onClick=${() => onJobClick(job)}>
      <td class="td-thumb"><${RowThumb} url=${job.cover_url} /></td>
      <td class="td-title">
        <span class="row-title" title=${job.designTitle || "Untitled"}
          >${job.designTitle || "Untitled Job"}</span
        >
        <${JobRunBadge} printRun=${job.print_run} />
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
    <div class="table-wrap table-sticky-head">
      <table>
        <thead>
          <tr>
            <th class="td-thumb"></th>
            ${TABLE_COLS.map(({ col, label, cls }) => {
              const isActiveSort = col != null && col === sortCol;
              const headerClass = [cls, isActiveSort ? `sort-${sortDir}` : ""]
                .filter(Boolean)
                .join(" ");
              const onHeaderClick = col ? () => onSort(col) : undefined;
              return html`
                <th key=${label} class=${headerClass || undefined} onClick=${onHeaderClick}>
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
          <${JobRunBadge} printRun=${job.print_run} />
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
