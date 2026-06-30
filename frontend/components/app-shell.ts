import { h } from "preact";
import htm from "htm";

import { Toolbar, TotalsBar, TableView, GridView, PrinterBreakdownView } from "./jobs-view.js";
import { ProjectsView, ProjectDetail } from "./projects-view.js";
import { AdminView } from "./admin-view.js";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

type Summary = {
  totals?: Record<string, number> | null;
  by_device?: Array<{
    deviceModel?: string | null;
    total_jobs?: number;
    total_plates?: number | null;
    total_time_s?: number | null;
  }>;
} | null;

type Job = {
  id: number;
  project_id?: number | null;
  deviceModel?: string;
  status?: string;
  startTime?: string;
  designTitle?: string;
  customer?: string;
  [key: string]: unknown;
};

type Project = {
  id: number;
  [key: string]: unknown;
};

export function LoadingView({
  bootStatus,
  loadProgress,
}: {
  bootStatus: string;
  loadProgress: number;
}) {
  return html` <div class="in-app-loading" role="status" aria-live="polite">
    <section class="dashboard-loader-card">
      <div class="dashboard-loader-copy">
        <div class="loader-hero-row dashboard-loader-title-row">
          <div class="loader-cursor cursor-blink" aria-hidden="true"></div>
          <div>
            <p class="dashboard-loader-kicker">INTERNAL PRINT DASHBOARD</p>
            <h1 class="dashboard-loader-title">loading workspace</h1>
          </div>
        </div>
        <p class="dashboard-loader-copy-text">
          Fetching jobs, projects, pricing, rates, and cover cache metadata…
        </p>
        <p class="dashboard-loader-copy-text">${bootStatus}</p>
        <div class="dashboard-loader-steps" aria-hidden="true">
          <span>jobs</span>
          <span>projects</span>
          <span>rates</span>
          <span>covers</span>
        </div>
        <div
          class="dashboard-loader-progress"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow=${Math.round(loadProgress)}
        >
          <span style=${`width:${Math.max(8, loadProgress)}%`}></span>
        </div>
      </div>
      <div class="dashboard-loader-preview" aria-hidden="true">
        <div class="dashboard-loader-stat"><span></span><strong></strong></div>
        <div class="dashboard-loader-stat"><span></span><strong></strong></div>
        <div class="dashboard-loader-table">
          ${Array.from(
            { length: 5 },
            (_, i) => html`
              <div class="dashboard-loader-row" key=${i}>
                <span></span><span></span><span></span><span></span>
              </div>
            `,
          )}
        </div>
      </div>
    </section>
  </div>`;
}

export function ErrorView({ error }: { error: string }) {
  return html`<div class="app-loading">
    <div class="loader-shell">
      <div class="loader-main loader-error">
        <div class="loader-hero-row">
          <div class="loader-cursor" aria-hidden="true"></div>
          <h1 class="loader-title">failed to load</h1>
        </div>
        <p class="loader-copy">${error}</p>
      </div>
    </div>
  </div>`;
}

function ProjectRouteView({
  projectId,
  projects,
  jobs,
  projectsLoading,
  navigate,
  setSelectedJob,
  handleJobProjectChange,
  setProjects,
}: {
  projectId: number;
  projects: Project[];
  jobs: Job[];
  projectsLoading: boolean;
  navigate: (path: string) => void;
  setSelectedJob: (job: Job | null) => void;
  handleJobProjectChange: (jobId: number, projectId: number | null) => void;
  setProjects: (updater: Project[] | ((ps: Project[]) => Project[])) => void;
}) {
  const project = projects.find((p) => Number(p.id) === projectId);
  const projectJobs = jobs.filter((j) => Number(j.project_id) === projectId);

  if (!project) {
    if (projectsLoading) {
      return html`<div class="empty">Loading projects…</div>`;
    }
    return html`<div class="empty">Project not found.</div>`;
  }

  const unassignedJobs = jobs.filter((j) => j.project_id == null);
  return html`<${ProjectDetail}
    project=${project}
    jobs=${projectJobs}
    unassignedJobs=${unassignedJobs}
    onBack=${() => navigate("/projects")}
    onJobClick=${setSelectedJob}
    onAddJob=${(jobId: number) => handleJobProjectChange(jobId, projectId)}
    onRemoveJob=${(jobId: number) => handleJobProjectChange(jobId, null)}
    onProjectUpdated=${(updated: Project) =>
      setProjects((items) =>
        items.some((item) => item.id === updated.id)
          ? items.map((item) => (item.id === updated.id ? updated : item))
          : [updated, ...items],
      )}
    onMoveJobToProject=${(jobId: number, newProjectId: number) =>
      handleJobProjectChange(jobId, newProjectId)}
    onNavigateToProject=${(newProjectId: number) => navigate(`/projects/${newProjectId}`)}
  />`;
}

function renderJobsBody({
  sorted,
  view,
  sortCol,
  sortDir,
  onSort,
  onJobClick,
  density,
}: {
  sorted: Job[];
  view: string;
  sortCol: string;
  sortDir: "asc" | "desc";
  onSort: (col: string) => void;
  onJobClick: (job: Job) => void;
  density: "compact" | "comfy";
}) {
  if (sorted.length === 0) {
    return html`<div class="empty">No jobs match your filters.</div>`;
  }

  if (view === "table") {
    return html`<${TableView}
      sorted=${sorted}
      sortCol=${sortCol}
      sortDir=${sortDir}
      onSort=${onSort}
      onJobClick=${onJobClick}
      density=${density}
    />`;
  }

  return html`<${GridView} sorted=${sorted} onJobClick=${onJobClick} density=${density} />`;
}

function JobsRouteView({
  q,
  setQ,
  statusFilter,
  setStatusFilter,
  deviceFilter,
  setDeviceFilter,
  devices,
  view,
  setView,
  filtered,
  jobs,
  isFiltered,
  sorted,
  sortCol,
  sortDir,
  onSort,
  onJobClick,
  density,
  setDensity,
}: {
  q: string;
  setQ: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  deviceFilter: string;
  setDeviceFilter: (v: string) => void;
  devices: string[];
  view: string;
  setView: (view: string) => void;
  filtered: Job[];
  jobs: Job[];
  isFiltered: boolean;
  sorted: Job[];
  sortCol: string;
  sortDir: "asc" | "desc";
  onSort: (col: string) => void;
  onJobClick: (job: Job) => void;
  density: "compact" | "comfy";
  setDensity: (density: "compact" | "comfy") => void;
}) {
  return html`
    <${Toolbar}
      q=${q}
      setQ=${setQ}
      statusFilter=${statusFilter}
      setStatusFilter=${setStatusFilter}
      deviceFilter=${deviceFilter}
      setDeviceFilter=${setDeviceFilter}
      devices=${devices}
      view=${view}
      setView=${setView}
      density=${density}
      setDensity=${setDensity}
      filteredCount=${filtered.length}
      totalCount=${jobs.length}
    />
    <${TotalsBar} filtered=${filtered} isFiltered=${isFiltered} />
    ${renderJobsBody({ sorted, view, sortCol, sortDir, onSort, onJobClick, density })}
  `;
}

export type RouteState = {
  isAdmin: boolean;
  isPrinters: boolean;
  isProjects: boolean;
  projectId: number | null;
};

export function getRouteState(loc: string): RouteState {
  const projectDetailMatch = loc.match(/^\/projects\/(\d+)$/);
  return {
    isAdmin: loc.startsWith("/admin"),
    isPrinters: loc.startsWith("/printers"),
    isProjects: loc.startsWith("/projects"),
    projectId: projectDetailMatch ? Number(projectDetailMatch[1]) : null,
  };
}

export function renderMainContent({
  route,
  summary,
  projects,
  setProjects,
  jobs,
  projectsLoading,
  navigate,
  setSelectedJob,
  handleJobProjectChange,
  handleRatesChanged,
  handleAutoGroup,
  projectPrices,
  q,
  setQ,
  statusFilter,
  setStatusFilter,
  deviceFilter,
  setDeviceFilter,
  devices,
  view,
  setView,
  filtered,
  isFiltered,
  sorted,
  sortCol,
  sortDir,
  density,
  setDensity,
  handleSort,
}: {
  route: RouteState;
  summary: Summary;
  projects: Project[];
  setProjects: (updater: Project[] | ((ps: Project[]) => Project[])) => void;
  jobs: Job[];
  projectsLoading: boolean;
  navigate: (path: string) => void;
  setSelectedJob: (job: Job | null) => void;
  handleJobProjectChange: (jobId: number, projectId: number | null) => void;
  handleRatesChanged: () => void;
  handleAutoGroup: () => void;
  projectPrices: Record<number, number>;
  q: string;
  setQ: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  deviceFilter: string;
  setDeviceFilter: (v: string) => void;
  devices: string[];
  view: string;
  setView: (v: string) => void;
  filtered: Job[];
  isFiltered: boolean;
  sorted: Job[];
  sortCol: string;
  sortDir: "asc" | "desc";
  density: "compact" | "comfy";
  setDensity: (density: "compact" | "comfy") => void;
  handleSort: (col: string) => void;
}) {
  if (route.isAdmin) return html`<${AdminView} onRatesChanged=${handleRatesChanged} />`;
  if (route.isPrinters) {
    return html`<${PrinterBreakdownView}
      summary=${summary}
      jobs=${jobs}
      onJobClick=${setSelectedJob}
    />`;
  }

  if (route.projectId != null) {
    return html`<${ProjectRouteView}
      projectId=${route.projectId}
      projects=${projects}
      jobs=${jobs}
      projectsLoading=${projectsLoading}
      navigate=${navigate}
      setSelectedJob=${setSelectedJob}
      handleJobProjectChange=${handleJobProjectChange}
      setProjects=${setProjects}
    />`;
  }

  if (route.isProjects) {
    return html`<${ProjectsView}
      projects=${projects}
      setProjects=${setProjects}
      onAutoGroup=${handleAutoGroup}
      projectPrices=${projectPrices}
      loading=${projectsLoading}
    />`;
  }

  return html`<${JobsRouteView}
    q=${q}
    setQ=${setQ}
    statusFilter=${statusFilter}
    setStatusFilter=${setStatusFilter}
    deviceFilter=${deviceFilter}
    setDeviceFilter=${setDeviceFilter}
    devices=${devices}
    view=${view}
    setView=${setView}
    filtered=${filtered}
    jobs=${jobs}
    isFiltered=${isFiltered}
    sorted=${sorted}
    sortCol=${sortCol}
    sortDir=${sortDir}
    onSort=${handleSort}
    onJobClick=${setSelectedJob}
    density=${density}
    setDensity=${setDensity}
  />`;
}
