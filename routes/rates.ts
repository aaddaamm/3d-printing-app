import { Hono } from "hono";
import {
  getRates,
  updateLaborConfig,
  upsertMachineRate,
  upsertMaterialRate,
} from "../models/rates.js";
import { parseJsonBody, jsonError, isFiniteNumber } from "../lib/util.js";

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
  const hasFiniteLaborNumbers =
    isFiniteNumber(hourly_rate) &&
    isFiniteNumber(minimum_minutes) &&
    isFiniteNumber(profit_markup_pct) &&
    isFiniteNumber(failure_buffer_pct) &&
    isFiniteNumber(overhead_buffer_pct);
  if (!hasFiniteLaborNumbers) {
    return jsonError(
      c,
      "hourly_rate, minimum_minutes, profit_markup_pct, failure_buffer_pct, overhead_buffer_pct must be finite numbers",
      400,
    );
  }
  const hasNegativeLaborValue =
    hourly_rate < 0 ||
    minimum_minutes < 0 ||
    profit_markup_pct < 0 ||
    failure_buffer_pct < 0 ||
    overhead_buffer_pct < 0;
  if (hasNegativeLaborValue) {
    return jsonError(c, "Values must be non-negative", 400);
  }
  const labor_config = updateLaborConfig({
    hourly_rate,
    minimum_minutes,
    profit_markup_pct,
    failure_buffer_pct,
    overhead_buffer_pct,
  });
  return c.json({ labor_config });
});

rates.patch("/machines/:device_model", async (c) => {
  const device_model = c.req.param("device_model");
  const body = await parseJsonBody(c);
  if (!body) return jsonError(c, "Invalid JSON", 400);

  const { purchase_price, lifetime_hrs, electricity_rate, maintenance_buffer } = body;
  const hasFiniteMachineNumbers =
    isFiniteNumber(purchase_price) &&
    isFiniteNumber(lifetime_hrs) &&
    isFiniteNumber(electricity_rate) &&
    isFiniteNumber(maintenance_buffer);
  if (!hasFiniteMachineNumbers) {
    return jsonError(
      c,
      "purchase_price, lifetime_hrs, electricity_rate, maintenance_buffer must be finite numbers",
      400,
    );
  }
  const hasInvalidMachineRange =
    purchase_price < 0 || lifetime_hrs <= 0 || electricity_rate < 0 || maintenance_buffer < 0;
  if (hasInvalidMachineRange) {
    return jsonError(
      c,
      "purchase_price, electricity_rate, and maintenance_buffer must be non-negative; lifetime_hrs must be greater than 0",
      400,
    );
  }
  const machine_rate = upsertMachineRate({
    device_model,
    purchase_price,
    lifetime_hrs,
    electricity_rate,
    maintenance_buffer,
  });
  return c.json({ machine_rate });
});

rates.patch("/materials/:filament_type", async (c) => {
  const filament_type = c.req.param("filament_type");
  const body = await parseJsonBody(c);
  if (!body) return jsonError(c, "Invalid JSON", 400);

  const { cost_per_g, waste_buffer_pct } = body;
  const hasFiniteMaterialNumbers = isFiniteNumber(cost_per_g) && isFiniteNumber(waste_buffer_pct);
  if (!hasFiniteMaterialNumbers) {
    return jsonError(c, "cost_per_g and waste_buffer_pct must be finite numbers", 400);
  }
  const hasNegativeMaterialValue = cost_per_g < 0 || waste_buffer_pct < 0;
  if (hasNegativeMaterialValue) {
    return jsonError(c, "cost_per_g and waste_buffer_pct must be non-negative", 400);
  }
  const material_rate = upsertMaterialRate({
    filament_type,
    cost_per_g,
    waste_buffer_pct,
  });
  return c.json({ material_rate });
});
