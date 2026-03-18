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
  const sessionIds = jobs.map(j => j.session_id);
  const placeholders = sessionIds.map(() => "?").join(",");
  const filamentRows = db.prepare<string[], { session_id: string; filament_type: string; total_weight: number }>(`
    SELECT pt.session_id, jf.filament_type, SUM(jf.weight_g) AS total_weight
    FROM job_filaments jf
    JOIN print_tasks pt ON jf.task_id = pt.id
    WHERE pt.session_id IN (${placeholders}) AND jf.filament_type IS NOT NULL
    GROUP BY pt.session_id, jf.filament_type
    ORDER BY pt.session_id, total_weight DESC
  `).all(...sessionIds);
  const sessionFilament = new Map<string, string>();
  for (const row of filamentRows) {
    if (!sessionFilament.has(row.session_id)) sessionFilament.set(row.session_id, row.filament_type);
  }

  let material_cost = 0;
  let machine_cost = 0;
  let extra_labor_cost = 0;
  let total_time_s = 0;

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
    total_time_s += job.total_time_s ?? 0;
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
  const prices: Record<number, number> = {};
  const projects = db.prepare<[], { id: number }>("SELECT id FROM projects").all();
  for (const { id } of projects) {
    try {
      const breakdown = buildProjectPrice(id);
      if (breakdown) prices[id] = breakdown.final_price;
    } catch {
      // skip — pricing config incomplete
    }
  }
  return prices;
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
