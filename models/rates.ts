import { stmts } from "../lib/db.js";
import { invalidateAllPriceCaches } from "../lib/price-cache.js";
import type { MachineRate, MaterialRate, LaborConfig } from "../lib/types.js";

export interface RatesConfig {
  laborConfig: LaborConfig;
  machineRates: Map<string, MachineRate>;
  materialRates: Map<string, MaterialRate>;
  fallbackMachine: MachineRate;
}

/**
 * Loads all rate config from the DB into lookup Maps.
 * Returns null if any required table is empty (pricing not yet configured).
 */
export function loadRatesConfig(): RatesConfig | null {
  const laborConfig = stmts.getLaborConfig.get();
  if (!laborConfig) return null;
  const allMachineRates = stmts.getMachineRates.all();
  if (!allMachineRates.length) return null;
  const allMaterialRates = stmts.getMaterialRates.all();
  if (!allMaterialRates.length) return null;
  return {
    laborConfig,
    machineRates: new Map(allMachineRates.map((r) => [r.device_model, r])),
    materialRates: new Map(allMaterialRates.map((r) => [r.filament_type, r])),
    fallbackMachine: allMachineRates[0]!,
  };
}

export function getRates(): {
  machine_rates: MachineRate[];
  material_rates: MaterialRate[];
  labor_config: LaborConfig | undefined;
} {
  return {
    machine_rates: stmts.getMachineRates.all(),
    material_rates: stmts.getMaterialRates.all(),
    labor_config: stmts.getLaborConfig.get(),
  };
}

export function updateLaborConfig(patch: Omit<LaborConfig, "id">): LaborConfig {
  assertNonNegativeFinite(patch.hourly_rate, "hourly_rate");
  assertNonNegativeFinite(patch.minimum_minutes, "minimum_minutes");
  assertNonNegativeFinite(patch.profit_markup_pct, "profit_markup_pct");
  assertNonNegativeFinite(patch.failure_buffer_pct, "failure_buffer_pct");
  assertNonNegativeFinite(patch.overhead_buffer_pct, "overhead_buffer_pct");
  stmts.updateLaborConfig.run(patch);
  invalidateAllPriceCaches();
  return stmts.getLaborConfig.get()!;
}

/** Recalculates machine_rate_per_hr from component values before upserting. */
export function upsertMachineRate(data: Omit<MachineRate, "machine_rate_per_hr">): MachineRate {
  assertNonNegativeFinite(data.purchase_price, "purchase_price");
  assertPositiveFinite(data.lifetime_hrs, "lifetime_hrs");
  assertNonNegativeFinite(data.electricity_rate, "electricity_rate");
  assertNonNegativeFinite(data.maintenance_buffer, "maintenance_buffer");
  const machine_rate_per_hr =
    data.purchase_price / data.lifetime_hrs + data.electricity_rate + data.maintenance_buffer;
  stmts.upsertMachineRate.run({ ...data, machine_rate_per_hr });
  invalidateAllPriceCaches();
  return stmts.getMachineRate.get(data.device_model)!;
}

export function upsertMaterialRate(data: Omit<MaterialRate, "rate_per_g">): MaterialRate {
  assertNonNegativeFinite(data.cost_per_g, "cost_per_g");
  assertNonNegativeFinite(data.waste_buffer_pct, "waste_buffer_pct");
  // waste_buffer_pct is a fraction (0.10 = 10%), not a percentage
  const rate_per_g = data.cost_per_g * (1 + data.waste_buffer_pct);
  stmts.upsertMaterialRate.run({ ...data, rate_per_g });
  invalidateAllPriceCaches();
  return stmts.getMaterialRate.get(data.filament_type)!;
}

function assertNonNegativeFinite(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be a finite non-negative number`);
  }
}

function assertPositiveFinite(value: number, field: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${field} must be a finite number greater than 0`);
  }
}
