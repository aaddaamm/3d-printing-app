import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import htm from "htm";

import { Badge, FilamentSwatches, RowThumb } from "./atoms.js";
import { fmtDateShort, fmtTime, fmtWeight } from "./helpers.js";
import type { DeviceSummary, Job, PrinterInventory, Summary } from "./jobs-view-types.js";
import { fetchJsonOrToast, patchJsonOrToast } from "../lib/api.js";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

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
        <span>${fmtDateShort(job.startTime)}</span>
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

export function jobsForInventoryPrinter(printer: PrinterInventory, jobs: Job[]): Job[] {
  return jobs.filter((job) => job.printer_id === printer.id);
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
