// ── Projects view ─────────────────────────────────────────────────────────────

import { h } from "preact";
import { useState, useMemo, useCallback, useRef } from "preact/hooks";
import htm from "htm";

import { fmtTime, fmtWeightTotal, fmtDateShort } from "./helpers.js";
import { RowThumb } from "./atoms.js";
import { useLocation } from "./router.js";
import { ProjectJobsTable, ProjectPriceSummary, ProjectsBody } from "./projects-view-parts.js";
import {
  filterJobs,
  filterProjects,
  projectCountLabel,
  showAutoGroupToast,
  sumJobTime,
  sumJobWeight,
  type Job,
  type Project,
} from "./projects-view-helpers.js";
import { postJsonOrToast } from "../lib/api.js";
import { useEscapeClose } from "../hooks/use-escape-close.js";
import { useProjectPrice } from "../hooks/use-project-price.js";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

function onOverlayClick(onClose: () => void) {
  return (e: MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };
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
  const price = useProjectPrice(project.id, jobs.length);
  const totW = sumJobWeight(jobs);
  const totT = sumJobTime(jobs);
  const stableJobPricesRef = useRef(new Map<number, number>());

  const jobsWithStablePrices = useMemo(() => {
    for (const job of jobs) {
      if (job.final_price != null) stableJobPricesRef.current.set(job.id, job.final_price);
    }

    return jobs.map((job) => {
      if (job.final_price != null) return job;
      const cachedPrice = stableJobPricesRef.current.get(job.id);
      if (cachedPrice == null) return job;
      return { ...job, final_price: cachedPrice };
    });
  }, [jobs]);

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
      <${ProjectJobsTable}
        jobs=${jobsWithStablePrices}
        onJobClick=${onJobClick}
        onRemoveJob=${onRemoveJob}
      />
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
      showAutoGroupToast(projects_created, jobs_assigned);
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
