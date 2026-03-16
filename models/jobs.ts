import { db, stmts } from "../lib/db.js";
import { calcPrice } from "../lib/pricing.js";
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
  if (status)   conds.push(["COALESCE(status_override, status) = ?", status]);
  if (device)   conds.push(["deviceModel = ?", device]);
  if (customer) conds.push(["customer = ?", customer]);
  if (from)     conds.push(["startTime >= ?", from]);
  if (to)       conds.push(["startTime <= ?", to]);
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
    .prepare<[string], PrintTask>(
      "SELECT * FROM print_tasks WHERE session_id = ? ORDER BY plateIndex",
    )
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
    .prepare<[string], { filament_type: string; total_weight: number }>(
      `SELECT jf.filament_type, SUM(jf.weight_g) AS total_weight
       FROM job_filaments jf
       JOIN print_tasks pt ON jf.task_id = pt.id
       WHERE pt.session_id = ? AND jf.filament_type IS NOT NULL
       GROUP BY jf.filament_type ORDER BY total_weight DESC LIMIT 1`,
    )
    .get(job.session_id);

  const filamentType = filamentTotals?.filament_type ?? "PLA";
  const materialRate = stmts.getMaterialRate.get(filamentType) ?? stmts.getMaterialRate.get("PLA");
  const machineRate =
    stmts.getMachineRate.get(job.deviceModel ?? "") ?? stmts.getMachineRates.all()[0];
  const laborConfig = stmts.getLaborConfig.get();

  if (!materialRate) throw new Error(`No material rate for filament type "${filamentType}"`);
  if (!machineRate) throw new Error(`No machine rate for device "${job.deviceModel ?? "unknown"}"`);
  if (!laborConfig) throw new Error("No labor config found — configure rates first");

  const breakdown = calcPrice({
    total_weight_g: job.total_weight_g ?? 0,
    total_time_s: job.total_time_s ?? 0,
    extra_labor_minutes: job.extra_labor_minutes ?? null,
    price_override: job.price_override ?? null,
    machineRate,
    materialRate,
    laborConfig,
  });

  return { id, filament_type: filamentType, ...breakdown };
}

export function getAllJobPrices(): Record<number, number> {
  const laborConfig = stmts.getLaborConfig.get();
  if (!laborConfig) return {};

  const allMachineRates = stmts.getMachineRates.all();
  if (!allMachineRates.length) return {};
  const machineRates = new Map(allMachineRates.map(r => [r.device_model, r]));
  const fallbackMachine = allMachineRates[0]!;

  const allMaterialRates = stmts.getMaterialRates.all();
  if (!allMaterialRates.length) return {};
  const materialRates = new Map(allMaterialRates.map(r => [r.filament_type, r]));

  // Dominant filament type per session — one query ordered by weight desc so first-wins is correct
  const filamentRows = db.prepare<[], { session_id: string; filament_type: string; total_weight: number }>(`
    SELECT pt.session_id, jf.filament_type, SUM(jf.weight_g) AS total_weight
    FROM job_filaments jf
    JOIN print_tasks pt ON jf.task_id = pt.id
    WHERE jf.filament_type IS NOT NULL
    GROUP BY pt.session_id, jf.filament_type
    ORDER BY pt.session_id, total_weight DESC
  `).all();

  const sessionFilament = new Map<string, string>();
  for (const row of filamentRows) {
    if (!sessionFilament.has(row.session_id)) sessionFilament.set(row.session_id, row.filament_type);
  }

  const prices: Record<number, number> = {};
  for (const job of listJobs()) {
    try {
      const filamentType = sessionFilament.get(job.session_id) ?? "PLA";
      const materialRate = materialRates.get(filamentType) ?? materialRates.get("PLA");
      const machineRate = machineRates.get(job.deviceModel ?? "") ?? fallbackMachine;
      if (!materialRate) continue;
      const { final_price } = calcPrice({
        total_weight_g: job.total_weight_g ?? 0,
        total_time_s: job.total_time_s ?? 0,
        extra_labor_minutes: job.extra_labor_minutes ?? null,
        price_override: job.price_override ?? null,
        machineRate,
        materialRate,
        laborConfig,
      });
      prices[job.id] = final_price;
    } catch {
      // skip — pricing config incomplete for this job
    }
  }
  return prices;
}
