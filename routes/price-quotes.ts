import { Hono } from "hono";
import {
  calculatePriceQuote,
  PriceQuoteValidationError,
  type PriceQuoteRequest,
} from "../models/price-quotes.js";
import {
  saveProductPricing,
  SavedProductPricingValidationError,
  type SaveProductPricingRequest,
} from "../models/saved-product-pricing.js";
import { isNullableString, jsonError, parseJsonBody, unknownFields } from "../lib/util.js";

export const priceQuotes = new Hono();

const CALCULATE_PRICE_QUOTE_FIELDS = [
  "job_ids",
  "sellable_units",
  "batch_labor_minutes",
  "per_unit_labor_minutes",
  "packaging_cost_per_unit",
  "extra_cost",
  "channel",
  "target_margin_pct",
] as const;

const SAVE_PRODUCT_PRICING_FIELDS = [
  "job_ids",
  "sellable_units",
  "batch_labor_minutes",
  "per_unit_labor_minutes",
  "packaging_cost_per_unit",
  "extra_cost",
  "target_margin_pct",
  "product_id",
  "new_product",
  "notes",
] as const;

const NEW_PRODUCT_FIELDS = [
  "name",
  "designer",
  "source_id",
  "license_id",
  "model_url",
  "notes",
] as const;

const REQUIRED_NUMBER_FIELDS = [
  "sellable_units",
  "batch_labor_minutes",
  "per_unit_labor_minutes",
  "packaging_cost_per_unit",
  "extra_cost",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateQuoteRequestBody(body: Record<string, unknown>): string | null {
  if (!Array.isArray(body.job_ids) || body.job_ids.length === 0) {
    return "job_ids must be a non-empty array";
  }
  if (body.job_ids.some((jobId) => typeof jobId !== "number")) {
    return "job_ids must contain only numbers";
  }
  for (const field of REQUIRED_NUMBER_FIELDS) {
    if (typeof body[field] !== "number") {
      return `${field} must be a number`;
    }
  }
  if (body.target_margin_pct !== undefined && typeof body.target_margin_pct !== "number") {
    return "target_margin_pct must be a number";
  }
  return null;
}

function validateNewProductBody(value: unknown): string | null {
  if (!isRecord(value)) return "new_product must be an object";

  const unknown = unknownFields(value, NEW_PRODUCT_FIELDS);
  if (unknown.length) return `Unknown new_product fields: ${unknown.join(", ")}`;

  if (typeof value.name !== "string") return "new_product.name must be a string";

  for (const field of ["designer", "source_id", "license_id", "model_url", "notes"] as const) {
    if (value[field] !== undefined && !isNullableString(value[field])) {
      return `new_product.${field} must be a string or null`;
    }
  }

  return null;
}

priceQuotes.post("/calculate", async (c) => {
  const body = await parseJsonBody(c);
  if (!isRecord(body)) return jsonError(c, "Invalid JSON body", 400);

  const unknown = unknownFields(body, CALCULATE_PRICE_QUOTE_FIELDS);
  if (unknown.length) return jsonError(c, `Unknown fields: ${unknown.join(", ")}`, 400);

  const bodyError = validateQuoteRequestBody(body);
  if (bodyError) return jsonError(c, bodyError, 400);

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

priceQuotes.post("/save-to-product", async (c) => {
  const body = await parseJsonBody(c);
  if (!isRecord(body)) return jsonError(c, "Invalid JSON body", 400);

  const unknown = unknownFields(body, SAVE_PRODUCT_PRICING_FIELDS);
  if (unknown.length) return jsonError(c, `Unknown fields: ${unknown.join(", ")}`, 400);

  const bodyError = validateQuoteRequestBody(body);
  if (bodyError) return jsonError(c, bodyError, 400);

  if (body.product_id !== undefined && typeof body.product_id !== "number") {
    return jsonError(c, "product_id must be a number", 400);
  }
  if (body.notes !== undefined && !isNullableString(body.notes)) {
    return jsonError(c, "notes must be a string or null", 400);
  }

  const hasProductId = body.product_id !== undefined;
  const hasNewProduct = body.new_product !== undefined;
  if (hasProductId === hasNewProduct) {
    return jsonError(c, "Exactly one of product_id or new_product is required", 400);
  }

  if (hasNewProduct) {
    const newProductError = validateNewProductBody(body.new_product);
    if (newProductError) return jsonError(c, newProductError, 400);
  }

  try {
    const saved = saveProductPricing(body as SaveProductPricingRequest);
    return c.json({ saved, image_warnings: [] }, 201);
  } catch (error: unknown) {
    if (error instanceof SavedProductPricingValidationError) {
      return jsonError(c, error.message, 400);
    }
    throw error;
  }
});
