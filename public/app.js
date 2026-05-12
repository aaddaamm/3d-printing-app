import { h, render } from "preact";
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "preact/hooks";
import htm from "htm";

import { RouterProvider, useLocation } from "./components/router.js";
import { Header, Toolbar, TotalsBar, TableView, GridView } from "./components/jobs-view.js";
import { Modal } from "./components/modal.js";
import { ProjectsView, ProjectDetail } from "./components/projects-view.js";
import { AdminView } from "./components/admin-view.js";
import { toast, ToastContainer } from "./components/toast.js";

const html = htm.bind(h);

async function errorMessage(res, fallback) {
  try {
    const data = await res.json();
    return data.error || fallback;
  } catch {
    return fallback;
  }
}

const FETCH_TIMEOUT_MS = 15000;

async function fetchJson(url, fallback) {
  let res;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  } catch (err) {
    if (err?.name === "TimeoutError") throw new Error(`${fallback} (request timed out)`);
    throw new Error(`${fallback} (network error)`);
  }
  if (!res.ok) throw new Error(await errorMessage(res, fallback));
  return res.json();
}

// ── App ──────────────────────────────────────────────────────────────────────

function App() {
  const [jobs, setJobs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectPrices, setProjectPrices] = useState({});
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [bootStatus, setBootStatus] = useState("Starting dashboard…");

  const [view, setView] = useState("table");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("");
  const [sortCol, setSortCol] = useState("startTime");
  const [sortDir, setSortDir] = useState("desc");
  const [selectedJob, setSelectedJob] = useState(null);
  const [loc, navigate] = useLocation();

  useEffect(() => {
    const TOTAL_BOOT_REQUESTS = 5;
    const BOOT_FAILSAFE_MS = 20000;
    const advanceProgress = () => {
      setLoadProgress((p) => Math.min(100, p + 100 / TOTAL_BOOT_REQUESTS));
    };
    const trackedFetchJson = (url, fallback) => {
      setBootStatus(`Loading ${url}…`);
      return fetchJson(url, fallback)
        .catch((err) => {
          console.error(`[boot] ${url} failed`, err);
          throw err;
        })
        .finally(() => {
          advanceProgress();
        });
    };

    const failsafe = setTimeout(() => {
      setError("Dashboard load timed out. Check console/network for the failing request.");
      setLoading(false);
      setProjectsLoading(false);
    }, BOOT_FAILSAFE_MS);

    Promise.all([
      trackedFetchJson("/ui/data", "Failed to load jobs."),
      trackedFetchJson("/summary", "Failed to load summary."),
    ])
      .then(([data, sum]) => {
        setJobs(data.jobs);
        setSummary(sum);
        setLoading(false);
        setBootStatus("Loading optional data…");
        // Prices and projects are useful, but should not block the main dashboard.
        trackedFetchJson("/jobs/prices", "Failed to load job prices.")
          .then(({ prices }) => {
            setJobs((js) => js.map((j) => ({ ...j, final_price: prices[j.id] ?? null })));
          })
          .catch((err) => toast(err.message || "Failed to load job prices.", "error"));
        trackedFetchJson("/projects", "Failed to load projects.")
          .then(({ projects }) => setProjects(projects))
          .catch((err) => toast(err.message || "Failed to load projects.", "error"))
          .finally(() => setProjectsLoading(false));
        trackedFetchJson("/projects/prices", "Failed to load project prices.")
          .then(({ prices }) => {
            setProjectPrices(prices);
          })
          .catch((err) => toast(err.message || "Failed to load project prices.", "error"));
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        setProjectsLoading(false);
      })
      .finally(() => {
        clearTimeout(failsafe);
      });

    return () => clearTimeout(failsafe);
  }, []);

  const devices = useMemo(
    () => [...new Set(jobs.map((j) => j.deviceModel).filter(Boolean))].sort(),
    [jobs],
  );

  const isFiltered = !!(q || statusFilter || deviceFilter);

  const filtered = useMemo(
    () =>
      jobs.filter((j) => {
        const text = ((j.designTitle || "") + " " + (j.customer || "")).toLowerCase();
        if (q && !text.includes(q.toLowerCase())) return false;
        if (statusFilter && (j.status || "").toLowerCase() !== statusFilter) return false;
        if (deviceFilter && j.deviceModel !== deviceFilter) return false;
        return true;
      }),
    [jobs, q, statusFilter, deviceFilter],
  );

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        let av = a[sortCol],
          bv = b[sortCol];
        if (av == null) av = sortDir === "asc" ? Infinity : -Infinity;
        if (bv == null) bv = sortDir === "asc" ? Infinity : -Infinity;
        if (typeof av === "string")
          return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
        return sortDir === "asc" ? av - bv : bv - av;
      }),
    [filtered, sortCol, sortDir],
  );

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
    try {
      const res = await fetch(`/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) {
        toast(await errorMessage(res, "Failed to update job."), "error");
        return null;
      }
      const { job } = await res.json();
      setJobs((js) => js.map((j) => (j.id === jobId ? { ...j, ...job } : j)));
      setSelectedJob((j) => (j && j.id === jobId ? { ...j, ...job } : j));
      return job;
    } catch {
      toast("Network error while updating job.", "error");
      return null;
    }
  }, []);

  const handleJobProjectChange = useCallback(
    async (jobId, projectId) => {
      const job = await patchJob(jobId, { project_id: projectId });
      if (!job) return;
      // Refresh project stats and prices (job counts / totals changed)
      fetchJson("/projects", "Failed to load projects.")
        .then((d) => setProjects(d.projects))
        .catch((err) => toast(err.message || "Failed to load projects.", "error"));
      fetchJson("/projects/prices", "Failed to load project prices.")
        .then(({ prices }) => setProjectPrices(prices))
        .catch((err) => toast(err.message || "Failed to load project prices.", "error"));
    },
    [patchJob],
  );

  const handleJobStatusChange = useCallback(
    (jobId, statusOverride) => {
      patchJob(jobId, { status_override: statusOverride });
    },
    [patchJob],
  );

  const handleJobExtraLaborChange = useCallback(
    (jobId, minutes) => {
      patchJob(jobId, { extra_labor_minutes: minutes });
    },
    [patchJob],
  );

  const handleNavigateToProject = useCallback(
    (projectId) => {
      setSelectedJob(null);
      navigate(`/projects/${projectId}`);
    },
    [navigate],
  );

  const handleAutoGroup = useCallback(async () => {
    const [jobsData, projData] = await Promise.all([
      fetchJson("/ui/data", "Failed to refresh jobs."),
      fetchJson("/projects", "Failed to refresh projects."),
    ]);
    setJobs(jobsData.jobs);
    setProjects(projData.projects);
    fetchJson("/jobs/prices", "Failed to refresh job prices.")
      .then(({ prices }) => {
        setJobs((js) =>
          js.map((j) => ({ ...j, final_price: prices[j.id] ?? j.final_price ?? null })),
        );
      })
      .catch((err) => toast(err.message || "Failed to refresh job prices.", "error"));
    fetchJson("/projects/prices", "Failed to refresh project prices.")
      .then(({ prices }) => setProjectPrices(prices))
      .catch((err) => toast(err.message || "Failed to refresh project prices.", "error"));
  }, []);

  if (loading)
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
  if (error)
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

  const projectDetailMatch = loc.match(/^\/projects\/(\d+)$/);
  const isProjects = loc.startsWith("/projects");

  const renderMain = () => {
    if (loc.startsWith("/admin")) return html`<${AdminView} />`;
    if (projectDetailMatch) {
      const id = Number(projectDetailMatch[1]);
      const project = projects.find((p) => p.id === id);
      const projectJobs = jobs.filter((j) => j.project_id === id);
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
        onAddJob=${(jobId) => handleJobProjectChange(jobId, id)}
        onRemoveJob=${(jobId) => handleJobProjectChange(jobId, null)}
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
              onSort=${handleSort}
              onJobClick=${setSelectedJob}
            />`
          : html`<${GridView} sorted=${sorted} onJobClick=${setSelectedJob} />`}
    `;
  };

  return html`
    <${Header} summary=${summary} />
    ${renderMain()}
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
