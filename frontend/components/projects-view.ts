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
  sumJobTime,
  sumJobWeight,
  type Job,
  type Project,
} from "./projects-view-helpers.js";
import { postJsonOrToast } from "../lib/api.js";
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
