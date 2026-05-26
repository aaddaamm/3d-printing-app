import { h, render, type ComponentChild } from "preact";
import { useState, useMemo, useCallback } from "preact/hooks";
import htm from "htm";

import { RouterProvider, useLocation } from "./components/router.js";
import { Header } from "./components/jobs-view.js";
import { Modal } from "./components/modal.js";
import {
  LoadingView,
  ErrorView,
  getRouteState,
  renderMainContent,
} from "./components/app-shell.js";
import { toast, ToastContainer } from "./components/toast.js";
import { fetchJson, patchJsonOrToast } from "./lib/api.js";
import { useDashboardBootstrap } from "./components/bootstrap.js";
import { filterDashboardJobs, sortDashboardJobs } from "./components/dashboard-job-helpers.js";

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
type DataRange = { min_start?: string; max_start?: string; task_count?: number } | null;

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

type SortDir = "asc" | "desc";

type AppState = ReturnType<typeof useAppState>;

function useAppState() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectPrices, setProjectPrices] = useState<Record<number, number>>({});
  const [summary, setSummary] = useState<Summary>(null);
  const [dataRange, setDataRange] = useState<DataRange>(null);

  const [view, setView] = useState("table");
  const [density, setDensity] = useState<"compact" | "comfy">("comfy");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("");
  const [sortCol, setSortCol] = useState("startTime");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  return {
    jobs,
    setJobs,
    projects,
    setProjects,
    projectPrices,
    setProjectPrices,
    summary,
    setSummary,
    dataRange,
    setDataRange,
    view,
    setView,
    density,
    setDensity,
    q,
    setQ,
    statusFilter,
    setStatusFilter,
    deviceFilter,
    setDeviceFilter,
    sortCol,
    setSortCol,
    sortDir,
    setSortDir,
    selectedJob,
    setSelectedJob,
  };
}

type UseJobActionsArgs = {
  setJobs: (updater: (jobs: Job[]) => Job[]) => void;
  setProjects: (updater: Project[]) => void;
  setSummary: (summary: Summary) => void;
  setSelectedJob: (job: Job | null | ((prev: Job | null) => Job | null)) => void;
  navigate: (path: string) => void;
  refreshProjectsAndPrices: () => void;
  refreshJobPrices: (isRefresh?: boolean) => void;
};

type UseJobsViewStateArgs = {
  jobs: Job[];
  q: string;
  statusFilter: string;
  deviceFilter: string;
  sortCol: string;
  sortDir: SortDir;
  setSortCol: (col: string) => void;
  setSortDir: (updater: (dir: SortDir) => SortDir) => void;
  loc: string;
};

function useJobsViewState({
  jobs,
  q,
  statusFilter,
  deviceFilter,
  sortCol,
  sortDir,
  setSortCol,
  setSortDir,
  loc,
}: UseJobsViewStateArgs) {
  const devices = useMemo(
    () => [...new Set(jobs.map((j) => j.deviceModel).filter((d): d is string => !!d))].sort(),
    [jobs],
  );

  const isFiltered = !!(q || statusFilter || deviceFilter);
  const filtered = useMemo(
    () => filterDashboardJobs(jobs, q, statusFilter, deviceFilter),
    [jobs, q, statusFilter, deviceFilter],
  );
  const sorted = useMemo(
    () => sortDashboardJobs(filtered, sortCol, sortDir),
    [filtered, sortCol, sortDir],
  );

  const handleSort = useCallback(
    (col: string) => {
      if (sortCol === col) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return;
      }
      setSortCol(col);
      setSortDir(() => (col === "startTime" ? "desc" : "asc"));
    },
    [sortCol, setSortCol, setSortDir],
  );

  const route = useMemo(() => getRouteState(loc), [loc]);

  return { devices, isFiltered, filtered, sorted, handleSort, route };
}

function useJobActions({
  setJobs,
  setProjects,
  setSummary,
  setSelectedJob,
  navigate,
  refreshProjectsAndPrices,
  refreshJobPrices,
}: UseJobActionsArgs) {
  const applyPatchedJob = useCallback((jobId: number, patch: Record<string, unknown>) => {
    setJobs((js) => js.map((j) => (j.id === jobId ? { ...j, ...patch } : j)));
    setSelectedJob((j) => (j && j.id === jobId ? { ...j, ...patch } : j));
  }, []);

  const patchJob = useCallback(
    async (jobId: number, fields: Record<string, unknown>) => {
      const data = await patchJsonOrToast(`/jobs/${jobId}`, fields, "Failed to update job.");
      if (!data?.job) return null;
      const { job } = data;
      applyPatchedJob(jobId, job as Record<string, unknown>);
      return job;
    },
    [applyPatchedJob],
  );

  const patchJobField = useCallback(
    (jobId: number, fields: Record<string, unknown>) => {
      patchJob(jobId, fields);
    },
    [patchJob],
  );

  const handleJobProjectChange = useCallback(
    async (jobId: number, projectId: number | null) => {
      const job = await patchJob(jobId, { project_id: projectId });
      if (!job) return;
      refreshProjectsAndPrices();
    },
    [patchJob, refreshProjectsAndPrices],
  );

  const handleJobStatusChange = useCallback(
    (jobId: number, statusOverride: string | null) => {
      patchJobField(jobId, { status_override: statusOverride });
    },
    [patchJobField],
  );

  const handleJobExtraLaborChange = useCallback(
    (jobId: number, minutes: number | null) => {
      patchJobField(jobId, { extra_labor_minutes: minutes });
    },
    [patchJobField],
  );

  const handleNavigateToProject = useCallback(
    (projectId: number) => {
      setSelectedJob(null);
      navigate(`/projects/${projectId}`);
    },
    [navigate],
  );

  const refreshPricingViews = useCallback(() => {
    refreshJobPrices(true);
    refreshProjectsAndPrices();
  }, [refreshJobPrices, refreshProjectsAndPrices]);

  const handleRatesChanged = useCallback(async () => {
    refreshPricingViews();
    try {
      const data = await fetchJson("/summary", "Failed to refresh summary.");
      setSummary(data as Summary);
      toast("Pricing refreshed from updated rates.", "success");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Updated rates saved, but summary refresh failed.";
      toast(message, "error");
    }
  }, [refreshPricingViews, setSummary]);

  const handleAutoGroup = useCallback(async () => {
    const [jobsData, projData] = await Promise.all([
      fetchJson<{ jobs: Job[] }>("/ui/data", "Failed to refresh jobs."),
      fetchJson<{ projects: Project[] }>("/projects", "Failed to refresh projects."),
    ]);
    setJobs(() => jobsData.jobs);
    setProjects(projData.projects);
    refreshPricingViews();
  }, [refreshPricingViews, setProjects]);

  const closeModal = useCallback(() => setSelectedJob(null), []);

  return {
    closeModal,
    patchJob,
    handleJobProjectChange,
    handleJobStatusChange,
    handleJobExtraLaborChange,
    handleNavigateToProject,
    handleRatesChanged,
    handleAutoGroup,
  };
}

function SelectedJobModal({
  selectedJob,
  closeModal,
  patchJob,
  projects,
  handleJobProjectChange,
  handleJobStatusChange,
  handleJobExtraLaborChange,
  handleNavigateToProject,
}: {
  selectedJob: Job | null;
  closeModal: () => void;
  patchJob: (jobId: number, fields: Record<string, unknown>) => Promise<unknown>;
  projects: Project[];
  handleJobProjectChange: (jobId: number, projectId: number | null) => Promise<void>;
  handleJobStatusChange: (jobId: number, statusOverride: string | null) => void;
  handleJobExtraLaborChange: (jobId: number, minutes: number | null) => void;
  handleNavigateToProject: (projectId: number) => void;
}) {
  if (!selectedJob) return null;

  return html`<${Modal}
    key=${selectedJob.id}
    job=${selectedJob}
    onClose=${closeModal}
    onPatch=${patchJob}
    projects=${projects}
    onJobProjectChange=${handleJobProjectChange}
    onJobStatusChange=${handleJobStatusChange}
    onJobExtraLaborChange=${handleJobExtraLaborChange}
    onNavigateToProject=${handleNavigateToProject}
  />`;
}

function useBootstrapData(state: AppState) {
  const setProjectsFromBootstrap = useCallback(
    (items: unknown[]) => state.setProjects(items as Project[]),
    [state.setProjects],
  );
  const setSummaryFromBootstrap = useCallback(
    (next: unknown) => state.setSummary(next as Summary),
    [state.setSummary],
  );
  const setDataRangeFromBootstrap = useCallback(
    (next: unknown) => state.setDataRange(next as DataRange),
    [state.setDataRange],
  );

  return useDashboardBootstrap({
    setJobs: state.setJobs,
    setProjects: setProjectsFromBootstrap,
    setProjectPrices: state.setProjectPrices,
    setSummary: setSummaryFromBootstrap,
    setDataRange: setDataRangeFromBootstrap,
    toast,
  });
}

// ── App ──────────────────────────────────────────────────────────────────────

function App() {
  const state = useAppState();
  const [loc, navigate] = useLocation();

  const {
    loading,
    projectsLoading,
    loadProgress,
    error,
    bootStatus,
    refreshProjectsAndPrices,
    refreshJobPrices,
  } = useBootstrapData(state);

  const { devices, isFiltered, filtered, sorted, handleSort, route } = useJobsViewState({
    jobs: state.jobs,
    q: state.q,
    statusFilter: state.statusFilter,
    deviceFilter: state.deviceFilter,
    sortCol: state.sortCol,
    sortDir: state.sortDir,
    setSortCol: state.setSortCol,
    setSortDir: state.setSortDir,
    loc,
  });

  const {
    closeModal,
    patchJob,
    handleJobProjectChange,
    handleJobStatusChange,
    handleJobExtraLaborChange,
    handleNavigateToProject,
    handleRatesChanged,
    handleAutoGroup,
  } = useJobActions({
    setJobs: state.setJobs,
    setProjects: state.setProjects,
    setSummary: state.setSummary,
    setSelectedJob: state.setSelectedJob,
    navigate,
    refreshProjectsAndPrices,
    refreshJobPrices,
  });

  if (loading) {
    return html`<${LoadingView} bootStatus=${bootStatus} loadProgress=${loadProgress} />`;
  }
  if (error) return html`<${ErrorView} error=${error} />`;

  return html`
    <${Header} summary=${state.summary} dataRange=${state.dataRange} />
    ${renderMainContent({
      route,
      summary: state.summary,
      projects: state.projects,
      setProjects: state.setProjects,
      jobs: state.jobs,
      projectsLoading,
      navigate,
      setSelectedJob: state.setSelectedJob,
      handleJobProjectChange,
      handleRatesChanged,
      handleAutoGroup,
      projectPrices: state.projectPrices,
      q: state.q,
      setQ: state.setQ,
      statusFilter: state.statusFilter,
      setStatusFilter: state.setStatusFilter,
      deviceFilter: state.deviceFilter,
      setDeviceFilter: state.setDeviceFilter,
      devices,
      view: state.view,
      setView: state.setView,
      density: state.density,
      setDensity: state.setDensity,
      filtered,
      isFiltered,
      sorted,
      sortCol: state.sortCol,
      sortDir: state.sortDir,
      handleSort,
    })}
    <${SelectedJobModal}
      selectedJob=${state.selectedJob}
      closeModal=${closeModal}
      patchJob=${patchJob}
      projects=${state.projects}
      handleJobProjectChange=${handleJobProjectChange}
      handleJobStatusChange=${handleJobStatusChange}
      handleJobExtraLaborChange=${handleJobExtraLaborChange}
      handleNavigateToProject=${handleNavigateToProject}
    />
    <${ToastContainer} />
  `;
}

const rootVNode =
  html`<${RouterProvider} base="/ui"><${App} /></${RouterProvider}>` as ComponentChild;
render(rootVNode, document.getElementById("app")!);
