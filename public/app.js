import { h, render } from "https://esm.sh/preact@10";
import { useState, useEffect, useMemo, useCallback } from "https://esm.sh/preact@10/hooks";
import htm from "https://esm.sh/htm@3";

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

// ── App ──────────────────────────────────────────────────────────────────────

function App() {
  const [jobs, setJobs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectPrices, setProjectPrices] = useState({});
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [view, setView] = useState("table");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("");
  const [sortCol, setSortCol] = useState("startTime");
  const [sortDir, setSortDir] = useState("desc");
  const [selectedJob, setSelectedJob] = useState(null);
  const [loc, navigate] = useLocation();

  useEffect(() => {
    Promise.all([fetch("/ui/data").then((r) => r.json()), fetch("/summary").then((r) => r.json())])
      .then(([data, sum]) => {
        setJobs(data.jobs);
        setSummary(sum);
        setLoading(false);
        // Prices and projects are useful, but should not block the main dashboard.
        fetch("/jobs/prices")
          .then((r) => r.json())
          .then(({ prices }) => {
            setJobs((js) => js.map((j) => ({ ...j, final_price: prices[j.id] ?? null })));
          })
          .catch(() => {});
        fetch("/projects")
          .then((r) => r.json())
          .then(({ projects }) => setProjects(projects))
          .catch(() => toast("Failed to load projects.", "error"))
          .finally(() => setProjectsLoading(false));
        fetch("/projects/prices")
          .then((r) => r.json())
          .then(({ prices }) => {
            setProjectPrices(prices);
          })
          .catch(() => {});
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        setProjectsLoading(false);
      });
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
      fetch("/projects")
        .then((r) => r.json())
        .then((d) => setProjects(d.projects));
      fetch("/projects/prices")
        .then((r) => r.json())
        .then(({ prices }) => setProjectPrices(prices))
        .catch(() => {});
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

  const handleDeleteProject = useCallback(
    (id) => {
      setProjects((ps) => ps.filter((p) => p.id !== id));
      setJobs((js) => js.map((j) => (j.project_id === id ? { ...j, project_id: null } : j)));
      navigate("/projects");
    },
    [navigate],
  );

  const handleAutoGroup = useCallback(async () => {
    const [jobsData, projData] = await Promise.all([
      fetch("/ui/data").then((r) => r.json()),
      fetch("/projects").then((r) => r.json()),
    ]);
    setJobs(jobsData.jobs);
    setProjects(projData.projects);
    fetch("/jobs/prices")
      .then((r) => r.json())
      .then(({ prices }) => {
        setJobs((js) =>
          js.map((j) => ({ ...j, final_price: prices[j.id] ?? j.final_price ?? null })),
        );
      })
      .catch(() => {});
    fetch("/projects/prices")
      .then((r) => r.json())
      .then(({ prices }) => setProjectPrices(prices))
      .catch(() => {});
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
          <div class="dashboard-loader-steps" aria-hidden="true">
            <span>jobs</span>
            <span>projects</span>
            <span>rates</span>
            <span>covers</span>
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
        onDelete=${handleDeleteProject}
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
