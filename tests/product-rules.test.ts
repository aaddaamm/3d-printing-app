import { describe, expect, it } from "vitest";
import { readyToList, sellabilityForProduct, type ProductRuleInput } from "../lib/product-rules.js";

function productInput(overrides: Partial<ProductRuleInput>): ProductRuleInput {
  return {
    licenseId: "commercial_allowed",
    sourceId: "printables",
    statusId: "active",
    targetSalePrice: 20,
    modelUrl: "https://example.com/model",
    mainFileId: null,
    mainPhotoId: 1,
    ...overrides,
  };
}

describe("sellabilityForProduct", () => {
  it("blocks personal-use-only products", () => {
    const result = sellabilityForProduct(
      productInput({ licenseId: "personal_use_only", sourceId: null }),
    );

    expect(result.level).toBe("red");
    expect(result.allowsListing).toBe(false);
  });

  it("blocks unknown licenses until verified", () => {
    const result = sellabilityForProduct(productInput({ licenseId: "unknown_verify" }));

    expect(result.level).toBe("red");
    expect(result.allowsListing).toBe(false);
  });

  it("warns but allows attribution-required products", () => {
    const result = sellabilityForProduct(productInput({ licenseId: "attribution_required" }));

    expect(result.level).toBe("yellow");
    expect(result.allowsListing).toBe(true);
    expect(result.message).toMatch(/attribution/i);
  });

  it("allows Hive Community products with STL redistribution warning", () => {
    const result = sellabilityForProduct(
      productInput({ licenseId: "hive_community", sourceId: "hive" }),
    );

    expect(result.level).toBe("green");
    expect(result.allowsListing).toBe(true);
    expect(result.message).toContain("Do not redistribute STL");
  });

  it("marks original owned products from the original source as high confidence", () => {
    const result = sellabilityForProduct(
      productInput({
        licenseId: "original_owned",
        sourceId: "original",
        modelUrl: null,
        mainFileId: 1,
      }),
    );

    expect(result.level).toBe("green");
    expect(result.allowsListing).toBe(true);
    expect(result.message).toMatch(/high confidence/i);
  });

  it.each(["hive_plus", "commercial_allowed", "original_owned"])(
    "allows %s products",
    (licenseId) => {
      const result = sellabilityForProduct(productInput({ licenseId }));

      expect(result.level).toBe("green");
      expect(result.allowsListing).toBe(true);
    },
  );
});

describe("readyToList", () => {
  it("returns true for an allowed product with price, model URL, photo, and listing status", () => {
    expect(
      readyToList(
        productInput({
          licenseId: "commercial_allowed",
          sourceId: "printables",
          statusId: "listed",
          targetSalePrice: 18,
          modelUrl: "https://example.com/model",
          mainFileId: null,
          mainPhotoId: 2,
        }),
      ),
    ).toBe(true);
  });

  it("returns true when a main file exists instead of a model URL", () => {
    expect(readyToList(productInput({ modelUrl: null, mainFileId: 4 }))).toBe(true);
  });

  it("returns false for blocked licenses", () => {
    expect(
      readyToList(
        productInput({
          licenseId: "unknown_verify",
          sourceId: "thangs",
          statusId: "listed",
          targetSalePrice: 18,
          modelUrl: "https://example.com/model",
          mainFileId: null,
          mainPhotoId: 2,
        }),
      ),
    ).toBe(false);
  });

  it.each([
    ["missing price", { targetSalePrice: null }],
    ["zero price", { targetSalePrice: 0 }],
    ["missing model URL and main file", { modelUrl: null, mainFileId: null }],
    ["missing main photo", { mainPhotoId: null }],
    ["non-listable status", { statusId: "test_print" }],
  ] satisfies Array<[string, Partial<ProductRuleInput>]>)(
    "returns false for %s",
    (_, overrides) => {
      expect(readyToList(productInput(overrides))).toBe(false);
    },
  );

  it.each(["ready_for_photos", "listed", "active", "selling_well"])(
    "allows %s status when other requirements are met",
    (statusId) => {
      expect(readyToList(productInput({ statusId }))).toBe(true);
    },
  );
});
