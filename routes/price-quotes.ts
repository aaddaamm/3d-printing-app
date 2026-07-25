import { Hono } from "hono";
import {
  calculatePriceQuote,
  PriceQuoteValidationError,
  type PriceQuoteRequest,
} from "../models/price-quotes.js";
import { jsonError, parseJsonBody, unknownFields } from "../lib/util.js";

export const priceQuotes = new Hono();

const PRICE_QUOTE_FIELDS = [
  "job_ids",
  "sellable_units",
  "batch_labor_minutes",
  "per_unit_labor_minutes",
  "packaging_cost_per_unit",
  "extra_cost",
  "channel",
  "target_margin_pct",
] as const;

const REQUIRED_NUMBER_FIELDS = [
  "sellable_units",
  "batch_labor_minutes",
  "per_unit_labor_minutes",
  "packaging_cost_per_unit",
  "extra_cost",
] as const;

priceQuotes.post("/calculate", async (c) => {
  const body = await parseJsonBody(c);
  if (!body) return jsonError(c, "Invalid JSON body", 400);

  const unknown = unknownFields(body, PRICE_QUOTE_FIELDS);
  if (unknown.length) return jsonError(c, `Unknown fields: ${unknown.join(", ")}`, 400);

  if (!Array.isArray(body.job_ids) || body.job_ids.length === 0) {
    return jsonError(c, "job_ids must be a non-empty array", 400);
  }
  if (body.job_ids.some((jobId) => typeof jobId !== "number")) {
    return jsonError(c, "job_ids must contain only numbers", 400);
  }
  for (const field of REQUIRED_NUMBER_FIELDS) {
    if (typeof body[field] !== "number") {
      return jsonError(c, `${field} must be a number`, 400);
    }
  }
  if (body.target_margin_pct !== undefined && typeof body.target_margin_pct !== "number") {
    return jsonError(c, "target_margin_pct must be a number", 400);
  }
  if (body.channel !== "direct" && body.channel !== "etsy") {
    return jsonError(c, 'channel must be either "direct" or "etsy"', 400);
  }

  try {
    const quote = calculatePriceQuote(body as PriceQuoteRequest);
    return c.json({ quote });
  } catch (error: unknown) {
    if (error instanceof PriceQuoteValidationError) return jsonError(c, error.message, 400);
    throw error;
  }
});
