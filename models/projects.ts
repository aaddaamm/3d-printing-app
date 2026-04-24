import { db, stmts } from "../lib/db.js"; // db used in buildProjectPrice/getAllProjectPrices
import { localCoverExists } from "../lib/covers.js";
import { autoGroupProjects } from "../lib/auto-group.js";
import {
  calcWeightedMaterialCost,
  calcMachineCost,
  calcLaborCost,
  round2,
  type FilamentWeight,
} from "../lib/pricing.js";
import { loadRatesConfig } from "./rates.js";
import type { Project, Job, PriceBreakdown, MaterialRate, MachineRate } from "../lib/types.js";

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

function loadSessionFilaments(sessionIds: string[]): Map<string, FilamentWeight[]> {
  if (sessionIds.length === 0) return new Map();
  const placeholders = sessionIds.map(() => "?").join(",");
  const filamentRows = db
    .prepare<string[], { session_id: string } & FilamentWeight>(
      `
    SELECT pt.session_id, jf.filament_type, SUM(jf.weight_g) AS total_weight
    FROM job_filaments jf
    JOIN print_tasks pt ON jf.task_id = pt.id
    WHERE pt.session_id IN (${placeholders}) AND jf.filament_type IS NOT NULL AND pt.status = 'finish'
    GROUP BY pt.session_id, jf.filament_type
    ORDER BY pt.session_id, total_weight DESC
  `,
    )
    .all(...sessionIds);

  const sessionFilaments = new Map<string, FilamentWeight[]>();
  for (const { session_id, ...row } of filamentRows) {
    if (!sessionFilaments.has(session_id)) sessionFilaments.set(session_id, []);
    sessionFilaments.get(session_id)!.push(row);
  }
  return sessionFilaments;
}

function calculateProjectVariableCosts(
  jobs: Job[],
  sessionFilaments: ReadonlyMap<string, FilamentWeight[]>,
  materialRates: ReadonlyMap<string, MaterialRate>,
  machineRates: ReadonlyMap<string, MachineRate>,
  fallbackMachine: MachineRate,
  hourlyRate: number,
): { material_cost: number; machine_cost: number; extra_labor_cost: number } {
  let material_cost = 0;
  let machine_cost = 0;
  let extra_labor_cost = 0;
  const fallbackMaterialRate = materialRates.get("PLA");
  if (!fallbackMaterialRate) return { material_cost, machine_cost, extra_labor_cost };

  for (const job of jobs) {
    const machineRate = machineRates.get(job.deviceModel ?? "") ?? fallbackMachine;
    material_cost += calcWeightedMaterialCost(
      job.total_weight_g ?? 0,
      sessionFilaments.get(job.session_id) ?? [],
      materialRates,
      fallbackMaterialRate,
    );
    machine_cost += calcMachineCost(job.total_time_s ?? 0, machineRate);
    if (job.extra_labor_minutes) {
      extra_labor_cost += (job.extra_labor_minutes / 60) * hourlyRate;
    }
  }

  return { material_cost, machine_cost, extra_labor_cost };
}

function buildProjectPrice(projectId: number): PriceBreakdown | null {
  const config = loadRatesConfig();
  if (!config) return null;
  const { laborConfig, machineRates, materialRates, fallbackMachine } = config;

  const jobs = stmts.getProjectJobs.all(projectId);
  if (!jobs.length) return null;

  const sessionFilaments = loadSessionFilaments(jobs.map((j) => j.session_id));

  const { material_cost, machine_cost, extra_labor_cost } = calculateProjectVariableCosts(
    jobs,
    sessionFilaments,
    materialRates,
    machineRates,
    fallbackMachine,
    laborConfig.hourly_rate,
  );

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

  const sessionFilaments = loadSessionFilaments([...new Set(allJobs.map((j) => j.session_id))]);

  const prices: Record<number, number> = {};
  for (const [projectId, jobs] of jobsByProject) {
    try {
      const { material_cost, machine_cost, extra_labor_cost } = calculateProjectVariableCosts(
        jobs,
        sessionFilaments,
        materialRates,
        machineRates,
        fallbackMachine,
        laborConfig.hourly_rate,
      );
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
  const { created, assigned } = autoGroupProjects();
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
