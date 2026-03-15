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
