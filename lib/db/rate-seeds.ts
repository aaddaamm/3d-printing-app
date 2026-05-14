import type Database from "better-sqlite3";
import type { MachineRate, MaterialRate } from "../types.js";

function seedMachineRates(database: Database.Database): void {
  if ((database.prepare("SELECT COUNT(*) AS n FROM machine_rates").get() as { n: number }).n > 0) {
    return;
  }

  const insertMachine = database.prepare<MachineRate>(`
    INSERT INTO machine_rates (device_model, purchase_price, lifetime_hrs, electricity_rate, maintenance_buffer, machine_rate_per_hr)
    VALUES (@device_model, @purchase_price, @lifetime_hrs, @electricity_rate, @maintenance_buffer, @machine_rate_per_hr)
  `);

  insertMachine.run({
    device_model: "A1 mini",
    purchase_price: 213.99,
    lifetime_hrs: 3000,
    electricity_rate: 0.1,
    maintenance_buffer: 0.5,
    machine_rate_per_hr: Number((213.99 / 3000 + 0.1 + 0.5).toFixed(6)),
  });

  insertMachine.run({
    device_model: "P1S",
    purchase_price: 588.49,
    lifetime_hrs: 3000,
    electricity_rate: 0.1,
    maintenance_buffer: 0.5,
    machine_rate_per_hr: Number((588.49 / 3000 + 0.1 + 0.5).toFixed(6)),
  });
}

function seedMaterialRates(database: Database.Database): void {
  if ((database.prepare("SELECT COUNT(*) AS n FROM material_rates").get() as { n: number }).n > 0) {
    return;
  }

  const insertMaterial = database.prepare<MaterialRate>(`
    INSERT INTO material_rates (filament_type, cost_per_g, waste_buffer_pct, rate_per_g)
    VALUES (@filament_type, @cost_per_g, @waste_buffer_pct, @rate_per_g)
  `);

  insertMaterial.run({
    filament_type: "PLA",
    cost_per_g: 0.028,
    waste_buffer_pct: 0.1,
    rate_per_g: Number((0.028 * 1.1).toFixed(4)),
  });

  insertMaterial.run({
    filament_type: "PETG",
    cost_per_g: 0.032,
    waste_buffer_pct: 0.15,
    rate_per_g: Number((0.032 * 1.15).toFixed(4)),
  });
}

function seedPlaSRate(database: Database.Database): void {
  database
    .prepare(
      `INSERT OR IGNORE INTO material_rates (filament_type, cost_per_g, waste_buffer_pct, rate_per_g)
       VALUES ('PLA-S', 0.034, 0.10, ?)`,
    )
    .run(Number((0.034 * 1.1).toFixed(4)));
}

export function seedRateTables(database: Database.Database): void {
  seedMachineRates(database);
  seedMaterialRates(database);
  seedPlaSRate(database);
}
