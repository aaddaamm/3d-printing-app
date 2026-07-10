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
import { createProductFromProject } from "../lib/api.js";
import { copyTextToClipboard, formatProjectForClipboard } from "../lib/copy-format.js";
import { toast } from "./toast.js";
import type { Job, Project } from "./projects-view-helpers.js";
import type { ProjectPrice } from "../hooks/use-project-price.js";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

function hasValue<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function ProjectCard({
  project,
  totalPrice,
  onClick,
  onRename,
}: {
  project: Project;
  totalPrice: number | null;
  onClick: () => void;
  onRename: (project: Project) => void;
}) {
  const totalW = project.total_weight_g;
  const totalT = project.total_time_s;
  const createProduct = async (event: Event) => {
    event.stopPropagation();
    const product = await createProductFromProject(project.id);
    if (product) toast(`Created product: ${product.name}`, "success");
  };
  const copyProject = async (event: Event) => {
    event.stopPropagation();
    try {
      await copyTextToClipboard(formatProjectForClipboard(project));
      toast("Project details copied.", "success");
    } catch (error: unknown) {
      toast(error instanceof Error ? error.message : "Failed to copy project details.", "error");
    }
  };
  return html`
    <div class="proj-card" onClick=${onClick}>
      ${project.cover_url
        ? html`<img class="proj-card-cover" src=${project.cover_url} alt="" />`
        : html`<div class="proj-card-cover proj-card-cover--empty">🖨️</div>`}
      <div class="proj-card-title-row">
        <div class="proj-card-name">${project.name}</div>
      </div>
      <div class="proj-card-actions">
        <button
          type="button"
          class="btn-secondary proj-card-action"
          onClick=${(e: MouseEvent) => {
            e.stopPropagation();
            onRename(project);
          }}
        >
          Rename
        </button>
        <button type="button" class="btn-secondary proj-card-action" onClick=${copyProject}>
          Copy
        </button>
        <button type="button" class="btn-secondary proj-card-action" onClick=${createProduct}>
          Create product
        </button>
      </div>
      <div class="proj-card-meta">
        ${project.customer && html`<span class="customer-pill">${project.customer}</span>`}
      </div>
      <div class="proj-card-stats">
        <span>
          <strong>${project.job_count}</strong> run${project.job_count !== 1 ? "s" : ""}
        </span>
        ${hasValue(project.total_plates) &&
        html`<span>
          <strong>${project.total_plates}</strong> plate${project.total_plates !== 1 ? "s" : ""}
        </span>`}
        ${hasValue(totalW) && html`<span>${fmtWeightTotal(totalW)}</span>`}
        ${hasValue(totalT) && html`<span>${fmtTime(totalT)}</span>`}
        ${hasValue(totalPrice) &&
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
  onMoveToNewProject,
}: {
  jobs: Job[];
  onJobClick: (job: Job) => void;
  onRemoveJob: (jobId: number) => void;
  onMoveToNewProject?: (job: Job) => void;
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
                  ${hasValue(job.final_price)
                    ? html`<strong>${fmtCurrency(job.final_price)}</strong>`
                    : "—"}
                </td>
                <td>
                  ${onMoveToNewProject &&
                  html`<button
                    class="btn-secondary"
                    title="Move to a new project"
                    onClick=${(e: MouseEvent) => {
                      e.stopPropagation();
                      onMoveToNewProject(job);
                    }}
                  >
                    New project
                  </button>`}
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
  onRename,
}: {
  loading: boolean;
  filtered: Project[];
  q: string;
  projectPrices: Record<number, number>;
  navigate: (path: string) => void;
  onRename: (project: Project) => void;
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
            onRename=${onRename}
          />`,
      )}
    </div>
  `;
}
