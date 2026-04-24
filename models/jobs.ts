import { db, stmts } from "../lib/db.js";
import {
  calcPrice,
  calcWeightedMaterialCost,
  round2,
  type FilamentWeight,
} from "../lib/pricing.js";
import { loadRatesConfig } from "./rates.js";
import type { Job, PrintTask, JobFilament, PriceBreakdown } from "../lib/types.js";

export interface ListJobsFilter {
  status?: string | undefined;
  device?: string | undefined;
  customer?: string | undefined;
  from?: string | undefined;
  to?: string | undefined;
}

export function listJobs({ status, device, customer, from, to }: ListJobsFilter = {}): Job[] {
  // Each entry is [sql-fragment, bound-value] — kept together so they can't drift apart.
  const conds: Array<[string, string]> = [];
  if (status) conds.push(["COALESCE(status_override, status) = ?", status]);
  if (device) conds.push(["deviceModel = ?", device]);
  if (customer) conds.push(["customer = ?", customer]);
  if (from) conds.push(["startTime >= ?", from]);
  if (to) conds.push(["startTime <= ?", to]);
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

export function patchJob(id: number, patch: JobPatch): Job | undefined {
  const existing = stmts.getJobById.get(id);
  if (!existing) return undefined;
  stmts.patchJob.run({
    id,
    customer: "customer" in patch ? (patch.customer ?? null) : existing.customer,
    notes: "notes" in patch ? (patch.notes ?? null) : existing.notes,
    price_override:
      "price_override" in patch ? (patch.price_override ?? null) : existing.price_override,
    status_override:
      "status_override" in patch ? (patch.status_override ?? null) : existing.status_override,
    project_id: "project_id" in patch ? (patch.project_id ?? null) : existing.project_id,
    extra_labor_minutes:
      "extra_labor_minutes" in patch
        ? (patch.extra_labor_minutes ?? null)
        : existing.extra_labor_minutes,
  });
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

export function getJobPrice(
  id: number,
): ({ id: number; filament_type: string } & PriceBreakdown) | null {
  const job = stmts.getJobById.get(id);
  if (!job) return null;

  const filamentTotals = db
    .prepare<[string], FilamentWeight>(
      `SELECT jf.filament_type, SUM(jf.weight_g) AS total_weight
       FROM job_filaments jf
       JOIN print_tasks pt ON jf.task_id = pt.id
       WHERE pt.session_id = ? AND jf.filament_type IS NOT NULL AND pt.status = 'finish'
       GROUP BY jf.filament_type ORDER BY total_weight DESC`,
    )
    .all(job.session_id);

  const filamentType = filamentTotals[0]?.filament_type ?? "PLA";
  const config = loadRatesConfig();
  if (!config) throw new Error("No labor config found — configure rates first");
  const { laborConfig, machineRates, materialRates, fallbackMachine } = config;

  const fallbackMaterialRate = materialRates.get("PLA");
  const machineRate = machineRates.get(job.deviceModel ?? "") ?? fallbackMachine;

  if (!fallbackMaterialRate) throw new Error('No material rate for fallback filament type "PLA"');

  const breakdown = calcPrice({
    total_weight_g: 0,
    total_time_s: job.total_time_s ?? 0,
    extra_labor_minutes: job.extra_labor_minutes ?? null,
    price_override: job.price_override ?? null,
    machineRate,
    materialRate: fallbackMaterialRate,
    laborConfig,
  });
  breakdown.material_cost = round2(
    calcWeightedMaterialCost(
      job.total_weight_g ?? 0,
      filamentTotals,
      materialRates,
      fallbackMaterialRate,
    ),
  );
  breakdown.base_price = round2(
    breakdown.material_cost +
      breakdown.machine_cost +
      breakdown.labor_cost +
      breakdown.extra_labor_cost,
  );
  if (!breakdown.is_override) {
    breakdown.final_price = round2(
      Math.ceil(breakdown.base_price * (1 + laborConfig.profit_markup_pct)),
    );
  }

  return { id, filament_type: filamentType, ...breakdown };
}

export function getAllJobPrices(): Record<number, number> {
  const config = loadRatesConfig();
  if (!config) return {};
  const { laborConfig, machineRates, materialRates, fallbackMachine } = config;

  const filamentRows = db
    .prepare<[], { session_id: string } & FilamentWeight>(
      `
    SELECT pt.session_id, jf.filament_type, SUM(jf.weight_g) AS total_weight
    FROM job_filaments jf
    JOIN print_tasks pt ON jf.task_id = pt.id
    WHERE jf.filament_type IS NOT NULL AND pt.status = 'finish'
    GROUP BY pt.session_id, jf.filament_type
    ORDER BY pt.session_id, total_weight DESC
  `,
    )
    .all();

  const sessionFilaments = new Map<string, FilamentWeight[]>();
  for (const { session_id, ...row } of filamentRows) {
    if (!sessionFilaments.has(session_id)) sessionFilaments.set(session_id, []);
    sessionFilaments.get(session_id)!.push(row);
  }

  const prices: Record<number, number> = {};
  for (const job of listJobs()) {
    try {
      const fallbackMaterialRate = materialRates.get("PLA");
      const machineRate = machineRates.get(job.deviceModel ?? "") ?? fallbackMachine;
      if (!fallbackMaterialRate) continue;
      const breakdown = calcPrice({
        total_weight_g: 0,
        total_time_s: job.total_time_s ?? 0,
        extra_labor_minutes: job.extra_labor_minutes ?? null,
        price_override: job.price_override ?? null,
        machineRate,
        materialRate: fallbackMaterialRate,
        laborConfig,
      });
      const materialCost = calcWeightedMaterialCost(
        job.total_weight_g ?? 0,
        sessionFilaments.get(job.session_id) ?? [],
        materialRates,
        fallbackMaterialRate,
      );
      const basePrice =
        materialCost + breakdown.machine_cost + breakdown.labor_cost + breakdown.extra_labor_cost;
      prices[job.id] = breakdown.is_override
        ? breakdown.final_price
        : Math.ceil(basePrice * (1 + laborConfig.profit_markup_pct));
    } catch {
      // skip — pricing config incomplete for this job
    }
  }
  return prices;
}
