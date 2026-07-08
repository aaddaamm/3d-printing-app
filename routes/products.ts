import { Hono } from "hono";
import {
  ProductValidationError,
  createProduct,
  listProducts,
  listProductsToPrintNext,
  updateProduct,
  type CreateProductInput,
  type UpdateProductInput,
} from "../models/products.js";
import { jsonError, parseJsonBody, requireId, unknownFields } from "../lib/util.js";

export const products = new Hono();

const PRODUCT_MUTABLE_FIELDS = [
  "name",
  "description",
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
  "restock_priority",
] as const;

function handleProductError(c: Parameters<typeof jsonError>[0], error: unknown): Response {
  if (error instanceof ProductValidationError) return jsonError(c, error.message, 400);
  throw error;
}

function findProduct(id: number) {
  return listProducts().find((product) => product.id === id) ?? null;
}

products.get("/", (c) => {
  return c.json({ products: listProducts() });
});

// Must be before /:id to avoid param capture.
products.get("/print-next", (c) => {
  return c.json({ products: listProductsToPrintNext() });
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
