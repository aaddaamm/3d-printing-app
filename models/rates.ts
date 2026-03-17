import { stmts } from "../lib/db.js";
import type { MachineRate, MaterialRate, LaborConfig } from "../lib/types.js";

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
  stmts.updateLaborConfig.run(patch);
  return stmts.getLaborConfig.get()!;
}

/** Recalculates machine_rate_per_hr from component values before upserting. */
export function upsertMachineRate(
  data: Omit<MachineRate, "machine_rate_per_hr">,
): MachineRate {
  const machine_rate_per_hr =
    data.purchase_price / data.lifetime_hrs +
    data.electricity_rate +
    data.maintenance_buffer;
  stmts.upsertMachineRate.run({ ...data, machine_rate_per_hr });
  return stmts.getMachineRate.get(data.device_model)!;
}

export function upsertMaterialRate(
  data: Omit<MaterialRate, "rate_per_g">,
): MaterialRate {
  const rate_per_g = data.cost_per_g * (1 + data.waste_buffer_pct / 100);
  stmts.upsertMaterialRate.run({ ...data, rate_per_g });
  return stmts.getMaterialRate.get(data.filament_type)!;
}
