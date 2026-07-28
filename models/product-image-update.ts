import { db } from "../lib/db.js";
import { clearAutoSourcePhoto, refreshAutoProductImageBody } from "./product-images.js";
import {
  getProductSummaryById,
  updateProduct,
  type ProductSummary,
  type UpdateProductInput,
} from "./products.js";

const updateProductWithAutoImageTransaction = db.transaction(
  (productId: number, input: UpdateProductInput): ProductSummary | null => {
    const previous = getProductSummaryById(productId);
    if (!previous) return null;
    const updated = updateProduct(productId, input);
    if (!updated) return null;
    if (previous.model_url === updated.model_url) return updated;

    clearAutoSourcePhoto(productId);
    return updated.image_selection_mode === "auto"
      ? refreshAutoProductImageBody(productId)
      : updated;
  },
);

export function updateProductWithAutoImage(
  productId: number,
  input: UpdateProductInput,
): ProductSummary | null {
  return updateProductWithAutoImageTransaction(productId, input);
}
