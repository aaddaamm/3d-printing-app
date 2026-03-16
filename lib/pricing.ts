// ── Pricing functions ─────────────────────────────────────────────────────────
//
// All functions are pure — they take data and config as plain arguments.
// Callers are responsible for loading config from the DB and passing it in.
//
// Spreadsheet source: "3d Printing Business copy.numbers" / Standard Cost sheet

import type { MachineRate, MaterialRate, LaborConfig, PriceBreakdown } from "./types.js";

export interface CalcPriceParams {
  total_weight_g: number;
  total_time_s: number;
  labor_minutes?: number;
  extra_labor_minutes?: number | null;
  price_override?: number | null;
  machineRate: MachineRate;
  materialRate: MaterialRate;
  laborConfig: LaborConfig;
}

/** Filament material cost: weight × rate_per_g (includes waste buffer). */
export function calcMaterialCost(weight_g: number, materialRate: MaterialRate): number {
  return weight_g * materialRate.rate_per_g;
}

/** Machine cost: depreciation + electricity + maintenance, prorated by print time. */
export function calcMachineCost(print_time_s: number, machineRate: MachineRate): number {
  return (print_time_s / 3600) * machineRate.machine_rate_per_hr;
}

/**
 * Labor cost with a minimum time floor so short jobs aren't underpriced.
 * e.g. a 5-minute job still bills at minimum_minutes (default 15 min).
 */
export function calcLaborCost(labor_minutes: number, laborConfig: LaborConfig): number {
  const billable = Math.max(labor_minutes, laborConfig.minimum_minutes);
  return (billable / 60) * laborConfig.hourly_rate;
}

/**
 * Full price breakdown for a job.
 *
 * If price_override is set, final_price uses that value but costs are still
 * calculated so margin is visible. Rounds up to the nearest dollar after markup
 * (mirrors the CEILING formula from the spreadsheet).
 */
export function calcPrice({
  total_weight_g,
  total_time_s,
  labor_minutes = 15,
  extra_labor_minutes = null,
  price_override = null,
  machineRate,
  materialRate,
  laborConfig,
}: CalcPriceParams): PriceBreakdown {
  const material_cost = calcMaterialCost(total_weight_g, materialRate);
  const machine_cost = calcMachineCost(total_time_s, machineRate);
  const labor_cost = calcLaborCost(labor_minutes, laborConfig);
  const extra_labor_cost = extra_labor_minutes
    ? (extra_labor_minutes / 60) * laborConfig.hourly_rate
    : 0;
  const base_price = material_cost + machine_cost + labor_cost + extra_labor_cost;
  const calculated_price = Math.ceil(base_price * (1 + laborConfig.profit_markup_pct));

  const is_override = price_override != null;
  const final_price = is_override ? price_override : calculated_price;

  return {
    material_cost: round2(material_cost),
    machine_cost: round2(machine_cost),
    labor_cost: round2(labor_cost),
    extra_labor_cost: round2(extra_labor_cost),
    base_price: round2(base_price),
    final_price: round2(final_price),
    is_override,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
