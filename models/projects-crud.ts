import { db, stmts } from "../lib/db.js";
import { localCoverExists } from "../lib/covers.js";
import { autoGroupProjects } from "../lib/auto-group.js";
import { invalidateProjectPriceCache } from "../lib/price-cache.js";
import { providerRemoteMediaUrl } from "../lib/media-urls.js";
import type { Project, Job } from "../lib/types.js";

export type ProjectWithStats = Project & {
  job_count: number;
  total_plates: number | null;
  total_weight_g: number | null;
  total_time_s: number | null;
  product_id: number | null;
  cover_url: string | null;
};

type ProjectCoverFields = {
  latest_cover_task_id: number | string | null | undefined;
  latest_cover_provider: string | null | undefined;
  latest_cover_provider_printer_id: string | null | undefined;
  latest_cover_title: string | null | undefined;
  latest_cover: string | null | undefined;
  latest_cover_thumbnail: string | null | undefined;
};

function resolveProjectCoverUrl(fields: ProjectCoverFields): string | null {
  const latestCoverTaskId = fields.latest_cover_task_id
    ? String(fields.latest_cover_task_id)
    : null;
  const mediaUrl = fields.latest_cover_thumbnail ?? fields.latest_cover;
  const canServeLocalCover =
    latestCoverTaskId &&
    /^\d+$/.test(latestCoverTaskId) &&
    (localCoverExists(latestCoverTaskId) ||
      (fields.latest_cover_provider === "bambu" && Boolean(mediaUrl)));
  if (canServeLocalCover) return `/ui/covers/${latestCoverTaskId}`;

  return providerRemoteMediaUrl({
    provider: fields.latest_cover_provider ?? "",
    providerPrinterId: fields.latest_cover_provider_printer_id,
    filename: fields.latest_cover_title,
    thumbnail: fields.latest_cover_thumbnail,
    cover: fields.latest_cover,
  });
}

export function listProjects(): ProjectWithStats[] {
  return stmts.listProjects.all().map((project) => {
    const {
      latest_cover_task_id,
      latest_cover_provider,
      latest_cover_provider_printer_id,
      latest_cover_title,
      latest_cover,
      latest_cover_thumbnail,
      ...row
    } = project;
    return {
      ...row,
      cover_url: resolveProjectCoverUrl({
        latest_cover_task_id,
        latest_cover_provider,
        latest_cover_provider_printer_id,
        latest_cover_title,
        latest_cover,
        latest_cover_thumbnail,
      }),
    };
  });
}

export const getProjectById = (id: number): Project | undefined => stmts.getProjectById.get(id);

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
  invalidateProjectPriceCache();
  return stmts.getProjectById.get(result.lastInsertRowid as number)!;
}

export interface ProjectPatch {
  name?: string;
  customer?: string | null;
  notes?: string | null;
}

function patchField<T>(next: T | null | undefined, existing: T | null | undefined): T | null {
  if (next !== undefined) return next ?? null;
  return existing ?? null;
}

export function patchProject(id: number, patch: ProjectPatch): Project | undefined {
  const existing = stmts.getProjectById.get(id);
  if (!existing) return undefined;

  stmts.patchProject.run({
    id,
    name: patch.name ?? existing.name,
    customer: patchField(patch.customer, existing.customer),
    notes: patchField(patch.notes, existing.notes),
  });

  invalidateProjectPriceCache();
  return stmts.getProjectById.get(id);
}

export function deleteProject(id: number): boolean {
  const existing = stmts.getProjectById.get(id);
  if (!existing) return false;
  stmts.unassignProjectJobs.run(id);
  stmts.deleteProject.run(id);
  invalidateProjectPriceCache();
  return true;
}

export function getProjectJobs(id: number): Job[] {
  return stmts.getProjectJobs.all(id);
}

export function autoGroupByDesign(): { projects_created: number; jobs_assigned: number } {
  const { created, assigned } = autoGroupProjects();
  if (created > 0 || assigned > 0) invalidateProjectPriceCache();
  return { projects_created: created, jobs_assigned: assigned };
}

/**
 * Disband junk catch-all projects created by an old auto-group bug that grouped
 * all designId='0' jobs into a single project. Unassigns their jobs, deletes
 * the junk projects, then re-runs autoGroupByDesign to properly re-assign them.
 */
export function cleanupJunkProjects(): {
  junk_projects_deleted: number;
  jobs_unassigned: number;
  projects_created: number;
  jobs_assigned: number;
} {
  let junk_projects_deleted = 0;
  let jobs_unassigned = 0;

  db.transaction(() => {
    const junkProjects = db
      .prepare<[], { id: number }>(`SELECT id FROM projects WHERE source_design_id = '0'`)
      .all();

    for (const { id } of junkProjects) {
      const { changes } = db
        .prepare(`UPDATE jobs SET project_id = NULL WHERE project_id = ?`)
        .run(id);
      jobs_unassigned += changes;
      db.prepare(`DELETE FROM projects WHERE id = ?`).run(id);
      junk_projects_deleted++;
    }
  })();

  const { projects_created, jobs_assigned } = autoGroupByDesign();
  if (junk_projects_deleted > 0 || jobs_unassigned > 0) invalidateProjectPriceCache();

  return { junk_projects_deleted, jobs_unassigned, projects_created, jobs_assigned };
}
