import { toast } from "./toast.js";

export type Project = {
  id: number;
  name?: string;
  customer?: string | null;
  notes?: string | null;
  job_count?: number;
  total_plates?: number | null;
  total_weight_g?: number | null;
  total_time_s?: number | null;
  cover_url?: string | null;
};

export type Job = {
  id: number;
  designTitle?: string;
  customer?: string | null;
  cover_url?: string | null;
  startTime?: string;
  deviceModel?: string;
  status?: string;
  total_weight_g?: number | null;
  total_time_s?: number | null;
  plate_count?: number | null;
  final_price?: number | null;
};

export function filterProjects(projects: Project[], q: string): Project[] {
  if (!q) return projects;
  const lc = q.toLowerCase();
  return projects.filter((p) =>
    [p.name, p.customer, p.notes].filter(Boolean).join(" ").toLowerCase().includes(lc),
  );
}

export function filterJobs(unassignedJobs: Job[], q: string): Job[] {
  if (!q) return unassignedJobs;
  const lc = q.toLowerCase();
  return unassignedJobs.filter((j) =>
    `${j.designTitle || ""} ${j.customer || ""}`.toLowerCase().includes(lc),
  );
}

export function projectCountLabel(projects: Project[], filtered: Project[], q: string): string {
  const prefix = q ? `${filtered.length} of ${projects.length}` : String(projects.length);
  return `${prefix} project${projects.length !== 1 ? "s" : ""}`;
}

export function showAutoGroupToast(projectsCreated: number, jobsAssigned: number): void {
  if (projectsCreated === 0) {
    toast("No ungrouped jobs found — everything is already assigned to a project.", "info");
    return;
  }

  toast(
    `Created ${projectsCreated} project${projectsCreated !== 1 ? "s" : ""}, assigned ${jobsAssigned} job${jobsAssigned !== 1 ? "s" : ""}.`,
    "success",
  );
}

export function sumJobWeight(jobs: Job[]): number {
  return jobs.reduce((sum, job) => sum + (job.total_weight_g || 0), 0);
}

export function sumJobTime(jobs: Job[]): number {
  return jobs.reduce((sum, job) => sum + (job.total_time_s || 0), 0);
}

export function sumJobPlates(jobs: Job[]): number {
  return jobs.reduce((sum, job) => sum + (job.plate_count || 0), 0);
}
