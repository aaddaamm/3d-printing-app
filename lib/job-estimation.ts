import type { Job } from "./types.js";

export const ACTIVE_JOB_STATUSES = new Set(["running", "pause", "created"]);
export const ESTIMATE_STATUSES = ["finish", "running", "pause", "created"] as const;

export function isActiveJobStatus(status: string | null | undefined): boolean {
  return ACTIVE_JOB_STATUSES.has((status ?? "").toLowerCase());
}

export function shouldUseEstimatedUsage(
  job: Pick<Job, "total_weight_g" | "total_time_s" | "status" | "status_override">,
): boolean {
  const hasNoCompletedUsage = (job.total_weight_g ?? 0) <= 0 && (job.total_time_s ?? 0) <= 0;
  return hasNoCompletedUsage && isActiveJobStatus(job.status_override ?? job.status);
}
