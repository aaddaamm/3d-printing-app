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

type SortDir = "asc" | "desc";

export function filterDashboardJobs(
  jobs: Job[],
  q: string,
  statusFilter: string,
  deviceFilter: string,
): Job[] {
  return jobs.filter((job) => {
    const text = `${job.designTitle || ""} ${job.customer || ""}`.toLowerCase();
    if (q && !text.includes(q.toLowerCase())) return false;
    if (statusFilter && (job.status || "").toLowerCase() !== statusFilter) return false;
    if (deviceFilter && job.deviceModel !== deviceFilter) return false;
    return true;
  });
}

export function sortDashboardJobs(filtered: Job[], sortCol: string, sortDir: SortDir): Job[] {
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
