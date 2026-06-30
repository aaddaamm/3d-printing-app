import { db, stmts } from "../lib/db.js";
import { calcPrice, type FilamentWeight } from "../lib/pricing.js";
import { loadRatesConfig } from "./rates.js";
import { invalidateJobPriceCache, invalidateProjectPriceCache } from "../lib/price-cache.js";
import { ESTIMATE_STATUSES, shouldUseEstimatedUsage } from "../lib/job-estimation.js";
import { readPriceCache, writePriceCache } from "../lib/price-cache-store.js";
import {
  buildPriceBreakdown,
  calcMaterialCostWithFallback,
  getFallbackMaterialRate,
} from "../lib/pricing-engine.js";
import type { Job, PrintTask, JobFilament, PriceBreakdown } from "../lib/types.js";

type SessionUsage = { session_id: string; total_weight_g: number; total_time_s: number };
type UsageTotals = { total_weight_g: number; total_time_s: number };
type SqlCondition = [string, string];

export interface ListJobsFilter {
  status?: string | undefined;
  device?: string | undefined;
  customer?: string | undefined;
  from?: string | undefined;
  to?: string | undefined;
}

function buildListJobConditions({
  status,
  device,
  customer,
  from,
  to,
}: ListJobsFilter): SqlCondition[] {
  const conds: SqlCondition[] = [];
  if (status) conds.push(["COALESCE(status_override, status) = ?", status]);
  if (device) conds.push(["deviceModel = ?", device]);
  if (customer) conds.push(["customer = ?", customer]);
  if (from) conds.push(["startTime >= ?", from]);
  if (to) conds.push(["startTime <= ?", to]);
  return conds;
}

export function listJobs(filters: ListJobsFilter = {}): Job[] {
  const conds = buildListJobConditions(filters);
  const where = conds.length ? `WHERE ${conds.map(([sql]) => sql).join(" AND ")}` : "";
  return db
    .prepare<string[], Job>(`SELECT * FROM jobs ${where} ORDER BY startTime DESC`)
    .all(...conds.map(([, v]) => v));
}

export function getJobById(id: number): Job | undefined {
  return stmts.getJobById.get(id);
}

export interface JobPatch {
  customer?: string | null | undefined;
  notes?: string | null | undefined;
  price_override?: number | null | undefined;
  status_override?: string | null | undefined;
  project_id?: number | null | undefined;
  extra_labor_minutes?: number | null | undefined;
}

function patchField<T>(next: T | null | undefined, existing: T | null | undefined): T | null {
  if (next !== undefined) return next ?? null;
  return existing ?? null;
}

export function patchJob(id: number, patch: JobPatch): Job | undefined {
  const existing = stmts.getJobById.get(id);
  if (!existing) return undefined;

  stmts.patchJob.run({
    id,
    customer: patchField(patch.customer, existing.customer),
    notes: patchField(patch.notes, existing.notes),
    price_override: patchField(patch.price_override, existing.price_override),
    status_override: patchField(patch.status_override, existing.status_override),
    project_id: patchField(patch.project_id, existing.project_id),
    extra_labor_minutes: patchField(patch.extra_labor_minutes, existing.extra_labor_minutes),
  });

  invalidateJobPriceCache(id);
  invalidateProjectPriceCache();
  return stmts.getJobById.get(id);
}

export function getJobWithDetails(
  id: number,
): { job: Job; plates: PrintTask[]; filaments: JobFilament[] } | null {
  const job = stmts.getJobById.get(id);
  if (!job) return null;
  const plates = db
    .prepare<
      [string],
      PrintTask
    >("SELECT * FROM print_tasks WHERE session_id = ? ORDER BY plateIndex")
    .all(job.session_id);
  const filaments = stmts.getFilamentsBySession.all(job.session_id);
  return { job, plates, filaments };
}

function shouldUseEstimate(job: Job): boolean {
  return shouldUseEstimatedUsage(job);
}

function estimateStatusesForJob(job: Job): readonly string[] {
  return shouldUseEstimate(job) ? ESTIMATE_STATUSES : ["finish"];
}

function directUsage(job: Job): UsageTotals {
  return { total_weight_g: job.total_weight_g ?? 0, total_time_s: job.total_time_s ?? 0 };
}

function loadSessionFilaments(statuses: readonly string[]): Map<string, FilamentWeight[]> {
  const placeholders = statuses.map(() => "?").join(",");
  const filamentRows = db
    .prepare<string[], { session_id: string } & FilamentWeight>(
      `
    SELECT pt.session_id, jf.filament_type, SUM(jf.weight_g) AS total_weight
    FROM job_filaments jf
    JOIN print_tasks pt ON jf.task_id = pt.id
    WHERE jf.filament_type IS NOT NULL AND pt.status IN (${placeholders})
    GROUP BY pt.session_id, jf.filament_type
    ORDER BY pt.session_id, total_weight DESC
  `,
    )
    .all(...statuses);

  const sessionFilaments = new Map<string, FilamentWeight[]>();
  for (const { session_id, ...row } of filamentRows) {
    if (!sessionFilaments.has(session_id)) sessionFilaments.set(session_id, []);
    sessionFilaments.get(session_id)!.push(row);
  }
  return sessionFilaments;
}

function loadSessionUsageByStatuses(statuses: readonly string[]): Map<string, SessionUsage> {
  const placeholders = statuses.map(() => "?").join(",");
  const rows = db
    .prepare<string[], SessionUsage>(
      `
    SELECT session_id,
           SUM(COALESCE(weight, 0)) AS total_weight_g,
           SUM(COALESCE(costTime, 0)) AS total_time_s
    FROM print_tasks
    WHERE status IN (${placeholders})
    GROUP BY session_id
  `,
    )
    .all(...statuses);

  return new Map(rows.map((row) => [row.session_id, row]));
}

function getCachedJobPrices(): Record<number, number> | null {
  return readPriceCache({
    cacheTable: "job_price_cache",
    idColumn: "job_id",
    targetCountSql: "SELECT COUNT(*) AS n FROM jobs",
    hasActiveSql:
      "SELECT 1 AS exists FROM jobs WHERE lower(COALESCE(status_override, status)) IN ('running','pause','created') LIMIT 1",
  });
}

function writeJobPriceCache(prices: Record<number, number>): void {
  writePriceCache({ cacheTable: "job_price_cache", idColumn: "job_id" }, prices);
}

function loadEstimatedUsage(sessionId: string): UsageTotals {
  const estimate = db
    .prepare<[string], { total_weight_g: number; total_time_s: number }>(
      `SELECT SUM(COALESCE(weight, 0)) AS total_weight_g,
              SUM(COALESCE(costTime, 0)) AS total_time_s
       FROM print_tasks
       WHERE session_id = ? AND status IN ('finish', 'running', 'pause', 'created')`,
    )
    .get(sessionId);

  return {
    total_weight_g: estimate?.total_weight_g ?? 0,
    total_time_s: estimate?.total_time_s ?? 0,
  };
}

function loadJobFilamentTotals(sessionId: string, statuses: readonly string[]): FilamentWeight[] {
  const placeholders = statuses.map(() => "?").join(",");
  return db
    .prepare<[string, ...string[]], FilamentWeight>(
      `SELECT jf.filament_type, SUM(jf.weight_g) AS total_weight
       FROM job_filaments jf
       JOIN print_tasks pt ON jf.task_id = pt.id
       WHERE pt.session_id = ? AND jf.filament_type IS NOT NULL AND pt.status IN (${placeholders})
       GROUP BY jf.filament_type ORDER BY total_weight DESC`,
    )
    .all(sessionId, ...statuses);
}

function getUsageForJob(job: Job, activeSessionUsage?: Map<string, SessionUsage>): UsageTotals {
  if (!shouldUseEstimate(job)) return directUsage(job);
  if (!activeSessionUsage) return loadEstimatedUsage(job.session_id);
  return activeSessionUsage.get(job.session_id) ?? directUsage(job);
}

export function getJobPrice(
  id: number,
): ({ id: number; filament_type: string } & PriceBreakdown) | null {
  const job = stmts.getJobById.get(id);
  if (!job) return null;

  const eligibleStatuses = estimateStatusesForJob(job);
  const filamentTotals = loadJobFilamentTotals(job.session_id, eligibleStatuses);
  const usage = getUsageForJob(job);

  const filamentType = filamentTotals[0]?.filament_type ?? "PLA";
  const config = loadRatesConfig();
  if (!config) throw new Error("No labor config found — configure rates first");
  const { laborConfig, machineRates, materialRates, fallbackMachine } = config;

  const fallbackMaterialRate = getFallbackMaterialRate(materialRates);
  const machineRate = machineRates.get(job.deviceModel ?? "") ?? fallbackMachine;

  if (!fallbackMaterialRate) throw new Error('No material rate for fallback filament type "PLA"');

  const breakdown = calcPrice({
    total_weight_g: 0,
    total_time_s: usage.total_time_s,
    extra_labor_minutes: job.extra_labor_minutes ?? null,
    price_override: job.price_override ?? null,
    machineRate,
    materialRate: fallbackMaterialRate,
    laborConfig,
  });
  const pricedBreakdown = buildPriceBreakdown(
    {
      material_cost: calcMaterialCostWithFallback(
        usage.total_weight_g,
        filamentTotals,
        materialRates,
      ),
      machine_cost: breakdown.machine_cost,
      labor_cost: breakdown.labor_cost,
      extra_labor_cost: breakdown.extra_labor_cost,
    },
    laborConfig,
    breakdown.is_override,
    breakdown.final_price,
  );

  return { id, filament_type: filamentType, ...pricedBreakdown };
}

export function getAllJobPrices(): Record<number, number> {
  const cached = getCachedJobPrices();
  if (cached) return cached;

  const config = loadRatesConfig();
  if (!config) return {};
  const { laborConfig, machineRates, materialRates, fallbackMachine } = config;
  const fallbackMaterialRate = getFallbackMaterialRate(materialRates);
  if (!fallbackMaterialRate) return {};

  const finishedSessionFilaments = loadSessionFilaments(["finish"]);
  const activeSessionFilaments = loadSessionFilaments(ESTIMATE_STATUSES);
  const activeSessionUsage = loadSessionUsageByStatuses(ESTIMATE_STATUSES);
  const prices: Record<number, number> = {};

  const getFilamentsForJob = (job: Job): FilamentWeight[] => {
    const sessionFilaments = shouldUseEstimate(job)
      ? activeSessionFilaments
      : finishedSessionFilaments;
    return sessionFilaments.get(job.session_id) ?? [];
  };

  for (const job of listJobs()) {
    try {
      const machineRate = machineRates.get(job.deviceModel ?? "") ?? fallbackMachine;
      const usage = getUsageForJob(job, activeSessionUsage);
      const breakdown = calcPrice({
        total_weight_g: 0,
        total_time_s: usage.total_time_s,
        extra_labor_minutes: job.extra_labor_minutes ?? null,
        price_override: job.price_override ?? null,
        machineRate,
        materialRate: fallbackMaterialRate,
        laborConfig,
      });
      const pricedBreakdown = buildPriceBreakdown(
        {
          material_cost: calcMaterialCostWithFallback(
            usage.total_weight_g,
            getFilamentsForJob(job),
            materialRates,
          ),
          machine_cost: breakdown.machine_cost,
          labor_cost: breakdown.labor_cost,
          extra_labor_cost: breakdown.extra_labor_cost,
        },
        laborConfig,
        breakdown.is_override,
        breakdown.final_price,
      );
      prices[job.id] = pricedBreakdown.final_price;
    } catch {
      // skip — pricing config incomplete for this job
    }
  }

  writeJobPriceCache(prices);
  return prices;
}
