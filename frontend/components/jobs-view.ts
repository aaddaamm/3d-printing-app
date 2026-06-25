// ── Jobs view — Header, Toolbar, TotalsBar, Table, Grid ──────────────────────

import { h } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
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
import { fetchJsonOrToast, patchJsonOrToast } from "../lib/api.js";

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
  material_usage_confidence?: string | null;
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

type PrinterInventory = {
  id: number;
  provider: string;
  provider_display_name?: string | null;
  provider_printer_id: string;
  name?: string | null;
  model?: string | null;
  is_active: number;
  retired_at?: string | null;
  job_count: number;
  task_count: number;
  total_time_s?: number | null;
  total_weight_g?: number | null;
  first_print_at?: string | null;
  last_print_at?: string | null;
};

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

function materialConfidenceLabel(confidence?: string | null): string | null {
  if (!confidence || confidence === "actual") return null;
  if (confidence === "slicer_estimate") return "estimate";
  if (confidence === "manual") return "manual";
  return "unknown";
}

function MaterialConfidence({ confidence }: { confidence?: string | null }) {
  const label = materialConfidenceLabel(confidence);
  return label ? html`<span class="usage-confidence">${label}</span>` : null;
}

function getPrinterPhotoUrl(deviceModel: string): string | null {
  const normalized = deviceModel.toLowerCase();
  if (normalized.includes("a1 mini")) return "/ui/printers/a1-mini";
  if (normalized.includes("p1s")) return "/ui/printers/p1s";
  return null;
}

function groupJobsByPrinter(jobs: Job[]): Map<string, Job[]> {
  const jobsByPrinter = new Map<string, Job[]>();
  for (const job of jobs) {
    const key = job.deviceModel || "Unknown printer";
    const list = jobsByPrinter.get(key) ?? [];
    list.push(job);
    jobsByPrinter.set(key, list);
  }
  return jobsByPrinter;
}

function getRecentPrinterJobs(jobs: Job[], limit = 6): Job[] {
  return jobs
    .slice()
    .sort((a, b) => String(b.startTime || "").localeCompare(String(a.startTime || "")))
    .slice(0, limit);
}

function PrinterIdentity({ printerName }: { printerName: string }) {
  const printerPhotoUrl = getPrinterPhotoUrl(printerName);
  return printerPhotoUrl
    ? html`<img class="printer-photo" src=${printerPhotoUrl} alt=${printerName} />`
    : html`<div class="printer-photo">🖨️</div>`;
}

function PrinterJobRow({ job, onJobClick }: { job: Job; onJobClick: (job: Job) => void }) {
  return html`
    <article class="printer-job-row" key=${job.id} onClick=${() => onJobClick(job)}>
      <div class="printer-job-top">
        <div class="td-thumb"><${RowThumb} url=${job.cover_url} /></div>
        <div class="td-title">
          <span class="row-title">${job.designTitle || "Untitled Job"}</span>
          <${FilamentSwatches} colors=${job.filament_colors} />
        </div>
        <${Badge} status=${job.status} />
      </div>
      <div class="printer-job-bottom">
        <span title=${fmtDate(job.startTime)}>${fmtDateShort(job.startTime)}</span>
        <span>Filament: <strong>${fmtWeight(job.total_weight_g)}</strong></span>
        <span>Time: <strong>${fmtTime(job.total_time_s)}</strong></span>
      </div>
    </article>
  `;
}

function PrinterCard({
  row,
  jobs,
  onJobClick,
}: {
  row: DeviceSummary;
  jobs: Job[];
  onJobClick: (job: Job) => void;
}) {
  const printerName = row.deviceModel || "Unknown printer";
  const recentJobs = getRecentPrinterJobs(jobs);

  return html`
    <section class="printer-card" key=${printerName}>
      <div class="printer-card-head">
        <div class="printer-identity">
          <${PrinterIdentity} printerName=${printerName} />
          <div>
            <h3>${printerName}</h3>
            <p class="printer-meta">
              <span class="printer-meta-jobs">${(row.total_jobs ?? 0).toLocaleString()} jobs</span>
              <span class="printer-meta-dot">•</span>
              <span class="printer-meta-hours"
                >${((row.total_time_s ?? 0) / 3600).toFixed(1)} h total</span
              >
            </p>
          </div>
        </div>
        <div class="printer-kpis">
          <span><strong>${(row.total_jobs ?? 0).toLocaleString()}</strong> Jobs</span>
          <span><strong>${(row.total_plates ?? 0).toLocaleString()}</strong> Plates</span>
          <span><strong>${((row.total_time_s ?? 0) / 3600).toFixed(1)}</strong> Hours</span>
        </div>
      </div>

      <div class="printer-jobs-list">
        ${recentJobs.length
          ? recentJobs.map(
              (job) => html`<${PrinterJobRow} key=${job.id} job=${job} onJobClick=${onJobClick} />`,
            )
          : html`<div class="empty">No jobs for this printer yet.</div>`}
      </div>
    </section>
  `;
}

function InventoryPrinterCard({
  printer,
  jobs,
  onJobClick,
  onToggleActive,
}: {
  printer: PrinterInventory;
  jobs: Job[];
  onJobClick: (job: Job) => void;
  onToggleActive: (printer: PrinterInventory) => void;
}) {
  const printerName = printer.name || printer.model || printer.provider_printer_id;
  const recentJobs = getRecentPrinterJobs(jobs);
  const isActive = printer.is_active === 1;

  return html`
    <section class=${"printer-card" + (isActive ? "" : " is-retired")} key=${printer.id}>
      <div class="printer-card-head">
        <div class="printer-identity">
          <${PrinterIdentity} printerName=${printer.model || printerName} />
          <div>
            <h3>${printerName}</h3>
            <p class="printer-meta">
              <span class="printer-meta-jobs"
                >${printer.provider_display_name || printer.provider}</span
              >
              <span class="printer-meta-dot">•</span>
              <span class="printer-meta-hours">${printer.model || "Unknown model"}</span>
              <span class="printer-meta-dot">•</span>
              <span class=${isActive ? "status-pill paid" : "status-pill cancel"}
                >${isActive ? "Active" : "Retired"}</span
              >
            </p>
            ${printer.retired_at
              ? html`<p class="printer-meta">Retired ${fmtDateShort(printer.retired_at)}</p>`
              : null}
          </div>
        </div>
        <div class="printer-kpis">
          <span><strong>${printer.job_count.toLocaleString()}</strong> Jobs</span>
          <span><strong>${printer.task_count.toLocaleString()}</strong> Records</span>
          <span><strong>${((printer.total_time_s ?? 0) / 3600).toFixed(1)}</strong> Hours</span>
        </div>
      </div>

      <div class="printer-card-footer">
        <button class="view-btn" onClick=${() => onToggleActive(printer)}>
          ${isActive ? "Mark retired" : "Reactivate"}
        </button>
      </div>

      <div class="printer-jobs-list">
        ${recentJobs.length
          ? recentJobs.map(
              (job) => html`<${PrinterJobRow} key=${job.id} job=${job} onJobClick=${onJobClick} />`,
            )
          : html`<div class="empty">No jobs for this printer yet.</div>`}
      </div>
    </section>
  `;
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
  density,
  setDensity,
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
  density: "compact" | "comfy";
  setDensity: (density: "compact" | "comfy") => void;
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
        <div class="density-toggle">
          <button
            class=${"density-btn" + (density === "compact" ? " active" : "")}
            onClick=${() => setDensity("compact")}
          >
            Compact
          </button>
          <button
            class=${"density-btn" + (density === "comfy" ? " active" : "")}
            onClick=${() => setDensity("comfy")}
          >
            Comfy
          </button>
        </div>
        <a class="btn-csv" href=${csvUrl} download>↓ CSV</a>
        <span class="job-count">${filteredCount} / ${totalCount} jobs</span>
      </div>
    </div>
  `;
}

function jobsForInventoryPrinter(printer: PrinterInventory, jobs: Job[]): Job[] {
  const names = new Set([printer.model, printer.name, printer.provider_printer_id].filter(Boolean));
  return jobs.filter((job) => names.has(job.deviceModel));
}

export function PrinterBreakdownView({
  summary,
  jobs,
  onJobClick,
}: {
  summary: Summary;
  jobs: Job[];
  onJobClick: (job: Job) => void;
}) {
  const [printers, setPrinters] = useState<PrinterInventory[]>([]);

  useEffect(() => {
    fetchJsonOrToast<{ printers: PrinterInventory[] }>(
      "/printers",
      "Failed to load printer inventory.",
    ).then((data) => {
      if (data) setPrinters(data.printers);
    });
  }, []);

  const toggleActive = async (printer: PrinterInventory) => {
    const data = await patchJsonOrToast<{ printer?: PrinterInventory }>(
      `/printers/${printer.id}`,
      { is_active: printer.is_active !== 1 },
      "Failed to update printer inventory.",
    );
    if (!data?.printer) return;
    setPrinters((items) => items.map((item) => (item.id === printer.id ? data.printer! : item)));
  };

  if (printers.length) {
    return html`
      <div class="printer-grid">
        ${printers.map(
          (printer) =>
            html`<${InventoryPrinterCard}
              key=${printer.id}
              printer=${printer}
              jobs=${jobsForInventoryPrinter(printer, jobs)}
              onJobClick=${onJobClick}
              onToggleActive=${toggleActive}
            />`,
        )}
      </div>
    `;
  }

  const rows = summary?.by_device ?? [];
  if (!rows.length) return html`<div class="empty">No printer totals available yet.</div>`;

  const jobsByPrinter = groupJobsByPrinter(jobs);

  return html`
    <div class="printer-grid">
      ${rows.map(
        (row) =>
          html`<${PrinterCard}
            key=${row.deviceModel || "Unknown printer"}
            row=${row}
            jobs=${jobsByPrinter.get(row.deviceModel || "Unknown printer") ?? []}
            onJobClick=${onJobClick}
          />`,
      )}
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

function JobsSortBar({
  sortCol,
  sortDir,
  onSort,
}: {
  sortCol: string;
  sortDir: "asc" | "desc";
  onSort: (col: string) => void;
}) {
  const sortOptions = [
    { col: "startTime", label: "Date" },
    { col: "designTitle", label: "Title" },
    { col: "deviceModel", label: "Printer" },
    { col: "total_weight_g", label: "Filament" },
    { col: "total_time_s", label: "Time" },
    { col: "final_price", label: "Price" },
  ];

  return html`<div class="jobs-record-sortbar">
    <span class="jobs-record-sort-label">Sort</span>
    ${sortOptions.map(({ col, label }) => {
      const active = sortCol === col;
      return html`
        <button
          key=${col}
          class=${"jobs-record-sort-btn" + (active ? " active" : "")}
          onClick=${() => onSort(col)}
        >
          ${label}${active ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
        </button>
      `;
    })}
  </div>`;
}

function JobRecordRow({ job, onJobClick }: { job: Job; onJobClick: (job: Job) => void }) {
  return html`
    <article class="jobs-record-row" onClick=${() => onJobClick(job)}>
      <div class="jobs-record-top">
        <div class="td-thumb"><${RowThumb} url=${job.cover_url} /></div>
        <div class="td-title">
          <span class="row-title" title=${job.designTitle || "Untitled"}
            >${job.designTitle || "Untitled Job"}</span
          >
          <${JobRunBadge} printRun=${job.print_run} />
          <${FilamentSwatches} colors=${job.filament_colors} />
        </div>
        <div><${Badge} status=${job.status} /></div>
      </div>
      <div class="jobs-record-bottom">
        <span>🖨 ${job.deviceModel || "—"}</span>
        <span title=${fmtDate(job.startTime)}>📅 ${fmtDateShort(job.startTime)}</span>
        <span
          >🧵 <strong>${fmtWeight(job.total_weight_g)}</strong>
          <${MaterialConfidence} confidence=${job.material_usage_confidence} />
        </span>
        <span>⏱ <strong>${fmtTime(job.total_time_s)}</strong></span>
        <span
          >💰 <strong>${job.final_price != null ? fmtCurrency(job.final_price) : "—"}</strong></span
        >
        <span>🧱 <strong>${job.plate_count ?? "—"}</strong></span>
        ${job.customer ? html`<span class="customer-pill">${job.customer}</span>` : null}
      </div>
    </article>
  `;
}

export function TableView({
  sorted,
  sortCol,
  sortDir,
  onSort,
  onJobClick,
  density,
}: {
  sorted: Job[];
  sortCol: string;
  sortDir: "asc" | "desc";
  onSort: (col: string) => void;
  onJobClick: (job: Job) => void;
  density: "compact" | "comfy";
}) {
  return html`
    <div class=${"jobs-record-list-wrap density-" + density}>
      <${JobsSortBar} sortCol=${sortCol} sortDir=${sortDir} onSort=${onSort} />
      <div class="jobs-record-list">
        ${sorted.map(
          (job) => html`<${JobRecordRow} key=${job.id} job=${job} onJobClick=${onJobClick} />`,
        )}
      </div>
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
          <span
            >🧵 ${fmtWeight(job.total_weight_g)}
            <${MaterialConfidence} confidence=${job.material_usage_confidence} />
          </span>
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
  density,
}: {
  sorted: Job[];
  onJobClick: (job: Job) => void;
  density: "compact" | "comfy";
}) {
  return html`
    <div class=${"grid-view density-" + density}>
      ${sorted.map((job) => html`<${JobCard} key=${job.id} job=${job} onJobClick=${onJobClick} />`)}
    </div>
  `;
}
