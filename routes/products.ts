import { Hono } from "hono";
import {
  ProductValidationError,
  createProduct,
  createProductFromJob,
  createProductFromProject,
  listProducts,
  listProductsToPrintNext,
  listSalesCompanionProducts,
  updateProduct,
  type CreateProductInput,
  type UpdateProductInput,
} from "../models/products.js";
import {
  listProductPricingHistory,
  SavedProductPricingValidationError,
} from "../models/saved-product-pricing.js";
import { jsonError, parseJsonBody, requireId, unknownFields } from "../lib/util.js";

export const products = new Hono();

const PRODUCT_MUTABLE_FIELDS = [
  "name",
  "description",
  "designer",
  "category_id",
  "status_id",
  "source_id",
  "license_id",
  "model_url",
  "main_file_id",
  "main_photo_id",
  "etsy_listing_url",
  "default_material",
  "primary_color",
  "accent_color",
  "preferred_printer_id",
  "estimated_print_time_s",
  "estimated_filament_g",
  "target_sale_price",
  "booth_price",
  "etsy_price",
  "packaging_cost",
  "handling_minutes",
  "target_margin_pct",
  "pricing_notes",
  "notes",
  "is_original_design",
  "sales_companion_visible",
  "restock_priority",
] as const;

function handleProductError(c: Parameters<typeof jsonError>[0], error: unknown): Response {
  if (error instanceof ProductValidationError) return jsonError(c, error.message, 400);
  throw error;
}

function findProduct(id: number) {
  return listProducts().find((product) => product.id === id) ?? null;
}

function handleSavedPricingError(c: Parameters<typeof jsonError>[0], error: unknown): Response {
  if (error instanceof SavedProductPricingValidationError) {
    return jsonError(c, error.message, 400);
  }
  throw error;
}

products.get("/", (c) => {
  return c.json({ products: listProducts() });
});

// Must be before /:id to avoid param capture.
products.get("/print-next", (c) => {
  return c.json({ products: listProductsToPrintNext() });
});

// Must be before /:id to avoid param capture.
products.get("/sales-companion", (c) => {
  return c.json({ products: listSalesCompanionProducts() });
});

products.post("/from-job/:jobId", (c) => {
  const jobId = Number(c.req.param("jobId"));
  if (!Number.isInteger(jobId) || jobId <= 0) return jsonError(c, "Invalid jobId", 400);

  try {
    const product = createProductFromJob(jobId);
    return c.json({ product }, 201);
  } catch (error: unknown) {
    return handleProductError(c, error);
  }
});

products.post("/from-project/:projectId", (c) => {
  const projectId = Number(c.req.param("projectId"));
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return jsonError(c, "Invalid projectId", 400);
  }

  try {
    const product = createProductFromProject(projectId);
    return c.json({ product }, 201);
  } catch (error: unknown) {
    return handleProductError(c, error);
  }
});

products.post("/", async (c) => {
  const body = await parseJsonBody(c);
  if (!body) return jsonError(c, "Invalid JSON body", 400);

  const unknown = unknownFields(body, PRODUCT_MUTABLE_FIELDS as unknown as readonly string[]);
  if (unknown.length) return jsonError(c, `Unknown fields: ${unknown.join(", ")}`, 400);

  try {
    const product = createProduct(body as unknown as CreateProductInput);
    return c.json({ product }, 201);
  } catch (error: unknown) {
    return handleProductError(c, error);
  }
});

products.get("/:id/pricing-history", (c) => {
  const idOrError = requireId(c);
  if (idOrError instanceof Response) return idOrError;

  const product = findProduct(idOrError);
  if (!product) return jsonError(c, "Not found", 404);

  try {
    return c.json({ history: listProductPricingHistory(idOrError) });
  } catch (error: unknown) {
    return handleSavedPricingError(c, error);
  }
});

products.get("/:id", (c) => {
  const idOrError = requireId(c);
  if (idOrError instanceof Response) return idOrError;

  const product = findProduct(idOrError);
  if (!product) return jsonError(c, "Not found", 404);
  return c.json({ product });
});

products.patch("/:id", async (c) => {
  const idOrError = requireId(c);
  if (idOrError instanceof Response) return idOrError;

  const body = await parseJsonBody(c);
  if (!body) return jsonError(c, "Invalid JSON body", 400);

  const unknown = unknownFields(body, PRODUCT_MUTABLE_FIELDS as unknown as readonly string[]);
  if (unknown.length) return jsonError(c, `Unknown fields: ${unknown.join(", ")}`, 400);

  try {
    const product = updateProduct(idOrError, body as unknown as UpdateProductInput);
    if (!product) return jsonError(c, "Not found", 404);
    return c.json({ product });
  } catch (error: unknown) {
    return handleProductError(c, error);
  }
});
