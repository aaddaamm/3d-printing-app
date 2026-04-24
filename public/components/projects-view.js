// ── Projects view ─────────────────────────────────────────────────────────────

import { h } from "https://esm.sh/preact@10";
import { useState, useEffect, useMemo, useCallback } from "https://esm.sh/preact@10/hooks";
import htm from "https://esm.sh/htm@3";

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

const html = htm.bind(h);

async function errorMessage(res, fallback) {
  try {
    const data = await res.json();
    return data.error || fallback;
  } catch {
    return fallback;
  }
}

function NewProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [customer, setCustomer] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!name.trim()) return;
      setSaving(true);
      try {
        const res = await fetch("/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            customer: customer || null,
            notes: notes || null,
          }),
        });
        if (!res.ok) {
          toast(await errorMessage(res, "Failed to create project."), "error");
          return;
        }
        const data = await res.json();
        onCreate(data.project);
        onClose();
      } catch {
        toast("Network error while creating project.", "error");
      } finally {
        setSaving(false);
      }
    },
    [name, customer, notes, onCreate, onClose],
  );

  return html`
    <div class="overlay" onClick=${(e) => e.target === e.currentTarget && onClose()}>
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
                onInput=${(e) => setName(e.target.value)}
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
                onInput=${(e) => setCustomer(e.target.value)}
                placeholder="Optional"
              />
            </label>
            <label class="form-label"
              >Notes
              <textarea
                class="form-input form-textarea"
                value=${notes}
                onInput=${(e) => setNotes(e.target.value)}
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

function AddJobsModal({ unassignedJobs, onClose, onAdd }) {
  const [q, setQ] = useState("");
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);
  const filtered = useMemo(() => {
    if (!q) return unassignedJobs;
    const lc = q.toLowerCase();
    return unassignedJobs.filter((j) =>
      ((j.designTitle || "") + " " + (j.customer || "")).toLowerCase().includes(lc),
    );
  }, [unassignedJobs, q]);
  return html`
    <div class="overlay" onClick=${(e) => e.target === e.currentTarget && onClose()}>
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
            onInput=${(e) => setQ(e.target.value)}
          />
          ${filtered.length === 0
            ? html`<div class="empty" style="padding:16px 0">
                ${q ? "No matches." : "All jobs are already assigned to projects."}
              </div>`
            : html`<div class="add-jobs-list">
                ${filtered.map(
                  (job) => html`
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

function ProjectDetail({
  project,
  jobs,
  unassignedJobs,
  onBack,
  onDelete,
  onJobClick,
  onAddJob,
  onRemoveJob,
}) {
  const [showAddJobs, setShowAddJobs] = useState(false);
  const [price, setPrice] = useState(null);
  const totW = jobs.reduce((s, j) => s + (j.total_weight_g || 0), 0);
  const totT = jobs.reduce((s, j) => s + (j.total_time_s || 0), 0);

  useEffect(() => {
    setPrice(null);
    if (!jobs.length) return;
    fetch(`/projects/${project.id}/price`)
      .then((r) => r.json())
      .then(setPrice)
      .catch(() => {});
  }, [project.id, jobs.length]);

  const handleDelete = useCallback(async () => {
    if (!confirm(`Delete project "${project.name}"? Jobs will be unassigned but not deleted.`))
      return;
    try {
      const res = await fetch(`/projects/${project.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast(await errorMessage(res, "Failed to delete project."), "error");
        return;
      }
      onDelete(project.id);
      toast("Project deleted.", "success");
    } catch {
      toast("Network error while deleting project.", "error");
    }
  }, [project, onDelete]);

  const handleAdd = useCallback(
    (jobId) => {
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
        <button class="btn-danger" onClick=${handleDelete}>Delete</button>
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
                    (job) => html`
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
                            onClick=${(e) => {
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
}) {
  const [showNew, setShowNew] = useState(false);
  const [grouping, setGrouping] = useState(false);
  const [q, setQ] = useState("");
  const [, navigate] = useLocation();

  const handleAutoGroup = useCallback(async () => {
    setGrouping(true);
    try {
      const res = await fetch("/projects/auto-group", { method: "POST" });
      if (!res.ok) {
        toast(await errorMessage(res, "Auto-group failed."), "error");
        return;
      }
      const { projects_created, jobs_assigned } = await res.json();
      await onAutoGroup();
      if (projects_created === 0) {
        toast("No ungrouped jobs found — everything is already assigned to a project.", "info");
      } else {
        toast(
          `Created ${projects_created} project${projects_created !== 1 ? "s" : ""}, assigned ${jobs_assigned} job${jobs_assigned !== 1 ? "s" : ""}.`,
          "success",
        );
      }
    } catch {
      toast("Network error while auto-grouping projects.", "error");
    } finally {
      setGrouping(false);
    }
  }, [onAutoGroup]);

  const handleCreate = useCallback(
    (project) => {
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
        onInput=${(e) => setQ(e.target.value)}
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
