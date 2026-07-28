import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import {
  ProductValidationError,
  createProduct,
  createProductFromJob,
  createProductFromProject,
  listProducts,
  listProductsToPrintNext,
  listSalesCompanionProducts,
  type CreateProductInput,
  type UpdateProductInput,
} from "../models/products.js";
import {
  listProductPricingHistory,
  SavedProductPricingValidationError,
} from "../models/saved-product-pricing.js";
import {
  createManualProductPhoto,
  ensureGeneratedProductImageCandidates,
  listProductImageCandidates,
  refreshProductIdentificationImages,
  returnProductImageToAuto,
  selectProductImage,
} from "../models/product-images.js";
import {
  ProductImageFileSizeError,
  ProductImageFileValidationError,
  storeUploadedProductImage,
} from "../lib/product-image-files.js";
import { jsonError, parseJsonBody, requireId, unknownFields } from "../lib/util.js";
import { updateProductWithAutoImage } from "../models/product-image-update.js";

export const products = new Hono();

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const MAX_MULTIPART_BYTES = 12 * 1024 * 1024;

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

function publicUploadedPhoto(photo: ReturnType<typeof createManualProductPhoto>["photo"]) {
  return {
    id: photo.id,
    product_id: photo.product_id,
    source_type: photo.source_type,
    source_ref: photo.source_ref,
    candidate_key: photo.candidate_key,
    content_type: photo.content_type,
    width: photo.width,
    height: photo.height,
    is_app_owned: photo.is_app_owned,
    url: `/ui/product-photos/${photo.id}`,
  };
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

products.get("/:id/image-candidates", async (c) => {
  const idOrError = requireId(c);
  if (idOrError instanceof Response) return idOrError;
  if (!findProduct(idOrError)) return jsonError(c, "Not found", 404);

  try {
    return c.json(await ensureGeneratedProductImageCandidates(idOrError));
  } catch (error: unknown) {
    return handleProductError(c, error);
  }
});

products.post("/:id/images/refresh", async (c) => {
  const idOrError = requireId(c);
  if (idOrError instanceof Response) return idOrError;
  if (!findProduct(idOrError)) return jsonError(c, "Not found", 404);

  try {
    const { product, warnings } = await refreshProductIdentificationImages(idOrError);
    return c.json({ product, candidates: listProductImageCandidates(idOrError), warnings });
  } catch (error: unknown) {
    return handleProductError(c, error);
  }
});

products.post(
  "/:id/photos",
  bodyLimit({
    maxSize: MAX_MULTIPART_BYTES,
    onError: (c) => jsonError(c, "Multipart upload exceeds the 12 MiB limit", 413),
  }),
  async (c) => {
    const idOrError = requireId(c);
    if (idOrError instanceof Response) return idOrError;
    if (!findProduct(idOrError)) return jsonError(c, "Not found", 404);

    const declaredLength = c.req.header("Content-Length");
    if (declaredLength && /^\d+$/.test(declaredLength)) {
      if (BigInt(declaredLength) > BigInt(MAX_MULTIPART_BYTES)) {
        return jsonError(c, "Multipart upload exceeds the 12 MiB limit", 413);
      }
    }

    let body: Awaited<ReturnType<typeof c.req.parseBody>>;
    try {
      body = await c.req.parseBody();
    } catch {
      return jsonError(c, "Invalid multipart body", 400);
    }
    const photo = body["photo"];
    if (!(photo instanceof File)) return jsonError(c, "photo must be a multipart File", 400);
    if (photo.size > MAX_PHOTO_BYTES) {
      return jsonError(c, "Photo exceeds the 10 MiB limit", 413);
    }

    let stored;
    try {
      stored = await storeUploadedProductImage(
        idOrError,
        new Uint8Array(await photo.arrayBuffer()),
      );
    } catch (error: unknown) {
      if (error instanceof ProductImageFileSizeError) {
        return jsonError(c, error.message, 413);
      }
      if (error instanceof ProductImageFileValidationError) {
        return jsonError(c, error.message, 400);
      }
      throw error;
    }

    try {
      const result = createManualProductPhoto(idOrError, stored);
      return c.json({ product: result.product, photo: publicUploadedPhoto(result.photo) }, 201);
    } catch (error: unknown) {
      // Content-addressed output is retained as a safe orphan. Inline reference-check/delete
      // races with another request committing the same path; later GC must prove it unreferenced.
      return handleProductError(c, error);
    }
  },
);

products.post("/:id/image-selection", async (c) => {
  const idOrError = requireId(c);
  if (idOrError instanceof Response) return idOrError;
  if (!findProduct(idOrError)) return jsonError(c, "Not found", 404);

  const body = await parseJsonBody(c);
  if (!body) return jsonError(c, "Invalid JSON body", 400);
  const unknown = unknownFields(body, ["mode", "candidate_key"]);
  if (unknown.length) return jsonError(c, `Unknown fields: ${unknown.join(", ")}`, 400);

  try {
    if (body["mode"] === "auto" && Object.keys(body).length === 1) {
      return c.json({ product: returnProductImageToAuto(idOrError) });
    }
    if (
      body["mode"] === "manual" &&
      Object.keys(body).length === 2 &&
      typeof body["candidate_key"] === "string" &&
      body["candidate_key"].trim() !== ""
    ) {
      return c.json({ product: selectProductImage(idOrError, body["candidate_key"]) });
    }
    return jsonError(c, "Invalid image selection body", 400);
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
    const product = updateProductWithAutoImage(idOrError, body as unknown as UpdateProductInput);
    if (!product) return jsonError(c, "Not found", 404);
    return c.json({ product });
  } catch (error: unknown) {
    return handleProductError(c, error);
  }
});
