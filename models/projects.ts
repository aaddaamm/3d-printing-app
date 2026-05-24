import { db, stmts } from "../lib/db.js"; // db used in buildProjectPrice/getAllProjectPrices
import { localCoverExists } from "../lib/covers.js";
import { autoGroupProjects } from "../lib/auto-group.js";
import { calcWeightedMaterialCost, calcMachineCost, calcLaborCost, type FilamentWeight } from "../lib/pricing.js";
import { loadRatesConfig } from "./rates.js";
import { invalidateProjectPriceCache } from "../lib/price-cache.js";
import { ESTIMATE_STATUSES, shouldUseEstimatedUsage } from "../lib/job-estimation.js";
import { readPriceCache, writePriceCache } from "../lib/price-cache-store.js";
import { buildPriceBreakdown } from "../lib/pricing-engine.js";
import type { Project, Job, PriceBreakdown, MaterialRate, MachineRate, LaborConfig } from "../lib/types.js";
type SessionUsage = { session_id: string; total_weight_g: number; total_time_s: number };

export type ProjectWithStats = Project & {
  job_count: number;
  total_weight_g: number | null;
  total_time_s: number | null;
  cover_url: string | null;
};

function resolveProjectCoverUrl(
  latestCoverTaskId: number | string | null | undefined,
): string | null {
  if (!latestCoverTaskId) return null;
  if (!localCoverExists(String(latestCoverTaskId))) return null;
  return `/ui/covers/${latestCoverTaskId}`;
}

export function listProjects(): ProjectWithStats[] {
  return stmts.listProjects.all().map(({ latest_cover_task_id, ...row }) => ({
    ...row,
    cover_url: resolveProjectCoverUrl(latest_cover_task_id),
  }));
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

// ── Project-level pricing ──────────────────────────────────────────────────
//
// Unlike per-job pricing (which bills a labor minimum per job), project pricing
// aggregates all material + machine costs first, then applies ONE labor charge.
// This prevents a project with 10 small jobs from being billed 10× the labor
// minimum when the user just pressed print once and walked away.

function loadSessionFilaments(
  sessionIds: string[],
  statuses: readonly string[],
): Map<string, FilamentWeight[]> {
  if (sessionIds.length === 0) return new Map();
  const placeholders = sessionIds.map(() => "?").join(",");
  const statusPlaceholders = statuses.map(() => "?").join(",");
  const filamentRows = db
    .prepare<string[], { session_id: string } & FilamentWeight>(
      `
    SELECT pt.session_id, jf.filament_type, SUM(jf.weight_g) AS total_weight
    FROM job_filaments jf
    JOIN print_tasks pt ON jf.task_id = pt.id
    WHERE pt.session_id IN (${placeholders})
      AND jf.filament_type IS NOT NULL
      AND pt.status IN (${statusPlaceholders})
    GROUP BY pt.session_id, jf.filament_type
    ORDER BY pt.session_id, total_weight DESC
  `,
    )
    .all(...sessionIds, ...statuses);

  const sessionFilaments = new Map<string, FilamentWeight[]>();
  for (const { session_id, ...row } of filamentRows) {
    if (!sessionFilaments.has(session_id)) sessionFilaments.set(session_id, []);
    sessionFilaments.get(session_id)!.push(row);
  }
  return sessionFilaments;
}

function shouldUseEstimate(job: Job): boolean {
  return shouldUseEstimatedUsage(job);
}

function loadSessionUsage(
  sessionIds: string[],
  statuses: readonly string[],
): Map<string, SessionUsage> {
  if (!sessionIds.length) return new Map();
  const placeholders = sessionIds.map(() => "?").join(",");
  const statusPlaceholders = statuses.map(() => "?").join(",");
  const rows = db
    .prepare<string[], SessionUsage>(
      `
    SELECT session_id,
           SUM(COALESCE(weight, 0)) AS total_weight_g,
           SUM(COALESCE(costTime, 0)) AS total_time_s
    FROM print_tasks
    WHERE session_id IN (${placeholders}) AND status IN (${statusPlaceholders})
    GROUP BY session_id
  `,
    )
    .all(...sessionIds, ...statuses);
  return new Map(rows.map((row) => [row.session_id, row]));
}

function usageForProjectJob(
  job: Job,
  activeSessionUsage: ReadonlyMap<string, SessionUsage>,
): { total_weight_g: number; total_time_s: number } {
  if (!shouldUseEstimate(job)) {
    return { total_weight_g: job.total_weight_g ?? 0, total_time_s: job.total_time_s ?? 0 };
  }
  const estimated = activeSessionUsage.get(job.session_id);
  if (!estimated) return { total_weight_g: 0, total_time_s: 0 };
  return { total_weight_g: estimated.total_weight_g, total_time_s: estimated.total_time_s };
}

function filamentsForProjectJob(
  job: Job,
  finishedSessionFilaments: ReadonlyMap<string, FilamentWeight[]>,
  activeSessionFilaments: ReadonlyMap<string, FilamentWeight[]>,
): FilamentWeight[] {
  const bySession = shouldUseEstimate(job) ? activeSessionFilaments : finishedSessionFilaments;
  return bySession.get(job.session_id) ?? [];
}

function calculateProjectVariableCosts(
  jobs: Job[],
  finishedSessionFilaments: ReadonlyMap<string, FilamentWeight[]>,
  activeSessionFilaments: ReadonlyMap<string, FilamentWeight[]>,
  activeSessionUsage: ReadonlyMap<string, SessionUsage>,
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
    const usage = usageForProjectJob(job, activeSessionUsage);

    material_cost += calcWeightedMaterialCost(
      usage.total_weight_g,
      filamentsForProjectJob(job, finishedSessionFilaments, activeSessionFilaments),
      materialRates,
      fallbackMaterialRate,
    );
    machine_cost += calcMachineCost(usage.total_time_s, machineRate);
    if (job.extra_labor_minutes) extra_labor_cost += (job.extra_labor_minutes / 60) * hourlyRate;
  }

  return { material_cost, machine_cost, extra_labor_cost };
}

interface ProjectUsageInputs {
  finishedSessionFilaments: ReadonlyMap<string, FilamentWeight[]>;
  activeSessionFilaments: ReadonlyMap<string, FilamentWeight[]>;
  activeSessionUsage: ReadonlyMap<string, SessionUsage>;
}

function buildProjectPriceFromJobs(
  jobs: Job[],
  usageInputs: ProjectUsageInputs,
  materialRates: ReadonlyMap<string, MaterialRate>,
  machineRates: ReadonlyMap<string, MachineRate>,
  fallbackMachine: MachineRate,
  laborConfig: LaborConfig,
): PriceBreakdown {
  const { material_cost, machine_cost, extra_labor_cost } = calculateProjectVariableCosts(
    jobs,
    usageInputs.finishedSessionFilaments,
    usageInputs.activeSessionFilaments,
    usageInputs.activeSessionUsage,
    materialRates,
    machineRates,
    fallbackMachine,
    laborConfig.hourly_rate,
  );

  const labor_cost = calcLaborCost(0, laborConfig);
  return buildPriceBreakdown(
    { material_cost, machine_cost, labor_cost, extra_labor_cost },
    laborConfig,
  );
}

function groupJobsByProject(allJobs: Job[]): Map<number, Job[]> {
  const grouped = new Map<number, Job[]>();
  for (const job of allJobs) {
    const projectId = job.project_id;
    if (projectId == null) continue;
    const list = grouped.get(projectId);
    if (list) {
      list.push(job);
      continue;
    }
    grouped.set(projectId, [job]);
  }
  return grouped;
}

function readCachedProjectPrices(): Record<number, number> | null {
  return readPriceCache({
    cacheTable: "project_price_cache",
    idColumn: "project_id",
    targetCountSql: "SELECT COUNT(DISTINCT project_id) AS n FROM jobs WHERE project_id IS NOT NULL",
    hasActiveSql:
      "SELECT 1 AS exists FROM jobs WHERE project_id IS NOT NULL AND lower(COALESCE(status_override, status)) IN ('running','pause','created') LIMIT 1",
  });
}

function writeProjectPriceCache(prices: Record<number, number>): void {
  writePriceCache({ cacheTable: "project_price_cache", idColumn: "project_id" }, prices);
}

function buildProjectPrice(projectId: number): PriceBreakdown | null {
  const config = loadRatesConfig();
  if (!config) return null;
  const { laborConfig, machineRates, materialRates, fallbackMachine } = config;

  const jobs = stmts.getProjectJobs.all(projectId);
  if (!jobs.length) return null;

  const sessionIds = jobs.map((j) => j.session_id);
  const usageInputs: ProjectUsageInputs = {
    finishedSessionFilaments: loadSessionFilaments(sessionIds, ["finish"]),
    activeSessionFilaments: loadSessionFilaments(sessionIds, ESTIMATE_STATUSES),
    activeSessionUsage: loadSessionUsage(sessionIds, ESTIMATE_STATUSES),
  };

  const breakdown = buildProjectPriceFromJobs(
    jobs,
    usageInputs,
    materialRates,
    machineRates,
    fallbackMachine,
    laborConfig,
  );

  return breakdown;
}

export function getProjectPrice(id: number): PriceBreakdown | null {
  return buildProjectPrice(id);
}

export function getAllProjectPrices(): Record<number, number> {
  const cached = readCachedProjectPrices();
  if (cached) return cached;

  const config = loadRatesConfig();
  if (!config) return {};
  const { laborConfig, machineRates, materialRates, fallbackMachine } = config;

  // All assigned jobs in one query — avoids N×getProjectJobs + N×loadRatesConfig
  const allJobs = db.prepare<[], Job>("SELECT * FROM jobs WHERE project_id IS NOT NULL").all();
  if (!allJobs.length) return {};

  const jobsByProject = groupJobsByProject(allJobs);

  const allSessionIds = [...new Set(allJobs.map((j) => j.session_id))];
  const usageInputs: ProjectUsageInputs = {
    finishedSessionFilaments: loadSessionFilaments(allSessionIds, ["finish"]),
    activeSessionFilaments: loadSessionFilaments(allSessionIds, ESTIMATE_STATUSES),
    activeSessionUsage: loadSessionUsage(allSessionIds, ESTIMATE_STATUSES),
  };

  const prices: Record<number, number> = {};
  for (const [projectId, jobs] of jobsByProject) {
    try {
      const breakdown = buildProjectPriceFromJobs(
        jobs,
        usageInputs,
        materialRates,
        machineRates,
        fallbackMachine,
        laborConfig,
      );
      prices[projectId] = breakdown.final_price;
    } catch {
      // skip — pricing config incomplete for this project
    }
  }
  writeProjectPriceCache(prices);
  return prices;
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
  if (junk_projects_deleted > 0 || jobs_unassigned > 0) invalidateProjectPriceCache();

  return { junk_projects_deleted, jobs_unassigned, projects_created, jobs_assigned };
}
