import { Hono } from "hono";
import { getRates, updateLaborConfig, upsertMachineRate, upsertMaterialRate } from "../models/rates.js";

export const rates = new Hono();

rates.get("/", (c) => {
  return c.json(getRates());
});

rates.patch("/labor", async (c) => {
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: "Invalid JSON" }, 400); }

  const { hourly_rate, minimum_minutes, profit_markup_pct } = body;
  if (typeof hourly_rate !== "number" || typeof minimum_minutes !== "number" || typeof profit_markup_pct !== "number") {
    return c.json({ error: "hourly_rate, minimum_minutes, profit_markup_pct must be numbers" }, 400);
  }
  if (hourly_rate < 0 || minimum_minutes < 0 || profit_markup_pct < 0) {
    return c.json({ error: "Values must be non-negative" }, 400);
  }
  const labor_config = updateLaborConfig({ hourly_rate, minimum_minutes, profit_markup_pct });
  return c.json({ labor_config });
});

rates.patch("/machines/:device_model", async (c) => {
  const device_model = c.req.param("device_model");
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: "Invalid JSON" }, 400); }

  const { purchase_price, lifetime_hrs, electricity_rate, maintenance_buffer } = body;
  if ([purchase_price, lifetime_hrs, electricity_rate, maintenance_buffer].some(v => typeof v !== "number" || v < 0)) {
    return c.json({ error: "purchase_price, lifetime_hrs, electricity_rate, maintenance_buffer must be non-negative numbers" }, 400);
  }
  const machine_rate = upsertMachineRate({
    device_model,
    purchase_price: purchase_price as number,
    lifetime_hrs: lifetime_hrs as number,
    electricity_rate: electricity_rate as number,
    maintenance_buffer: maintenance_buffer as number,
  });
  return c.json({ machine_rate });
});

rates.patch("/materials/:filament_type", async (c) => {
  const filament_type = c.req.param("filament_type");
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: "Invalid JSON" }, 400); }

  const { cost_per_g, waste_buffer_pct } = body;
  if (typeof cost_per_g !== "number" || typeof waste_buffer_pct !== "number" || cost_per_g < 0 || waste_buffer_pct < 0) {
    return c.json({ error: "cost_per_g and waste_buffer_pct must be non-negative numbers" }, 400);
  }
  const material_rate = upsertMaterialRate({ filament_type, cost_per_g, waste_buffer_pct });
  return c.json({ material_rate });
});
