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
    price_override: job.price_override ?? null,
    machineRate,
    materialRate,
    laborConfig,
  });

  return { id, filament_type: filamentType, ...breakdown };
}
