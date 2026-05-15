import { useEffect, useState, useCallback } from "preact/hooks";
import { fetchJson, fetchJsonResult } from "../lib/api.js";
import { BOOT_FAILSAFE_MS, TOTAL_BOOT_REQUESTS } from "../lib/constants.js";

export function useDashboardBootstrap({
  setJobs,
  setProjects,
  setProjectPrices,
  setSummary,
  setDataRange,
  toast,
}) {
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [bootStatus, setBootStatus] = useState("Starting dashboard…");

  const loadOptional = useCallback(
    async ({ url, fallback, onData, onFinally }) => {
      const { data, error } = await fetchJsonResult(url, fallback);
      if (error) toast(error.message || fallback, "error");
      if (data) onData(data);
      if (onFinally) onFinally();
    },
    [toast],
  );

  const refreshProjectsAndPrices = useCallback(() => {
    loadOptional({
      url: "/projects",
      fallback: "Failed to load projects.",
      onData: (d) => d?.projects && setProjects(d.projects),
      onFinally: () => setProjectsLoading(false),
    });

    loadOptional({
      url: "/projects/prices",
      fallback: "Failed to load project prices.",
      onData: (d) => d?.prices && setProjectPrices(d.prices),
    });
  }, [loadOptional, setProjects, setProjectPrices]);

  const refreshJobPrices = useCallback(
    (merge = false) => {
      const fallback = merge ? "Failed to refresh job prices." : "Failed to load job prices.";
      loadOptional({
        url: "/jobs/prices",
        fallback,
        onData: (d) => {
          if (!d?.prices) return;
          setJobs((js) =>
            js.map((j) => ({
              ...j,
              final_price: d.prices[j.id] ?? (merge ? j.final_price : null) ?? null,
            })),
          );
        },
      });
    },
    [loadOptional, setJobs],
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
      trackedFetchJson("/health/data-range", "Failed to load print history range."),
    ])
      .then(([data, sum, range]) => {
        setJobs(data.jobs);
        setSummary(sum);
        setDataRange(range);
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
  }, [setJobs, setSummary, setDataRange, refreshJobPrices, refreshProjectsAndPrices]);

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
