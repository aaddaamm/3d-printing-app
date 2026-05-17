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
    bind: (
      renderer: typeof h,
    ) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

type AnyObj = Record<string, any>;

function NewProjectModal({ onClose, onCreate }: { onClose: () => void; onCreate: (p: AnyObj) => void }) {
  const [name, setName] = useState("");
  const [customer, setCustomer] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEscapeClose(onClose);

  const handleSubmit = useCallback(
    async (e: any) => {
      e.preventDefault();
      if (!name.trim()) return;
      setSaving(true);
      try {
        const data = await postJsonOrToast<AnyObj>(
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
    <div class="overlay" onClick=${(e: any) => e.target === e.currentTarget && onClose()}>
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
                onInput=${(e: any) => setName(e.target.value)}
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
                onInput=${(e: any) => setCustomer(e.target.value)}
                placeholder="Optional"
              />
            </label>
            <label class="form-label"
              >Notes
              <textarea
                class="form-input form-textarea"
                value=${notes}
                onInput=${(e: any) => setNotes(e.target.value)}
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

function ProjectCard({ project, totalPrice, onClick }: AnyObj) {
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
        ${totalPrice != null && html`<span class="proj-card-price">${fmtCurrency(totalPrice)}</span>`}
      </div>
      ${project.notes && html`<div class="proj-card-notes">${project.notes}</div>`}
    </div>
  `;
}

function AddJobsModal({ unassignedJobs, onClose, onAdd }: AnyObj) {
  const [q, setQ] = useState("");
  useEscapeClose(onClose);
  const filtered = useMemo(() => {
    if (!q) return unassignedJobs;
    const lc = q.toLowerCase();
    return unassignedJobs.filter((j: AnyObj) =>
      ((j.designTitle || "") + " " + (j.customer || "")).toLowerCase().includes(lc),
    );
  }, [unassignedJobs, q]);
  return html`
    <div class="overlay" onClick=${(e: any) => e.target === e.currentTarget && onClose()}>
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
            onInput=${(e: any) => setQ(e.target.value)}
          />
          ${filtered.length === 0
            ? html`<div class="empty" style="padding:16px 0">
                ${q ? "No matches." : "All jobs are already assigned to projects."}
              </div>`
            : html`<div class="add-jobs-list">
                ${filtered.map(
                  (job: AnyObj) => html`
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

function ProjectDetail({ project, jobs, unassignedJobs, onBack, onJobClick, onAddJob, onRemoveJob }: AnyObj) {
  const [showAddJobs, setShowAddJobs] = useState(false);
  const [price, setPrice] = useState<AnyObj | null>(null);
  const totW = jobs.reduce((s: number, j: AnyObj) => s + (j.total_weight_g || 0), 0);
  const totT = jobs.reduce((s: number, j: AnyObj) => s + (j.total_time_s || 0), 0);

  useEffect(() => {
    setPrice(null);
    if (!jobs.length) return;
    fetchJsonOrToast<AnyObj>(`/projects/${project.id}/price`, "Failed to load project price.").then((d) => {
      if (d) setPrice(d);
    });
  }, [project.id, jobs.length]);

  const handleAdd = useCallback(
    (jobId: number) => {
      onAddJob(jobId);
    },
    [onAddJob],
  );

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
        ${price &&
        html`
          <span>Material: <strong>${fmtCurrency(price.material_cost)}</strong></span>
          <span>Machine: <strong>${fmtCurrency(price.machine_cost)}</strong></span>
          <span>Labor: <strong>${fmtCurrency(price.labor_cost)}</strong></span>
          ${price.extra_labor_cost > 0 &&
          html`<span>Extra labor: <strong>${fmtCurrency(price.extra_labor_cost)}</strong></span>`}
          <span class="totals-total"
            >Total: <strong>${fmtCurrency(price.final_price)}</strong></span
          >
        `}
      </div>
      ${jobs.length === 0
        ? html`<div class="empty">No jobs assigned yet. Use "+ Add Jobs" to assign them.</div>`
        : html`
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
                    (job: AnyObj) => html`
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
                            onClick=${(e: any) => {
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
          `}
      ${showAddJobs &&
      html`<${AddJobsModal}
        unassignedJobs=${unassignedJobs}
        onClose=${() => setShowAddJobs(false)}
        onAdd=${handleAdd}
      />`}
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
  projects: AnyObj[];
  setProjects: (updater: AnyObj[] | ((ps: AnyObj[]) => AnyObj[])) => void;
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
      const data = await postJsonOrToast<AnyObj>("/projects/auto-group", {}, "Auto-group failed.");
      if (!data) return;
      const { projects_created, jobs_assigned } = data;
      await onAutoGroup();
      if (projects_created === 0) {
        toast("No ungrouped jobs found — everything is already assigned to a project.", "info");
      } else {
        toast(
          `Created ${projects_created} project${projects_created !== 1 ? "s" : ""}, assigned ${jobs_assigned} job${jobs_assigned !== 1 ? "s" : ""}.`,
          "success",
        );
      }
    } finally {
      setGrouping(false);
    }
  }, [onAutoGroup]);

  const handleCreate = useCallback(
    (project: AnyObj) => {
      setProjects((ps) => [project, ...ps]);
      navigate(`/projects/${project.id}`);
    },
    [setProjects, navigate],
  );

  const filtered = useMemo(() => {
    if (!q) return projects;
    const lc = q.toLowerCase();
    return projects.filter((p) =>
      [p.name, p.customer, p.notes].filter(Boolean).join(" ").toLowerCase().includes(lc),
    );
  }, [projects, q]);

  return html`
    <div class="proj-list-header">
      <input
        type="search"
        class="proj-search"
        placeholder="Search projects…"
        value=${q}
        onInput=${(e: any) => setQ(e.target.value)}
      />
      <span class="proj-list-count">
        ${q ? `${filtered.length} of ${projects.length}` : projects.length}
        ${" "}project${projects.length !== 1 ? "s" : ""}
      </span>
      <button class="btn-secondary" onClick=${handleAutoGroup} disabled=${grouping}>
        ${grouping ? "Grouping…" : "⚡ Auto-group by design"}
      </button>
      <button class="btn-primary" onClick=${() => setShowNew(true)}>+ New Project</button>
    </div>
    ${loading
      ? html`<div class="empty">Loading projects…</div>`
      : filtered.length === 0
        ? html`<div class="empty">
            ${q
              ? "No projects match your search."
              : "No projects yet. Create one to group related jobs together."}
          </div>`
        : html`
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
          `}
    ${showNew &&
    html`<${NewProjectModal} onClose=${() => setShowNew(false)} onCreate=${handleCreate} />`}
  `;
}

export { ProjectDetail };
