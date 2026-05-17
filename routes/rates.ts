import { Hono } from "hono";
import {
  getRates,
  updateLaborConfig,
  upsertMachineRate,
  upsertMaterialRate,
} from "../models/rates.js";
import { parseJsonBody, jsonError } from "../lib/util.js";

export const rates = new Hono();

rates.get("/", (c) => {
  return c.json(getRates());
});

rates.patch("/labor", async (c) => {
  const body = await parseJsonBody(c);
  if (!body) return jsonError(c, "Invalid JSON", 400);

  const {
    hourly_rate,
    minimum_minutes,
    profit_markup_pct,
    failure_buffer_pct,
    overhead_buffer_pct,
  } = body;
  if (
    !Number.isFinite(hourly_rate) ||
    !Number.isFinite(minimum_minutes) ||
    !Number.isFinite(profit_markup_pct) ||
    !Number.isFinite(failure_buffer_pct) ||
    !Number.isFinite(overhead_buffer_pct)
  ) {
    return jsonError(
      c,
      "hourly_rate, minimum_minutes, profit_markup_pct, failure_buffer_pct, overhead_buffer_pct must be finite numbers",
      400,
    );
  }
  if (
    (hourly_rate as number) < 0 ||
    (minimum_minutes as number) < 0 ||
    (profit_markup_pct as number) < 0 ||
    (failure_buffer_pct as number) < 0 ||
    (overhead_buffer_pct as number) < 0
  ) {
    return jsonError(c, "Values must be non-negative", 400);
  }
  const labor_config = updateLaborConfig({
    hourly_rate: hourly_rate as number,
    minimum_minutes: minimum_minutes as number,
    profit_markup_pct: profit_markup_pct as number,
    failure_buffer_pct: failure_buffer_pct as number,
    overhead_buffer_pct: overhead_buffer_pct as number,
  });
  return c.json({ labor_config });
});

rates.patch("/machines/:device_model", async (c) => {
  const device_model = c.req.param("device_model");
  const body = await parseJsonBody(c);
  if (!body) return jsonError(c, "Invalid JSON", 400);

  const { purchase_price, lifetime_hrs, electricity_rate, maintenance_buffer } = body;
  if (
    [purchase_price, lifetime_hrs, electricity_rate, maintenance_buffer].some(
      (v) => !Number.isFinite(v),
    )
  ) {
    return jsonError(
      c,
      "purchase_price, lifetime_hrs, electricity_rate, maintenance_buffer must be finite numbers",
      400,
    );
  }
  if (
    (purchase_price as number) < 0 ||
    (lifetime_hrs as number) <= 0 ||
    (electricity_rate as number) < 0 ||
    (maintenance_buffer as number) < 0
  ) {
    return jsonError(
      c,
      "purchase_price, electricity_rate, and maintenance_buffer must be non-negative; lifetime_hrs must be greater than 0",
      400,
    );
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
  const body = await parseJsonBody(c);
  if (!body) return jsonError(c, "Invalid JSON", 400);

  const { cost_per_g, waste_buffer_pct } = body;
  if (!Number.isFinite(cost_per_g) || !Number.isFinite(waste_buffer_pct)) {
    return jsonError(c, "cost_per_g and waste_buffer_pct must be finite numbers", 400);
  }
  if ((cost_per_g as number) < 0 || (waste_buffer_pct as number) < 0) {
    return jsonError(c, "cost_per_g and waste_buffer_pct must be non-negative", 400);
  }
  const material_rate = upsertMaterialRate({
    filament_type,
    cost_per_g: cost_per_g as number,
    waste_buffer_pct: waste_buffer_pct as number,
  });
  return c.json({ material_rate });
});
