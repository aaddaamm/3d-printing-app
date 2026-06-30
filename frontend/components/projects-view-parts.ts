import { h } from "preact";
import htm from "htm";

import {
  fmtCurrency,
  fmtTime,
  fmtWeightTotal,
  fmtDateShort,
  fmtDate,
  fmtWeight,
} from "./helpers.js";
import { Badge, RowThumb } from "./atoms.js";
import type { Job, Project } from "./projects-view-helpers.js";
import type { ProjectPrice } from "../hooks/use-project-price.js";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

function ProjectCard({
  project,
  totalPrice,
  onClick,
}: {
  project: Project;
  totalPrice: number | null;
  onClick: () => void;
}) {
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
      </div>
      <div class="proj-card-stats">
        <span>
          <strong>${project.job_count}</strong> run${project.job_count !== 1 ? "s" : ""}
        </span>
        ${project.total_plates != null &&
        html`<span>
          <strong>${project.total_plates}</strong> plate${project.total_plates !== 1 ? "s" : ""}
        </span>`}
        ${totalW != null && html`<span>${fmtWeightTotal(totalW)}</span>`}
        ${totalT != null && html`<span>${fmtTime(totalT)}</span>`}
        ${totalPrice != null &&
        html`<span class="proj-card-price">${fmtCurrency(totalPrice)}</span>`}
      </div>
      ${project.notes && html`<div class="proj-card-notes">${project.notes}</div>`}
    </div>
  `;
}

export function ProjectPriceSummary({ price }: { price: ProjectPrice | null }) {
  if (!price) return null;

  return html`
    <span>Material: <strong>${fmtCurrency(price.material_cost)}</strong></span>
    <span>Machine: <strong>${fmtCurrency(price.machine_cost)}</strong></span>
    <span>Labor: <strong>${fmtCurrency(price.labor_cost)}</strong></span>
    ${price.extra_labor_cost > 0 &&
    html`<span>Extra labor: <strong>${fmtCurrency(price.extra_labor_cost)}</strong></span>`}
    <span class="totals-total">Total: <strong>${fmtCurrency(price.final_price)}</strong></span>
  `;
}

export function ProjectJobsTable({
  jobs,
  onJobClick,
  onRemoveJob,
}: {
  jobs: Job[];
  onJobClick: (job: Job) => void;
  onRemoveJob: (jobId: number) => void;
}) {
  if (jobs.length === 0) {
    return html`<div class="empty">No jobs assigned yet. Use "+ Add Jobs" to assign them.</div>`;
  }

  return html`
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th class="td-thumb"></th>
            <th>Title</th>
            <th>Printer</th>
            <th>Date</th>
            <th>Status</th>
            <th class="td-num">Plates</th>
            <th class="td-num">Filament</th>
            <th class="td-num">Time</th>
            <th class="td-num">Price</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${jobs.map(
            (job: Job) => html`
              <tr key=${job.id} onClick=${() => onJobClick(job)}>
                <td class="td-thumb"><${RowThumb} url=${job.cover_url} /></td>
                <td class="td-title">
                  <span class="row-title">${job.designTitle || "Untitled Job"}</span>
                </td>
                <td>${job.deviceModel || "—"}</td>
                <td title=${fmtDate(job.startTime)}>${fmtDateShort(job.startTime)}</td>
                <td><${Badge} status=${job.status} /></td>
                <td class="td-num"><strong>${job.plate_count ?? 1}</strong></td>
                <td class="td-num"><strong>${fmtWeight(job.total_weight_g)}</strong></td>
                <td class="td-num">${fmtTime(job.total_time_s)}</td>
                <td class="td-num">
                  ${job.final_price != null
                    ? html`<strong>${fmtCurrency(job.final_price)}</strong>`
                    : "—"}
                </td>
                <td>
                  <button
                    class="btn-remove-job"
                    title="Remove from project"
                    onClick=${(e: MouseEvent) => {
                      e.stopPropagation();
                      onRemoveJob(job.id);
                    }}
                  >
                    ×
                  </button>
                </td>
              </tr>
            `,
          )}
        </tbody>
      </table>
    </div>
  `;
}

export function ProjectsBody({
  loading,
  filtered,
  q,
  projectPrices,
  navigate,
}: {
  loading: boolean;
  filtered: Project[];
  q: string;
  projectPrices: Record<number, number>;
  navigate: (path: string) => void;
}) {
  if (loading) return html`<div class="empty">Loading projects…</div>`;

  if (filtered.length === 0) {
    const emptyText = q
      ? "No projects match your search."
      : "No projects yet. Create one to group related jobs together.";
    return html`<div class="empty">${emptyText}</div>`;
  }

  return html`
    <div class="proj-grid">
      ${filtered.map(
        (project) =>
          html`<${ProjectCard}
            key=${project.id}
            project=${project}
            totalPrice=${projectPrices[project.id] ?? null}
            onClick=${() => navigate(`/projects/${project.id}`)}
          />`,
      )}
    </div>
  `;
}
