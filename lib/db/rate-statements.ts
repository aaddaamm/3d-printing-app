import type Database from "better-sqlite3";
import type { LaborConfig, MachineRate, MaterialRate } from "../types.js";

export function createRateStatements(db: Database.Database) {
  return {
    getMachineRates: db.prepare<[], MachineRate>(
      "SELECT * FROM machine_rates ORDER BY device_model",
    ),
    getMachineRate: db.prepare<[string], MachineRate>(
      "SELECT * FROM machine_rates WHERE device_model = ?",
    ),
    getMaterialRates: db.prepare<[], MaterialRate>(
      "SELECT * FROM material_rates ORDER BY filament_type",
    ),
    getMaterialRate: db.prepare<[string], MaterialRate>(
      "SELECT * FROM material_rates WHERE filament_type = ?",
    ),
    getLaborConfig: db.prepare<[], LaborConfig>("SELECT * FROM labor_config WHERE id = 1"),

    upsertMachineRate: db.prepare<MachineRate>(`
      INSERT INTO machine_rates (device_model, purchase_price, lifetime_hrs, electricity_rate, maintenance_buffer, machine_rate_per_hr)
      VALUES (@device_model, @purchase_price, @lifetime_hrs, @electricity_rate, @maintenance_buffer, @machine_rate_per_hr)
      ON CONFLICT(device_model) DO UPDATE SET
        purchase_price=excluded.purchase_price, lifetime_hrs=excluded.lifetime_hrs,
        electricity_rate=excluded.electricity_rate, maintenance_buffer=excluded.maintenance_buffer,
        machine_rate_per_hr=excluded.machine_rate_per_hr
    `),

    upsertMaterialRate: db.prepare<MaterialRate>(`
      INSERT INTO material_rates (filament_type, cost_per_g, waste_buffer_pct, rate_per_g)
      VALUES (@filament_type, @cost_per_g, @waste_buffer_pct, @rate_per_g)
      ON CONFLICT(filament_type) DO UPDATE SET
        cost_per_g=excluded.cost_per_g, waste_buffer_pct=excluded.waste_buffer_pct,
        rate_per_g=excluded.rate_per_g
    `),

    updateLaborConfig: db.prepare<Omit<LaborConfig, "id">>(`
      UPDATE labor_config
      SET hourly_rate=@hourly_rate,
        minimum_minutes=@minimum_minutes,
        profit_markup_pct=@profit_markup_pct,
        failure_buffer_pct=@failure_buffer_pct,
        overhead_buffer_pct=@overhead_buffer_pct
      WHERE id=1
    `),
  };
}
