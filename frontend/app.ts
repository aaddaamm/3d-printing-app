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

function filterJobs(jobs: Job[], q: string, statusFilter: string, deviceFilter: string) {
  return jobs.filter((j) => {
    const text = ((j.designTitle || "") + " " + (j.customer || "")).toLowerCase();
    if (q && !text.includes(q.toLowerCase())) return false;
    if (statusFilter && (j.status || "").toLowerCase() !== statusFilter) return false;
    if (deviceFilter && j.deviceModel !== deviceFilter) return false;
    return true;
  });
}

function sortJobs(filtered: Job[], sortCol: string, sortDir: "asc" | "desc") {
  return [...filtered].sort((a, b) => {
    let av = a[sortCol] as string | number | null | undefined;
    let bv = b[sortCol] as string | number | null | undefined;
    if (av == null) av = sortDir === "asc" ? Infinity : -Infinity;
    if (bv == null) bv = sortDir === "asc" ? Infinity : -Infinity;
    if (typeof av === "string") {
      const bvs = typeof bv === "string" ? bv : String(bv);
      return sortDir === "asc" ? av.localeCompare(bvs) : bvs.localeCompare(av);
    }
    const avn = Number(av);
    const bvn = Number(bv);
    return sortDir === "asc" ? avn - bvn : bvn - avn;
  });
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
  sortDir: "asc" | "desc";
  setSortCol: (col: string) => void;
  setSortDir: (updater: (dir: "asc" | "desc") => "asc" | "desc") => void;
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
    () => filterJobs(jobs, q, statusFilter, deviceFilter),
    [jobs, q, statusFilter, deviceFilter],
  );

  const sorted = useMemo(() => sortJobs(filtered, sortCol, sortDir), [filtered, sortCol, sortDir]);

  const handleSort = useCallback(
    (col: string) => {
      if (sortCol === col) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortCol(col);
        setSortDir(() => (col === "startTime" ? "desc" : "asc"));
      }
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

// ── App ──────────────────────────────────────────────────────────────────────

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectPrices, setProjectPrices] = useState<Record<number, number>>({});
  const [summary, setSummary] = useState<Summary>(null);
  const [dataRange, setDataRange] = useState<DataRange>(null);

  const [view, setView] = useState("table");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("");
  const [sortCol, setSortCol] = useState("startTime");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loc, navigate] = useLocation();

  const setProjectsFromBootstrap = useCallback((items: unknown[]) => {
    setProjects(items as Project[]);
  }, []);

  const setSummaryFromBootstrap = useCallback((next: unknown) => {
    setSummary(next as Summary);
  }, []);

  const setDataRangeFromBootstrap = useCallback((next: unknown) => {
    setDataRange(next as DataRange);
  }, []);

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
    setProjects: setProjectsFromBootstrap,
    setProjectPrices,
    setSummary: setSummaryFromBootstrap,
    setDataRange: setDataRangeFromBootstrap,
    toast,
  });

  const { devices, isFiltered, filtered, sorted, handleSort, route } = useJobsViewState({
    jobs,
    q,
    statusFilter,
    deviceFilter,
    sortCol,
    sortDir,
    setSortCol,
    setSortDir,
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
    setJobs,
    setProjects: (items: Project[]) => setProjects(items),
    setSummary,
    setSelectedJob,
    navigate,
    refreshProjectsAndPrices,
    refreshJobPrices,
  });

  if (loading)
    return html`<${LoadingView} bootStatus=${bootStatus} loadProgress=${loadProgress} />`;
  if (error) return html`<${ErrorView} error=${error} />`;

  return html`
    <${Header} summary=${summary} dataRange=${dataRange} />
    ${renderMainContent({
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
      handleSort,
    })}
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

const rootVNode =
  html`<${RouterProvider} base="/ui"><${App} /></${RouterProvider}>` as ComponentChild;
render(rootVNode, document.getElementById("app")!);
