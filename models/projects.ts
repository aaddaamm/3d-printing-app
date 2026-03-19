import { db, stmts } from "../lib/db.js";
import { localCoverExists } from "../lib/covers.js";
import { calcMaterialCost, calcMachineCost, calcLaborCost, round2 } from "../lib/pricing.js";
import { loadRatesConfig } from "./rates.js";
import type { Project, Job, PriceBreakdown } from "../lib/types.js";

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

// ── Project-level pricing ──────────────────────────────────────────────────
//
// Unlike per-job pricing (which bills a labor minimum per job), project pricing
// aggregates all material + machine costs first, then applies ONE labor charge.
// This prevents a project with 10 small jobs from being billed 10× the labor
// minimum when the user just pressed print once and walked away.

function buildProjectPrice(projectId: number): PriceBreakdown | null {
  const config = loadRatesConfig();
  if (!config) return null;
  const { laborConfig, machineRates, materialRates, fallbackMachine } = config;

  const jobs = stmts.getProjectJobs.all(projectId);
  if (!jobs.length) return null;

  // Dominant filament per session across all jobs in the project
  const sessionIds = jobs.map((j) => j.session_id);
  const placeholders = sessionIds.map(() => "?").join(",");
  const filamentRows = db
    .prepare<string[], { session_id: string; filament_type: string; total_weight: number }>(
      `
    SELECT pt.session_id, jf.filament_type, SUM(jf.weight_g) AS total_weight
    FROM job_filaments jf
    JOIN print_tasks pt ON jf.task_id = pt.id
    WHERE pt.session_id IN (${placeholders}) AND jf.filament_type IS NOT NULL
    GROUP BY pt.session_id, jf.filament_type
    ORDER BY pt.session_id, total_weight DESC
  `,
    )
    .all(...sessionIds);
  const sessionFilament = new Map<string, string>();
  for (const row of filamentRows) {
    if (!sessionFilament.has(row.session_id))
      sessionFilament.set(row.session_id, row.filament_type);
  }

  let material_cost = 0;
  let machine_cost = 0;
  let extra_labor_cost = 0;

  for (const job of jobs) {
    const filamentType = sessionFilament.get(job.session_id) ?? "PLA";
    const materialRate = materialRates.get(filamentType) ?? materialRates.get("PLA");
    const machineRate = machineRates.get(job.deviceModel ?? "") ?? fallbackMachine;
    if (!materialRate) continue;

    material_cost += calcMaterialCost(job.total_weight_g ?? 0, materialRate);
    machine_cost += calcMachineCost(job.total_time_s ?? 0, machineRate);
    if (job.extra_labor_minutes) {
      extra_labor_cost += (job.extra_labor_minutes / 60) * laborConfig.hourly_rate;
    }
  }

  // Single labor charge for the whole project — one setup, not proportional to
  // machine run time (that's already in machine_cost). Passes 0 so the minimum
  // kicks in, same as a single job would bill.
  const labor_cost = calcLaborCost(0, laborConfig);
  const base_price = material_cost + machine_cost + labor_cost + extra_labor_cost;
  const final_price = Math.ceil(base_price * (1 + laborConfig.profit_markup_pct));

  return {
    material_cost: round2(material_cost),
    machine_cost: round2(machine_cost),
    labor_cost: round2(labor_cost),
    extra_labor_cost: round2(extra_labor_cost),
    base_price: round2(base_price),
    final_price: round2(final_price),
    is_override: false,
  };
}

export function getProjectPrice(id: number): PriceBreakdown | null {
  return buildProjectPrice(id);
}

export function getAllProjectPrices(): Record<number, number> {
  const config = loadRatesConfig();
  if (!config) return {};
  const { laborConfig, machineRates, materialRates, fallbackMachine } = config;

  // All assigned jobs in one query — avoids N×getProjectJobs + N×loadRatesConfig
  const allJobs = db.prepare<[], Job>("SELECT * FROM jobs WHERE project_id IS NOT NULL").all();
  if (!allJobs.length) return {};

  const jobsByProject = new Map<number, Job[]>();
  for (const job of allJobs) {
    const pid = job.project_id!;
    if (!jobsByProject.has(pid)) jobsByProject.set(pid, []);
    jobsByProject.get(pid)!.push(job);
  }

  // Dominant filament per session — one query across all sessions
  const sessionIds = [...new Set(allJobs.map((j) => j.session_id))];
  const placeholders = sessionIds.map(() => "?").join(",");
  const filamentRows = db
    .prepare<string[], { session_id: string; filament_type: string; total_weight: number }>(
      `
      SELECT pt.session_id, jf.filament_type, SUM(jf.weight_g) AS total_weight
      FROM job_filaments jf
      JOIN print_tasks pt ON jf.task_id = pt.id
      WHERE pt.session_id IN (${placeholders}) AND jf.filament_type IS NOT NULL
      GROUP BY pt.session_id, jf.filament_type
      ORDER BY pt.session_id, total_weight DESC
    `,
    )
    .all(...sessionIds);
  const sessionFilament = new Map<string, string>();
  for (const row of filamentRows) {
    if (!sessionFilament.has(row.session_id))
      sessionFilament.set(row.session_id, row.filament_type);
  }

  const prices: Record<number, number> = {};
  for (const [projectId, jobs] of jobsByProject) {
    try {
      let material_cost = 0,
        machine_cost = 0,
        extra_labor_cost = 0;
      for (const job of jobs) {
        const filamentType = sessionFilament.get(job.session_id) ?? "PLA";
        const materialRate = materialRates.get(filamentType) ?? materialRates.get("PLA");
        const machineRate = machineRates.get(job.deviceModel ?? "") ?? fallbackMachine;
        if (!materialRate) continue;
        material_cost += calcMaterialCost(job.total_weight_g ?? 0, materialRate);
        machine_cost += calcMachineCost(job.total_time_s ?? 0, machineRate);
        if (job.extra_labor_minutes) {
          extra_labor_cost += (job.extra_labor_minutes / 60) * laborConfig.hourly_rate;
        }
      }
      const labor_cost = calcLaborCost(0, laborConfig);
      const base_price = material_cost + machine_cost + labor_cost + extra_labor_cost;
      prices[projectId] = Math.ceil(base_price * (1 + laborConfig.profit_markup_pct));
    } catch {
      // skip — pricing config incomplete for this project
    }
  }
  return prices;
}

export function autoGroupByDesign(): { projects_created: number; jobs_assigned: number } {
  // 1. MakerWorld designs — group by designId (skip "0"/empty)
  const designGroups = db
    .prepare<[], { designId: string; designTitle: string | null; job_ids: string }>(
      `SELECT designId, designTitle, GROUP_CONCAT(id) AS job_ids
       FROM jobs
       WHERE project_id IS NULL AND designId IS NOT NULL AND designId != '0' AND designId != ''
       GROUP BY designId
       ORDER BY MIN(startTime) DESC`,
    )
    .all();

  // 2. User-imported models — group by title prefix
  const userJobs = db
    .prepare<[], { id: number; title: string | null }>(
      `SELECT j.id, pt.title
       FROM jobs j
       JOIN print_tasks pt ON pt.session_id = j.session_id AND pt.plateIndex = (
         SELECT MIN(pt2.plateIndex) FROM print_tasks pt2 WHERE pt2.session_id = j.session_id
       )
       WHERE j.project_id IS NULL
         AND (j.designId IS NULL OR j.designId = '0' OR j.designId = '')`,
    )
    .all();

  // Build _plate_ base set, then derive titles (same logic as auto-group.ts)
  const plateBases = new Set<string>();
  for (const { title } of userJobs) {
    if (!title) continue;
    const m = title.match(/^(.+)_plate_\d+$/);
    if (m) plateBases.add(m[1]!);
  }
  const titleGroupMap = new Map<string, number[]>();
  for (const { id, title } of userJobs) {
    if (!title) continue;
    const plateMatch = title.match(/^(.+)_plate_\d+$/);
    let base: string;
    if (plateMatch) {
      base = plateMatch[1]!;
    } else {
      const lastUnderscore = title.lastIndexOf("_");
      if (lastUnderscore > 0 && plateBases.has(title.slice(0, lastUnderscore))) {
        base = title.slice(0, lastUnderscore);
      } else {
        base = title;
      }
    }
    if (!titleGroupMap.has(base)) titleGroupMap.set(base, []);
    titleGroupMap.get(base)!.push(id);
  }

  let projects_created = 0;
  let jobs_assigned = 0;

  db.transaction(() => {
    for (const group of designGroups) {
      const now = new Date().toISOString();
      const result = db
        .prepare(`INSERT INTO projects (name, created_at, source_design_id) VALUES (?, ?, ?)`)
        .run(group.designTitle ?? `Design #${group.designId}`, now, group.designId);
      const projectId = result.lastInsertRowid as number;
      const ids = group.job_ids.split(",").map(Number);
      db.prepare(
        `UPDATE jobs SET project_id = ? WHERE id IN (${ids.map(() => "?").join(",")})`,
      ).run(projectId, ...ids);
      projects_created++;
      jobs_assigned += ids.length;
    }

    for (const [baseTitle, ids] of titleGroupMap) {
      const now = new Date().toISOString();
      const sourceKey = `title:${baseTitle}`;
      const result = db
        .prepare(`INSERT INTO projects (name, created_at, source_design_id) VALUES (?, ?, ?)`)
        .run(baseTitle, now, sourceKey);
      const projectId = result.lastInsertRowid as number;
      db.prepare(
        `UPDATE jobs SET project_id = ? WHERE id IN (${ids.map(() => "?").join(",")})`,
      ).run(projectId, ...ids);
      projects_created++;
      jobs_assigned += ids.length;
    }
  })();

  return { projects_created, jobs_assigned };
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
    // Find projects with source_design_id = '0' (the old catch-all bug)
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

  return { junk_projects_deleted, jobs_unassigned, projects_created, jobs_assigned };
}
