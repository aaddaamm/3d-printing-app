import { db } from "../lib/db.js";
import {
  calcProductionPricing,
  type ProductionPricingBreakdown,
} from "../lib/production-pricing.js";
import type { MaterialRate } from "../lib/types.js";
import { loadRatesConfig } from "./rates.js";

export type PriceQuoteRequest = {
  job_ids: number[];
  sellable_units: number;
  batch_labor_minutes: number;
  per_unit_labor_minutes: number;
  packaging_cost_per_unit: number;
  extra_cost: number;
  channel: "direct" | "etsy";
  target_margin_pct?: number;
};

export type QuoteAttempt = {
  job_id: number;
  title: string;
  status: string;
  printer: string;
  material_cost: number;
  machine_cost: number;
  production_loss_cost: number;
};

export type PriceQuoteRateAssumption = {
  job_id: number;
  task_id: string;
  material_type: string;
  material_rate_per_kg: number;
  printer: string;
  machine_rate_per_hr: number;
  used_material_fallback: boolean;
  used_machine_fallback: boolean;
};

export type PriceQuoteResult = {
  channel: "direct" | "etsy";
  assumptions: {
    labor_hourly_rate: number;
    target_margin_pct: number;
    platform_fee_pct: number;
    fixed_fee_per_order: number;
    failure_buffer_pct: number;
    overhead_buffer_pct: number;
    resolved_rates: PriceQuoteRateAssumption[];
  };
  attempts: QuoteAttempt[];
  warnings: string[];
  breakdown: ProductionPricingBreakdown;
};

export class PriceQuoteValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PriceQuoteValidationError";
  }
}

interface SelectedJobRow {
  id: number;
  session_id: string;
  designTitle: string | null;
  status: string | null;
  deviceModel: string | null;
  printer_model: string | null;
}

interface TaskRow {
  id: string;
  title: string | null;
  status: string | null;
  weight: number | null;
  costTime: number | null;
  deviceModel: string | null;
  printer_model: string | null;
}

interface FilamentRow {
  filament_type: string | null;
  weight_g: number | null;
}

interface PricingProfileRow {
  target_margin_pct: number;
  platform_fee_pct: number;
  fixed_fee_per_order: number;
  minimum_price: number | null;
}

interface ResolvedTaskCost {
  materialCost: number;
  machineCost: number;
  productionLossCost: number;
  printer: string;
  resolvedRates: PriceQuoteRateAssumption[];
}

const getJobStatement = db.prepare<[number], SelectedJobRow>(`
  SELECT
    j.id,
    j.session_id,
    j.designTitle,
    j.status,
    j.deviceModel,
    p.model AS printer_model
  FROM jobs j
  LEFT JOIN printers p ON p.id = j.printer_id
  WHERE j.id = ?
`);

const getTasksStatement = db.prepare<[string], TaskRow>(`
  SELECT
    pt.id,
    pt.title,
    pt.status,
    pt.weight,
    pt.costTime,
    pt.deviceModel,
    p.model AS printer_model
  FROM print_tasks pt
  LEFT JOIN printers p ON p.id = pt.printer_id
  WHERE pt.session_id = ?
  ORDER BY pt.startTime, pt.plateIndex, pt.id
`);

const getFilamentsStatement = db.prepare<[string], FilamentRow>(`
  SELECT filament_type, weight_g
  FROM job_filaments
  WHERE task_id = ?
  ORDER BY id
`);

const getProfileStatement = db.prepare<[string], PricingProfileRow>(`
  SELECT
    target_margin_pct,
    platform_fee_pct,
    fixed_fee_per_order,
    minimum_price
  FROM pricing_profiles
  WHERE id = ?
`);

export function calculatePriceQuote(input: PriceQuoteRequest): PriceQuoteResult {
  const normalized = normalizeRequest(input);
  const jobs = loadSelectedJobs(normalized.jobIds);
  const rates = loadRatesConfig();
  if (!rates) {
    throw new PriceQuoteValidationError("Pricing rates are not fully configured");
  }

  const plaRate = rates.materialRates.get("PLA");
  if (!plaRate) {
    throw new PriceQuoteValidationError('No material rate for fallback filament type "PLA"');
  }

  const profile = getProfileStatement.get(normalized.channel === "direct" ? "booth" : "etsy");
  if (!profile) {
    throw new PriceQuoteValidationError(
      `Missing pricing profile for channel: ${normalized.channel}`,
    );
  }

  const platformFeePct = normalized.channel === "direct" ? 0 : profile.platform_fee_pct;
  const fixedFeePerOrder = normalized.channel === "direct" ? 0 : profile.fixed_fee_per_order;
  const targetMarginPct = normalized.targetMarginPct ?? profile.target_margin_pct;
  if (targetMarginPct + platformFeePct >= 0.95) {
    throw new PriceQuoteValidationError(
      "target_margin_pct plus the channel platform fee must be less than 0.95",
    );
  }

  const warnings: string[] = [];
  const resolvedRates: PriceQuoteRateAssumption[] = [];
  let materialCost = 0;
  let machineCost = 0;
  let productionLossCost = 0;
  const attempts = jobs.map((job) => {
    const tasks = getTasksStatement.all(job.session_id);
    let attemptMaterialCost = 0;
    let attemptMachineCost = 0;
    let attemptProductionLossCost = 0;
    let taskPrinter = "Unknown printer";

    for (const task of tasks) {
      const resolved = resolveTaskCost(
        job,
        task,
        rates.materialRates,
        plaRate,
        rates.machineRates,
        rates.fallbackMachine.device_model,
        rates.fallbackMachine.machine_rate_per_hr,
        warnings,
      );
      attemptMaterialCost += resolved.materialCost;
      attemptMachineCost += resolved.machineCost;
      attemptProductionLossCost += resolved.productionLossCost;
      resolvedRates.push(...resolved.resolvedRates);
      if (taskPrinter === "Unknown printer") taskPrinter = resolved.printer;
    }

    materialCost += attemptMaterialCost;
    machineCost += attemptMachineCost;
    productionLossCost += attemptProductionLossCost;

    return {
      job_id: job.id,
      title: job.designTitle ?? tasks[0]?.title ?? `Job ${job.id}`,
      status: job.status ?? tasks[0]?.status ?? "unknown",
      printer: job.printer_model ?? job.deviceModel ?? taskPrinter,
      material_cost: round2(attemptMaterialCost),
      machine_cost: round2(attemptMachineCost),
      production_loss_cost: round2(attemptProductionLossCost),
    };
  });

  const breakdown = calcProductionPricing({
    sellableUnits: normalized.sellableUnits,
    materialCost,
    machineCost,
    productionLossCost,
    laborHourlyRate: rates.laborConfig.hourly_rate,
    batchLaborMinutes: normalized.batchLaborMinutes,
    perUnitLaborMinutes: normalized.perUnitLaborMinutes,
    packagingCostPerUnit: normalized.packagingCostPerUnit,
    extraCost: normalized.extraCost,
    targetMarginPct,
    platformFeePct,
    fixedFeePerOrder,
    failureBufferPct: rates.laborConfig.failure_buffer_pct,
    overheadBufferPct: rates.laborConfig.overhead_buffer_pct,
    minimumPrice: profile.minimum_price,
  });

  return {
    channel: normalized.channel,
    assumptions: {
      labor_hourly_rate: rates.laborConfig.hourly_rate,
      target_margin_pct: targetMarginPct,
      platform_fee_pct: platformFeePct,
      fixed_fee_per_order: fixedFeePerOrder,
      failure_buffer_pct: rates.laborConfig.failure_buffer_pct,
      overhead_buffer_pct: rates.laborConfig.overhead_buffer_pct,
      resolved_rates: dedupeRateAssumptions(resolvedRates),
    },
    attempts,
    warnings,
    breakdown,
  };
}

function resolveTaskCost(
  job: SelectedJobRow,
  task: TaskRow,
  materialRates: ReadonlyMap<string, MaterialRate>,
  plaRate: MaterialRate,
  machineRates: ReadonlyMap<string, { machine_rate_per_hr: number }>,
  fallbackMachineModel: string,
  fallbackMachineRate: number,
  warnings: string[],
): ResolvedTaskCost {
  const taskLabel = `Job ${job.id} (${job.designTitle ?? `Job ${job.id}`}), task ${task.id} (${task.title ?? "Untitled"})`;
  const machineModels = [
    task.printer_model,
    task.deviceModel,
    job.printer_model,
    job.deviceModel,
  ].filter(
    (model, index, models): model is string => Boolean(model) && models.indexOf(model) === index,
  );
  const configuredMachineModel = machineModels.find((model) => machineRates.has(model));
  const configuredMachineRate = configuredMachineModel
    ? machineRates.get(configuredMachineModel)
    : undefined;
  const machineRate = configuredMachineRate?.machine_rate_per_hr ?? fallbackMachineRate;
  const printer = configuredMachineModel ?? fallbackMachineModel;
  const usedMachineFallback = !configuredMachineRate;
  if (!configuredMachineRate) {
    warnings.push(
      `${taskLabel}: no machine rate for ${machineModels.length > 0 ? machineModels.map((model) => `"${model}"`).join(" or ") : "the assigned printer"}; used fallback ${fallbackMachineModel}.`,
    );
  }

  const filamentRows = getFilamentsStatement.all(task.id);
  const measuredFilaments = filamentRows.filter(
    (filament): filament is FilamentRow & { weight_g: number } =>
      typeof filament.weight_g === "number" &&
      Number.isFinite(filament.weight_g) &&
      filament.weight_g > 0,
  );

  let materialCost = 0;
  const resolvedRates: PriceQuoteRateAssumption[] = [];
  if (measuredFilaments.length > 0) {
    for (const filament of measuredFilaments) {
      const configuredRate = filament.filament_type
        ? materialRates.get(filament.filament_type)
        : undefined;
      const resolvedRate = configuredRate ?? plaRate;
      if (!configuredRate) {
        warnings.push(
          `${taskLabel}: no material rate for ${filament.filament_type ? `"${filament.filament_type}"` : "the recorded filament"}; used PLA rate.`,
        );
      }
      materialCost += filament.weight_g * resolvedRate.rate_per_g;
      resolvedRates.push(
        toRateAssumption(
          job.id,
          task.id,
          resolvedRate.filament_type,
          resolvedRate.rate_per_g,
          printer,
          machineRate,
          !configuredRate,
          usedMachineFallback,
        ),
      );
    }
  } else {
    const taskWeight = nonnegative(task.weight);
    materialCost = taskWeight * plaRate.rate_per_g;
    warnings.push(
      taskWeight > 0
        ? `${taskLabel}: no usable filament data; used task weight with PLA rate.`
        : `${taskLabel}: no usable filament data or positive task weight; used zero material cost.`,
    );
    resolvedRates.push(
      toRateAssumption(
        job.id,
        task.id,
        plaRate.filament_type,
        plaRate.rate_per_g,
        printer,
        machineRate,
        true,
        usedMachineFallback,
      ),
    );
  }

  const durationSeconds =
    typeof task.costTime === "number" && Number.isFinite(task.costTime) && task.costTime >= 0
      ? task.costTime
      : null;
  if (durationSeconds === null) {
    warnings.push(`${taskLabel}: missing or invalid print duration; used zero machine time.`);
  }
  const machineCost = ((durationSeconds ?? 0) / 3600) * machineRate;
  const productionLossCost = task.status === "finish" ? 0 : materialCost + machineCost;
  return { materialCost, machineCost, productionLossCost, printer, resolvedRates };
}

function toRateAssumption(
  jobId: number,
  taskId: string,
  materialType: string,
  materialRatePerG: number,
  printer: string,
  machineRatePerHr: number,
  usedMaterialFallback: boolean,
  usedMachineFallback: boolean,
): PriceQuoteRateAssumption {
  return {
    job_id: jobId,
    task_id: taskId,
    material_type: materialType,
    material_rate_per_kg: materialRatePerG * 1000,
    printer,
    machine_rate_per_hr: machineRatePerHr,
    used_material_fallback: usedMaterialFallback,
    used_machine_fallback: usedMachineFallback,
  };
}

function dedupeRateAssumptions(
  assumptions: PriceQuoteRateAssumption[],
): PriceQuoteRateAssumption[] {
  const unique = new Set<string>();
  return assumptions.filter((assumption) => {
    const key = JSON.stringify(assumption);
    if (unique.has(key)) return false;
    unique.add(key);
    return true;
  });
}

function loadSelectedJobs(jobIds: number[]): SelectedJobRow[] {
  const jobs = jobIds.map((jobId) => getJobStatement.get(jobId));
  const unknownIds = jobIds.filter((_jobId, index) => !jobs[index]);
  if (unknownIds.length > 0) {
    throw new PriceQuoteValidationError(`Unknown job_ids: ${unknownIds.join(", ")}`);
  }
  return jobs as SelectedJobRow[];
}

function normalizeRequest(input: PriceQuoteRequest): {
  jobIds: number[];
  sellableUnits: number;
  batchLaborMinutes: number;
  perUnitLaborMinutes: number;
  packagingCostPerUnit: number;
  extraCost: number;
  channel: "direct" | "etsy";
  targetMarginPct: number | undefined;
} {
  if (!Array.isArray(input.job_ids) || input.job_ids.length === 0) {
    throw new PriceQuoteValidationError("job_ids must contain at least one job");
  }
  const jobIds: number[] = [];
  const seen = new Set<number>();
  for (const jobId of input.job_ids) {
    if (!Number.isInteger(jobId) || jobId <= 0) {
      throw new PriceQuoteValidationError("job_ids must contain only positive integers");
    }
    if (!seen.has(jobId)) {
      seen.add(jobId);
      jobIds.push(jobId);
    }
  }

  if (!Number.isInteger(input.sellable_units) || input.sellable_units <= 0) {
    throw new PriceQuoteValidationError("sellable_units must be a positive integer");
  }
  const batchLaborMinutes = normalizeNonnegative(input.batch_labor_minutes, "batch_labor_minutes");
  const perUnitLaborMinutes = normalizeNonnegative(
    input.per_unit_labor_minutes,
    "per_unit_labor_minutes",
  );
  const packagingCostPerUnit = normalizeNonnegative(
    input.packaging_cost_per_unit,
    "packaging_cost_per_unit",
  );
  const extraCost = normalizeNonnegative(input.extra_cost, "extra_cost");
  if (input.channel !== "direct" && input.channel !== "etsy") {
    throw new PriceQuoteValidationError('channel must be either "direct" or "etsy"');
  }
  const targetMarginPct =
    input.target_margin_pct === undefined
      ? undefined
      : normalizeNonnegative(input.target_margin_pct, "target_margin_pct");
  if (targetMarginPct !== undefined && targetMarginPct >= 0.95) {
    throw new PriceQuoteValidationError("target_margin_pct must be less than 0.95");
  }

  return {
    jobIds,
    sellableUnits: input.sellable_units,
    batchLaborMinutes,
    perUnitLaborMinutes,
    packagingCostPerUnit,
    extraCost,
    channel: input.channel,
    targetMarginPct,
  };
}

function normalizeNonnegative(value: number, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new PriceQuoteValidationError(`${field} must be a finite non-negative number`);
  }
  return value;
}

function nonnegative(value: number | null): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
