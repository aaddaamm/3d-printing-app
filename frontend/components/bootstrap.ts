import { useEffect, useState, useCallback } from "preact/hooks";
import { fetchJson, fetchJsonResult } from "../lib/api.js";
import { BOOT_FAILSAFE_MS, TOTAL_BOOT_REQUESTS } from "../lib/constants.js";

type JobRow = { id: number; final_price?: number | null; [key: string]: unknown };
type PricesResponse = { prices?: Record<number, number> };
type UiDataResponse = { jobs: JobRow[] };
type SummaryResponse = Record<string, unknown>;
type DataRangeResponse = Record<string, unknown>;

type BootstrapArgs = {
  setJobs: (updater: JobRow[] | ((jobs: JobRow[]) => JobRow[])) => void;
  setProjects: (projects: unknown[]) => void;
  setProjectPrices: (prices: Record<number, number>) => void;
  setSummary: (summary: unknown) => void;
  setDataRange: (range: unknown) => void;
  toast: (message: string, kind: "error" | "success") => void;
};

export function useDashboardBootstrap({
  setJobs,
  setProjects,
  setProjectPrices,
  setSummary,
  setDataRange,
  toast,
}: BootstrapArgs) {
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [bootStatus, setBootStatus] = useState("Starting dashboard…");

  const loadOptional = useCallback(
    async <T>({
      url,
      fallback,
      onData,
      onFinally,
    }: {
      url: string;
      fallback: string;
      onData: (data: T) => void;
      onFinally?: () => void;
    }) => {
      const { data, error } = await fetchJsonResult<T>(url, fallback);
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
      onData: (d: { projects?: unknown[] }) => d.projects && setProjects(d.projects),
      onFinally: () => setProjectsLoading(false),
    });

    loadOptional({
      url: "/projects/prices",
      fallback: "Failed to load project prices.",
      onData: (d: PricesResponse) => d.prices && setProjectPrices(d.prices),
    });
  }, [loadOptional, setProjects, setProjectPrices]);

  const refreshJobPrices = useCallback(
    (merge = false) => {
      const fallback = merge ? "Failed to refresh job prices." : "Failed to load job prices.";
      loadOptional({
        url: "/jobs/prices",
        fallback,
        onData: (d: PricesResponse) => {
          if (!d?.prices) return;
          setJobs((js) =>
            js.map((j) => ({
              ...j,
              final_price: d.prices?.[j.id] ?? (merge ? j.final_price : null) ?? null,
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
    const trackedFetchJson = <T>(url: string, fallback: string, label: string) => {
      setBootStatus(`Loading ${url}…`);
      return fetchJson<T>(url, fallback)
        .catch((err: unknown) => {
          const detail = err instanceof Error ? err.message : fallback;
          throw new Error(`Initial dashboard load failed (${label}): ${detail}`);
        })
        .finally(advanceProgress);
    };

    const failsafe = setTimeout(() => {
      setError("Dashboard load timed out. Check console/network for the failing request.");
      setLoading(false);
      setProjectsLoading(false);
    }, BOOT_FAILSAFE_MS);

    Promise.all([
      trackedFetchJson<UiDataResponse>("/ui/data", "Failed to load jobs.", "jobs"),
      trackedFetchJson<SummaryResponse>("/summary", "Failed to load summary.", "summary"),
      trackedFetchJson<DataRangeResponse>(
        "/health/data-range",
        "Failed to load print history range.",
        "history range",
      ),
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
      .catch((err: Error) => {
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
