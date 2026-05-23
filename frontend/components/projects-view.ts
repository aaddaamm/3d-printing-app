// ── Projects view ─────────────────────────────────────────────────────────────

import { h } from "preact";
import { useState, useEffect, useMemo, useCallback } from "preact/hooks";
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
import { toast } from "./toast.js";
import { useLocation } from "./router.js";
import { fetchJsonOrToast, postJsonOrToast } from "../lib/api.js";
import { useEscapeClose } from "../hooks/use-escape-close.js";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

type Project = {
  id: number;
  name?: string;
  customer?: string | null;
  notes?: string | null;
  job_count?: number;
  total_weight_g?: number | null;
  total_time_s?: number | null;
  cover_url?: string | null;
};

type Job = {
  id: number;
  designTitle?: string;
  customer?: string | null;
  cover_url?: string | null;
  startTime?: string;
  deviceModel?: string;
  status?: string;
  total_weight_g?: number | null;
  total_time_s?: number | null;
  final_price?: number | null;
};

type ProjectPrice = {
  material_cost: number;
  machine_cost: number;
  labor_cost: number;
  extra_labor_cost: number;
  final_price: number;
};

function onOverlayClick(onClose: () => void) {
  return (e: MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };
}

function filterProjects(projects: Project[], q: string): Project[] {
  if (!q) return projects;
  const lc = q.toLowerCase();
  return projects.filter((p) =>
    [p.name, p.customer, p.notes].filter(Boolean).join(" ").toLowerCase().includes(lc),
  );
}

function filterJobs(unassignedJobs: Job[], q: string): Job[] {
  if (!q) return unassignedJobs;
  const lc = q.toLowerCase();
  return unassignedJobs.filter((j) =>
    `${j.designTitle || ""} ${j.customer || ""}`.toLowerCase().includes(lc),
  );
}

function projectCountLabel(projects: Project[], filtered: Project[], q: string): string {
  const prefix = q ? `${filtered.length} of ${projects.length}` : String(projects.length);
  return `${prefix} project${projects.length !== 1 ? "s" : ""}`;
}

function autoGroupToast(projectsCreated: number, jobsAssigned: number): void {
  if (projectsCreated === 0) {
    toast("No ungrouped jobs found — everything is already assigned to a project.", "info");
    return;
  }

  toast(
    `Created ${projectsCreated} project${projectsCreated !== 1 ? "s" : ""}, assigned ${jobsAssigned} job${jobsAssigned !== 1 ? "s" : ""}.`,
    "success",
  );
}

function NewProjectModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (p: Project) => void;
}) {
  const [name, setName] = useState("");
  const [customer, setCustomer] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEscapeClose(onClose);

  const handleSubmit = useCallback(
    async (e: Event) => {
      e.preventDefault();
      if (!name.trim()) return;
      setSaving(true);
      try {
        const data = await postJsonOrToast<{ project?: Project }>(
          "/projects",
          { name: name.trim(), customer: customer || null, notes: notes || null },
          "Failed to create project.",
        );
        if (!data?.project) return;
        onCreate(data.project);
        onClose();
      } finally {
        setSaving(false);
      }
    },
    [name, customer, notes, onCreate, onClose],
  );

  return html`
    <div class="overlay" onClick=${onOverlayClick(onClose)}>
      <div class="modal">
        <div class="modal-header">
          <h2>New Project</h2>
          <button class="modal-close" onClick=${onClose}>✕</button>
        </div>
        <div class="modal-body">
          <form class="project-form" onSubmit=${handleSubmit}>
            <label class="form-label"
              >Name *
              <input
                class="form-input"
                type="text"
                value=${name}
                onInput=${(e: Event) => setName((e.target as HTMLInputElement).value)}
                placeholder="Project name"
                required
              />
            </label>
            <label class="form-label"
              >Customer
              <input
                class="form-input"
                type="text"
                value=${customer}
                onInput=${(e: Event) => setCustomer((e.target as HTMLInputElement).value)}
                placeholder="Optional"
              />
            </label>
            <label class="form-label"
              >Notes
              <textarea
                class="form-input form-textarea"
                value=${notes}
                onInput=${(e: Event) => setNotes((e.target as HTMLInputElement).value)}
                placeholder="Optional"
              />
            </label>
            <div class="form-actions">
              <button type="button" class="btn-secondary" onClick=${onClose}>Cancel</button>
              <button type="submit" class="btn-primary" disabled=${saving || !name.trim()}>
                ${saving ? "Creating…" : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

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
        <span><strong>${project.job_count}</strong> job${project.job_count !== 1 ? "s" : ""}</span>
        ${totalW != null && html`<span>${fmtWeightTotal(totalW)}</span>`}
        ${totalT != null && html`<span>${fmtTime(totalT)}</span>`}
        ${totalPrice != null &&
        html`<span class="proj-card-price">${fmtCurrency(totalPrice)}</span>`}
      </div>
      ${project.notes && html`<div class="proj-card-notes">${project.notes}</div>`}
    </div>
  `;
}

function AddJobsModal({
  unassignedJobs,
  onClose,
  onAdd,
}: {
  unassignedJobs: Job[];
  onClose: () => void;
  onAdd: (jobId: number) => void;
}) {
  const [q, setQ] = useState("");
  useEscapeClose(onClose);
  const filtered = useMemo(() => filterJobs(unassignedJobs, q), [unassignedJobs, q]);

  return html`
    <div class="overlay" onClick=${onOverlayClick(onClose)}>
      <div class="modal">
        <div class="modal-header">
          <h2>Add Jobs to Project</h2>
          <button class="modal-close" onClick=${onClose}>✕</button>
        </div>
        <div class="modal-body">
          <input
            type="search"
            class="add-jobs-search"
            placeholder="Search…"
            value=${q}
            onInput=${(e: Event) => setQ((e.target as HTMLInputElement).value)}
          />
          ${filtered.length === 0
            ? html`<div class="empty" style="padding:16px 0">
                ${q ? "No matches." : "All jobs are already assigned to projects."}
              </div>`
            : html`<div class="add-jobs-list">
                ${filtered.map(
                  (job: Job) => html`
                    <div class="add-jobs-row" key=${job.id} onClick=${() => onAdd(job.id)}>
                      <${RowThumb} url=${job.cover_url} />
                      <div class="add-jobs-info">
                        <div class="add-jobs-title">${job.designTitle || "Untitled Job"}</div>
                        <div class="add-jobs-meta">
                          ${fmtDateShort(job.startTime)} · ${job.deviceModel || "—"}
                        </div>
                      </div>
                      <button class="btn-primary add-jobs-btn">Add</button>
                    </div>
                  `,
                )}
              </div>`}
        </div>
      </div>
    </div>
  `;
}

function ProjectPriceSummary({ price }: { price: ProjectPrice | null }) {
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

function ProjectJobsTable({
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

function ProjectDetail({
  project,
  jobs,
  unassignedJobs,
  onBack,
  onJobClick,
  onAddJob,
  onRemoveJob,
}: {
  project: Project;
  jobs: Job[];
  unassignedJobs: Job[];
  onBack: () => void;
  onJobClick: (job: Job) => void;
  onAddJob: (jobId: number) => void;
  onRemoveJob: (jobId: number) => void;
}) {
  const [showAddJobs, setShowAddJobs] = useState(false);
  const [price, setPrice] = useState<ProjectPrice | null>(null);
  const totW = jobs.reduce((s: number, j: Job) => s + (j.total_weight_g || 0), 0);
  const totT = jobs.reduce((s: number, j: Job) => s + (j.total_time_s || 0), 0);

  useEffect(() => {
    setPrice(null);
    if (!jobs.length) return;
    fetchJsonOrToast<ProjectPrice>(
      `/projects/${project.id}/price`,
      "Failed to load project price.",
    ).then((d) => {
      if (d) setPrice(d);
    });
  }, [project.id, jobs.length]);

  const handleAdd = useCallback((jobId: number) => onAddJob(jobId), [onAddJob]);

  return html`
    <div class="proj-detail">
      <div class="proj-detail-header">
        <button class="btn-back" onClick=${onBack}>← Projects</button>
        <div class="proj-detail-title">
          <h2>${project.name}</h2>
          ${project.customer && html`<span class="customer-pill">${project.customer}</span>`}
        </div>
        <button class="btn-secondary" onClick=${() => setShowAddJobs(true)}>+ Add Jobs</button>
      </div>
      ${project.notes && html`<div class="proj-detail-notes">${project.notes}</div>`}
      <div class="totals-bar">
        <span class="totals-label">Project</span>
        <span>Jobs: <strong>${jobs.length}</strong></span>
        <span>Filament: <strong>${fmtWeightTotal(totW)}</strong></span>
        <span>Print time: <strong>${fmtTime(totT)}</strong></span>
        <${ProjectPriceSummary} price=${price} />
      </div>
      <${ProjectJobsTable} jobs=${jobs} onJobClick=${onJobClick} onRemoveJob=${onRemoveJob} />
      ${showAddJobs &&
      html`<${AddJobsModal}
        unassignedJobs=${unassignedJobs}
        onClose=${() => setShowAddJobs(false)}
        onAdd=${handleAdd}
      />`}
    </div>
  `;
}

function ProjectsBody({
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
        (p) =>
          html`<${ProjectCard}
            key=${p.id}
            project=${p}
            totalPrice=${projectPrices[p.id] ?? null}
            onClick=${() => navigate(`/projects/${p.id}`)}
          />`,
      )}
    </div>
  `;
}

export function ProjectsView({
  projects,
  setProjects,
  onAutoGroup,
  projectPrices,
  loading = false,
}: {
  projects: Project[];
  setProjects: (updater: Project[] | ((ps: Project[]) => Project[])) => void;
  onAutoGroup: () => Promise<void>;
  projectPrices: Record<number, number>;
  loading?: boolean;
}) {
  const [showNew, setShowNew] = useState(false);
  const [grouping, setGrouping] = useState(false);
  const [q, setQ] = useState("");
  const [, navigate] = useLocation();

  const handleAutoGroup = useCallback(async () => {
    setGrouping(true);
    try {
      const data = await postJsonOrToast<{ projects_created: number; jobs_assigned: number }>(
        "/projects/auto-group",
        {},
        "Auto-group failed.",
      );
      if (!data) return;
      const { projects_created, jobs_assigned } = data;
      await onAutoGroup();
      autoGroupToast(projects_created, jobs_assigned);
    } finally {
      setGrouping(false);
    }
  }, [onAutoGroup]);

  const handleCreate = useCallback(
    (project: Project) => {
      setProjects((ps) => [project, ...ps]);
      navigate(`/projects/${project.id}`);
    },
    [setProjects, navigate],
  );

  const filtered = useMemo(() => filterProjects(projects, q), [projects, q]);

  return html`
    <div class="proj-list-header">
      <input
        type="search"
        class="proj-search"
        placeholder="Search projects…"
        value=${q}
        onInput=${(e: Event) => setQ((e.target as HTMLInputElement).value)}
      />
      <span class="proj-list-count">${projectCountLabel(projects, filtered, q)}</span>
      <button class="btn-secondary" onClick=${handleAutoGroup} disabled=${grouping}>
        ${grouping ? "Grouping…" : "⚡ Auto-group by design"}
      </button>
      <button class="btn-primary" onClick=${() => setShowNew(true)}>+ New Project</button>
    </div>
    <${ProjectsBody}
      loading=${loading}
      filtered=${filtered}
      q=${q}
      projectPrices=${projectPrices}
      navigate=${navigate}
    />
    ${showNew &&
    html`<${NewProjectModal} onClose=${() => setShowNew(false)} onCreate=${handleCreate} />`}
  `;
}

export { ProjectDetail };
