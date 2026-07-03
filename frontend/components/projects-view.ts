// ── Projects view ─────────────────────────────────────────────────────────────

import { h } from "preact";
import { useState, useMemo, useCallback, useRef } from "preact/hooks";
import htm from "htm";

import { fmtTime, fmtWeightTotal } from "./helpers.js";
import { useLocation } from "./router.js";
import { ProjectJobsTable, ProjectPriceSummary, ProjectsBody } from "./projects-view-parts.js";
import { AddJobsModal, NewProjectModal } from "./projects-view-modals.js";
import {
  filterProjects,
  projectCountLabel,
  showAutoGroupToast,
  sumJobPlates,
  updateProjectInList,
  sumJobTime,
  sumJobWeight,
  type Job,
  type Project,
} from "./projects-view-helpers.js";
import { patchJsonOrToast, postJsonOrToast } from "../lib/api.js";
import { useProjectPrice } from "../hooks/use-project-price.js";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

function ProjectDetail({
  project,
  jobs,
  unassignedJobs,
  onBack,
  onJobClick,
  onAddJob,
  onRemoveJob,
  onProjectUpdated,
  onMoveJobToProject,
  onNavigateToProject,
}: {
  project: Project;
  jobs: Job[];
  unassignedJobs: Job[];
  onBack: () => void;
  onJobClick: (job: Job) => void;
  onAddJob: (jobId: number) => void;
  onRemoveJob: (jobId: number) => void;
  onProjectUpdated: (project: Project) => void;
  onMoveJobToProject: (jobId: number, projectId: number) => void;
  onNavigateToProject: (projectId: number) => void;
}) {
  const [showAddJobs, setShowAddJobs] = useState(false);
  const [editing, setEditing] = useState(false);
  const [moveJob, setMoveJob] = useState<Job | null>(null);
  const [editName, setEditName] = useState(project.name ?? "");
  const [editCustomer, setEditCustomer] = useState(project.customer ?? "");
  const [editNotes, setEditNotes] = useState(project.notes ?? "");
  const [newProjectName, setNewProjectName] = useState("");
  const effectiveJobCount = project.job_count ?? jobs.length;
  const price = useProjectPrice(project.id, effectiveJobCount);
  const totW = sumJobWeight(jobs);
  const totT = sumJobTime(jobs);
  const totalPlates = sumJobPlates(jobs);
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

  const saveProject = useCallback(async () => {
    const data = await patchJsonOrToast<{ project?: Project }>(
      `/projects/${project.id}`,
      {
        name: editName.trim(),
        customer: editCustomer.trim() || null,
        notes: editNotes.trim() || null,
      },
      "Failed to update project.",
    );
    if (!data?.project) return;
    onProjectUpdated(data.project);
    setEditing(false);
  }, [editCustomer, editName, editNotes, onProjectUpdated, project.id]);

  const moveToNewProject = useCallback(async () => {
    if (!moveJob) return;
    const name = newProjectName.trim();
    if (!name) return;

    const data = await postJsonOrToast<{ project?: Project }>(
      "/projects",
      { name, customer: moveJob.customer ?? null, notes: null },
      "Failed to create project.",
    );
    if (!data?.project) return;

    onProjectUpdated(data.project);
    onMoveJobToProject(moveJob.id, data.project.id);
    onNavigateToProject(data.project.id);
    setMoveJob(null);
    setNewProjectName("");
  }, [moveJob, newProjectName, onMoveJobToProject, onNavigateToProject, onProjectUpdated]);

  return html`
    <div class="proj-detail">
      <div class="proj-detail-header">
        <button class="btn-back" onClick=${onBack}>← Projects</button>
        <div class="proj-detail-title">
          <h2>${project.name}</h2>
          ${project.customer && html`<span class="customer-pill">${project.customer}</span>`}
        </div>
        <button class="btn-secondary" onClick=${() => setEditing((value) => !value)}>
          ${editing ? "Cancel edit" : "Edit project"}
        </button>
        <button class="btn-secondary" onClick=${() => setShowAddJobs(true)}>+ Add Jobs</button>
      </div>
      ${editing &&
      html`<div class="modal-form proj-detail-notes">
        <label>
          Project name
          <input
            value=${editName}
            onInput=${(e: Event) => setEditName((e.target as HTMLInputElement).value)}
          />
        </label>
        <label>
          Customer
          <input
            value=${editCustomer}
            onInput=${(e: Event) => setEditCustomer((e.target as HTMLInputElement).value)}
          />
        </label>
        <label>
          Notes
          <textarea
            value=${editNotes}
            onInput=${(e: Event) => setEditNotes((e.target as HTMLTextAreaElement).value)}
          />
        </label>
        <button class="btn-primary" disabled=${!editName.trim()} onClick=${saveProject}>
          Save project
        </button>
      </div>`}
      ${project.notes && html`<div class="proj-detail-notes">${project.notes}</div>`}
      <div class="totals-bar">
        <span class="totals-label">Project</span>
        <span>Print runs: <strong>${effectiveJobCount}</strong></span>
        <span>Plates: <strong>${totalPlates}</strong></span>
        <span>Filament: <strong>${fmtWeightTotal(totW)}</strong></span>
        <span>Print time: <strong>${fmtTime(totT)}</strong></span>
        <${ProjectPriceSummary} price=${price} />
      </div>
      <${ProjectJobsTable}
        jobs=${jobsWithStablePrices}
        onJobClick=${onJobClick}
        onRemoveJob=${onRemoveJob}
        onMoveToNewProject=${(job: Job) => {
          setMoveJob(job);
          setNewProjectName(job.designTitle || "");
        }}
      />
      ${showAddJobs &&
      html`<${AddJobsModal}
        unassignedJobs=${unassignedJobs}
        onClose=${() => setShowAddJobs(false)}
        onAdd=${handleAdd}
      />`}
      ${moveJob &&
      html`<div class="modal-backdrop" onClick=${() => setMoveJob(null)}>
        <div class="modal-card" onClick=${(e: MouseEvent) => e.stopPropagation()}>
          <h3>Move print run to new project</h3>
          <p class="modal-subtle">${moveJob.designTitle || "Untitled Job"}</p>
          <label>
            New project name
            <input
              value=${newProjectName}
              onInput=${(e: Event) => setNewProjectName((e.target as HTMLInputElement).value)}
              autofocus
            />
          </label>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" onClick=${() => setMoveJob(null)}>
              Cancel
            </button>
            <button
              type="button"
              class="btn-primary"
              disabled=${!newProjectName.trim()}
              onClick=${moveToNewProject}
            >
              Create and move
            </button>
          </div>
        </div>
      </div>`}
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
  const [renamingProject, setRenamingProject] = useState<Project | null>(null);
  const [renameName, setRenameName] = useState("");
  const [savingRename, setSavingRename] = useState(false);
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

  const startRename = useCallback((project: Project) => {
    setRenamingProject(project);
    setRenameName(project.name ?? "");
  }, []);

  const saveRename = useCallback(async () => {
    if (!renamingProject) return;
    const name = renameName.trim();
    if (!name) return;

    setSavingRename(true);
    try {
      const data = await patchJsonOrToast<{ project?: Project }>(
        `/projects/${renamingProject.id}`,
        { name },
        "Failed to rename project.",
      );
      const updatedProject = data?.project;
      if (!updatedProject) return;
      setProjects((items) => updateProjectInList(items, updatedProject));
      setRenamingProject(null);
      setRenameName("");
    } finally {
      setSavingRename(false);
    }
  }, [renameName, renamingProject, setProjects]);

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
      onRename=${startRename}
    />
    ${showNew &&
    html`<${NewProjectModal} onClose=${() => setShowNew(false)} onCreate=${handleCreate} />`}
    ${renamingProject &&
    html`<div class="modal-backdrop" onClick=${() => setRenamingProject(null)}>
      <div class="modal-card" onClick=${(e: MouseEvent) => e.stopPropagation()}>
        <h3>Rename project</h3>
        <p class="modal-subtle">${renamingProject.name}</p>
        <label>
          Project name
          <input
            value=${renameName}
            onInput=${(e: Event) => setRenameName((e.target as HTMLInputElement).value)}
            autofocus
          />
        </label>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" onClick=${() => setRenamingProject(null)}>
            Cancel
          </button>
          <button
            type="button"
            class="btn-primary"
            disabled=${!renameName.trim() || savingRename}
            onClick=${saveRename}
          >
            ${savingRename ? "Saving…" : "Save name"}
          </button>
        </div>
      </div>
    </div>`}
  `;
}

export { ProjectDetail };
