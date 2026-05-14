import { h, render } from "preact";
import { useState, useMemo, useCallback } from "preact/hooks";
import htm from "htm";

import { RouterProvider, useLocation } from "./components/router.js";
import { Header, Toolbar, TotalsBar, TableView, GridView } from "./components/jobs-view.js";
import { Modal } from "./components/modal.js";
import { ProjectsView, ProjectDetail } from "./components/projects-view.js";
import { AdminView } from "./components/admin-view.js";
import { toast, ToastContainer } from "./components/toast.js";
import { fetchJson, patchJsonOrToast } from "./lib/api.js";
import { useDashboardBootstrap } from "./components/bootstrap.js";

const html = htm.bind(h);

function filterJobs(jobs, q, statusFilter, deviceFilter) {
  return jobs.filter((j) => {
    const text = ((j.designTitle || "") + " " + (j.customer || "")).toLowerCase();
    if (q && !text.includes(q.toLowerCase())) return false;
    if (statusFilter && (j.status || "").toLowerCase() !== statusFilter) return false;
    if (deviceFilter && j.deviceModel !== deviceFilter) return false;
    return true;
  });
}

function sortJobs(filtered, sortCol, sortDir) {
  return [...filtered].sort((a, b) => {
    let av = a[sortCol];
    let bv = b[sortCol];
    if (av == null) av = sortDir === "asc" ? Infinity : -Infinity;
    if (bv == null) bv = sortDir === "asc" ? Infinity : -Infinity;
    if (typeof av === "string") {
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return sortDir === "asc" ? av - bv : bv - av;
  });
}

function LoadingView({ bootStatus, loadProgress }) {
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

function ErrorView({ error }) {
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
}) {
  const project = projects.find((p) => p.id === projectId);
  const projectJobs = jobs.filter((j) => j.project_id === projectId);

  if (!project) {
    return projectsLoading
      ? html`<div class="empty">Loading projects…</div>`
      : html`<div class="empty">Project not found.</div>`;
  }

  const unassignedJobs = jobs.filter((j) => j.project_id == null);
  return html`<${ProjectDetail}
    project=${project}
    jobs=${projectJobs}
    unassignedJobs=${unassignedJobs}
    onBack=${() => navigate("/projects")}
    onJobClick=${setSelectedJob}
    onAddJob=${(jobId) => handleJobProjectChange(jobId, projectId)}
    onRemoveJob=${(jobId) => handleJobProjectChange(jobId, null)}
  />`;
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
      filteredCount=${filtered.length}
      totalCount=${jobs.length}
    />
    <${TotalsBar} filtered=${filtered} isFiltered=${isFiltered} />
    ${sorted.length === 0
      ? html`<div class="empty">No jobs match your filters.</div>`
      : view === "table"
        ? html`<${TableView}
            sorted=${sorted}
            sortCol=${sortCol}
            sortDir=${sortDir}
            onSort=${onSort}
            onJobClick=${onJobClick}
          />`
        : html`<${GridView} sorted=${sorted} onJobClick=${onJobClick} />`}
  `;
}

// ── App ──────────────────────────────────────────────────────────────────────

function App() {
  const [jobs, setJobs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectPrices, setProjectPrices] = useState({});
  const [summary, setSummary] = useState(null);

  const [view, setView] = useState("table");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("");
  const [sortCol, setSortCol] = useState("startTime");
  const [sortDir, setSortDir] = useState("desc");
  const [selectedJob, setSelectedJob] = useState(null);
  const [loc, navigate] = useLocation();

  const {
    loading,
    projectsLoading,
    loadProgress,
    error,
    bootStatus,
    refreshProjectsAndPrices,
    refreshJobPrices,
  } = useDashboardBootstrap({
    setJobs,
    setProjects,
    setProjectPrices,
    setSummary,
    toast,
  });

  const devices = useMemo(
    () => [...new Set(jobs.map((j) => j.deviceModel).filter(Boolean))].sort(),
    [jobs],
  );

  const isFiltered = !!(q || statusFilter || deviceFilter);

  const filtered = useMemo(
    () => filterJobs(jobs, q, statusFilter, deviceFilter),
    [jobs, q, statusFilter, deviceFilter],
  );

  const sorted = useMemo(() => sortJobs(filtered, sortCol, sortDir), [filtered, sortCol, sortDir]);

  const handleSort = useCallback(
    (col) => {
      if (sortCol === col) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortCol(col);
        setSortDir(col === "startTime" ? "desc" : "asc");
      }
    },
    [sortCol],
  );

  const closeModal = useCallback(() => setSelectedJob(null), []);

  // Generic job patch helper — updates local state from the returned job
  const patchJob = useCallback(async (jobId, fields) => {
    const data = await patchJsonOrToast(`/jobs/${jobId}`, fields, "Failed to update job.");
    if (!data?.job) return null;
    const { job } = data;
    setJobs((js) => js.map((j) => (j.id === jobId ? { ...j, ...job } : j)));
    setSelectedJob((j) => (j && j.id === jobId ? { ...j, ...job } : j));
    return job;
  }, []);

  const handleJobProjectChange = useCallback(
    async (jobId, projectId) => {
      const job = await patchJob(jobId, { project_id: projectId });
      if (!job) return;
      // Refresh project stats and prices (job counts / totals changed)
      refreshProjectsAndPrices();
    },
    [patchJob, refreshProjectsAndPrices],
  );

  const patchJobField = useCallback(
    (jobId, fields) => {
      patchJob(jobId, fields);
    },
    [patchJob],
  );

  const handleJobStatusChange = useCallback(
    (jobId, statusOverride) => {
      patchJobField(jobId, { status_override: statusOverride });
    },
    [patchJobField],
  );

  const handleJobExtraLaborChange = useCallback(
    (jobId, minutes) => {
      patchJobField(jobId, { extra_labor_minutes: minutes });
    },
    [patchJobField],
  );

  const handleNavigateToProject = useCallback(
    (projectId) => {
      setSelectedJob(null);
      navigate(`/projects/${projectId}`);
    },
    [navigate],
  );

  const refreshSummary = useCallback(async () => {
    const data = await fetchJson("/summary", "Failed to refresh summary.");
    setSummary(data);
  }, []);

  const handleRatesChanged = useCallback(async () => {
    refreshJobPrices(true);
    refreshProjectsAndPrices();
    try {
      await refreshSummary();
      toast("Pricing refreshed from updated rates.", "success");
    } catch (err) {
      toast(err?.message || "Updated rates saved, but summary refresh failed.", "error");
    }
  }, [refreshJobPrices, refreshProjectsAndPrices, refreshSummary]);

  const handleAutoGroup = useCallback(async () => {
    const [jobsData, projData] = await Promise.all([
      fetchJson("/ui/data", "Failed to refresh jobs."),
      fetchJson("/projects", "Failed to refresh projects."),
    ]);
    setJobs(jobsData.jobs);
    setProjects(projData.projects);
    refreshJobPrices(true);
    refreshProjectsAndPrices();
  }, [refreshJobPrices, refreshProjectsAndPrices]);

  if (loading)
    return html`<${LoadingView} bootStatus=${bootStatus} loadProgress=${loadProgress} />`;
  if (error) return html`<${ErrorView} error=${error} />`;

  const projectDetailMatch = loc.match(/^\/projects\/(\d+)$/);
  const isProjects = loc.startsWith("/projects");

  const renderMainContent = () => {
    if (loc.startsWith("/admin")) {
      return html`<${AdminView} onRatesChanged=${handleRatesChanged} />`;
    }

    if (projectDetailMatch) {
      return html`<${ProjectRouteView}
        projectId=${Number(projectDetailMatch[1])}
        projects=${projects}
        jobs=${jobs}
        projectsLoading=${projectsLoading}
        navigate=${navigate}
        setSelectedJob=${setSelectedJob}
        handleJobProjectChange=${handleJobProjectChange}
      />`;
    }

    if (isProjects) {
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
    />`;
  };

  return html`
    <${Header} summary=${summary} />
    ${renderMainContent()}
    ${selectedJob &&
    html`<${Modal}
      key=${selectedJob.id}
      job=${selectedJob}
      onClose=${closeModal}
      onPatch=${patchJob}
      projects=${projects}
      onJobProjectChange=${handleJobProjectChange}
      onJobStatusChange=${handleJobStatusChange}
      onJobExtraLaborChange=${handleJobExtraLaborChange}
      onNavigateToProject=${handleNavigateToProject}
    />`}
    <${ToastContainer} />
  `;
}

render(
  html`<${RouterProvider} base="/ui"><${App} /></${RouterProvider}>`,
  document.getElementById("app"),
);
