import { db, stmts } from "../lib/db.js";
import { localCoverExists } from "../lib/covers.js";
import type { Project, Job } from "../lib/types.js";

export type ProjectWithStats = Project & {
  job_count: number;
  total_weight_g: number | null;
  total_time_s: number | null;
  cover_url: string | null;
};

export function listProjects(): ProjectWithStats[] {
  return stmts.listProjects.all().map(({ latest_cover_task_id, ...row }) => ({
    ...row,
    cover_url:
      latest_cover_task_id && localCoverExists(String(latest_cover_task_id))
        ? `/ui/covers/${latest_cover_task_id}`
        : null,
  }));
}

export function getProjectById(id: number): Project | undefined {
  return stmts.getProjectById.get(id);
}

export interface ProjectCreate {
  name: string;
  customer?: string | null;
  notes?: string | null;
}

export function createProject(data: ProjectCreate): Project {
  const now = new Date().toISOString();
  const result = stmts.createProject.run({
    name: data.name,
    customer: data.customer ?? null,
    notes: data.notes ?? null,
    created_at: now,
    source_design_id: null,
  });
  return stmts.getProjectById.get(result.lastInsertRowid as number)!;
}

export interface ProjectPatch {
  name?: string;
  customer?: string | null;
  notes?: string | null;
}

export function patchProject(id: number, patch: ProjectPatch): Project | undefined {
  const existing = stmts.getProjectById.get(id);
  if (!existing) return undefined;
  stmts.patchProject.run({
    id,
    name: patch.name ?? existing.name,
    customer: "customer" in patch ? (patch.customer ?? null) : existing.customer,
    notes: "notes" in patch ? (patch.notes ?? null) : existing.notes,
  });
  return stmts.getProjectById.get(id);
}

export function deleteProject(id: number): boolean {
  const existing = stmts.getProjectById.get(id);
  if (!existing) return false;
  stmts.unassignProjectJobs.run(id);
  stmts.deleteProject.run(id);
  return true;
}

export function getProjectJobs(id: number): Job[] {
  return stmts.getProjectJobs.all(id);
}

export function autoGroupByDesign(): { projects_created: number; jobs_assigned: number } {
  const groups = db
    .prepare<[], { instanceId: number; designTitle: string | null; job_ids: string }>(
      `SELECT instanceId, designTitle, GROUP_CONCAT(id) AS job_ids
       FROM jobs
       WHERE project_id IS NULL AND instanceId IS NOT NULL
       GROUP BY instanceId
       ORDER BY MIN(startTime) DESC`,
    )
    .all();

  let projects_created = 0;
  let jobs_assigned = 0;

  db.transaction(() => {
    for (const group of groups) {
      const now = new Date().toISOString();
      const result = db
        .prepare(`INSERT INTO projects (name, created_at, source_design_id) VALUES (?, ?, ?)`)
        .run(group.designTitle ?? `Design #${group.instanceId}`, now, String(group.instanceId));
      const projectId = result.lastInsertRowid as number;
      const ids = group.job_ids.split(",").map(Number);
      db.prepare(
        `UPDATE jobs SET project_id = ? WHERE id IN (${ids.map(() => "?").join(",")})`,
      ).run(projectId, ...ids);
      projects_created++;
      jobs_assigned += ids.length;
    }
  })();

  return { projects_created, jobs_assigned };
}
