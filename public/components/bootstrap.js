import { useEffect, useState, useCallback } from "preact/hooks";
import { fetchJson } from "../lib/api.js";
import { BOOT_FAILSAFE_MS, TOTAL_BOOT_REQUESTS } from "../lib/constants.js";

export function useDashboardBootstrap({
  setJobs,
  setProjects,
  setProjectPrices,
  setSummary,
  toast,
}) {
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [bootStatus, setBootStatus] = useState("Starting dashboard…");

  const refreshProjectsAndPrices = useCallback(() => {
    fetchJson("/projects", "Failed to load projects.")
      .then((d) => d?.projects && setProjects(d.projects))
      .catch((err) => toast(err.message || "Failed to load projects.", "error"))
      .finally(() => setProjectsLoading(false));

    fetchJson("/projects/prices", "Failed to load project prices.")
      .then((d) => d?.prices && setProjectPrices(d.prices))
      .catch((err) => toast(err.message || "Failed to load project prices.", "error"));
  }, [setProjects, setProjectPrices, toast]);

  const refreshJobPrices = useCallback(
    (merge = false) => {
      fetchJson(
        "/jobs/prices",
        merge ? "Failed to refresh job prices." : "Failed to load job prices.",
      )
        .then((d) => {
          if (!d?.prices) return;
          setJobs((js) =>
            js.map((j) => ({
              ...j,
              final_price: d.prices[j.id] ?? (merge ? j.final_price : null) ?? null,
            })),
          );
        })
        .catch((err) =>
          toast(
            err.message || (merge ? "Failed to refresh job prices." : "Failed to load job prices."),
            "error",
          ),
        );
    },
    [setJobs, toast],
  );

  useEffect(() => {
    const advanceProgress = () =>
      setLoadProgress((p) => Math.min(100, p + 100 / TOTAL_BOOT_REQUESTS));
    const trackedFetchJson = (url, fallback) => {
      setBootStatus(`Loading ${url}…`);
      return fetchJson(url, fallback)
        .catch((err) => {
          console.error(`[boot] ${url} failed`, err);
          throw err;
        })
        .finally(advanceProgress);
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
        refreshJobPrices(false);
        refreshProjectsAndPrices();
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        setProjectsLoading(false);
      })
      .finally(() => clearTimeout(failsafe));

    return () => clearTimeout(failsafe);
  }, [setJobs, setSummary, refreshJobPrices, refreshProjectsAndPrices]);

  return {
    loading,
    projectsLoading,
    loadProgress,
    error,
    bootStatus,
    refreshProjectsAndPrices,
    refreshJobPrices,
  };
}
