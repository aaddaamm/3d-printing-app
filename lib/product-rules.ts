export type SellabilityLevel = "green" | "yellow" | "red";

export interface ProductRuleInput {
  licenseId: string | null;
  sourceId: string | null;
  statusId: string | null;
  targetSalePrice: number | null;
  modelUrl: string | null;
  mainFileId: number | null;
  mainPhotoId: number | null;
}

export function sellabilityForProduct(input: ProductRuleInput): {
  level: SellabilityLevel;
  label: string;
  message: string;
  allowsListing: boolean;
} {
  if (input.licenseId === "personal_use_only") {
    return {
      level: "red",
      label: "Personal use only",
      message: "Personal-use-only licenses do not allow commercial listings.",
      allowsListing: false,
    };
  }

  if (input.licenseId === "unknown_verify" || input.licenseId === null) {
    return {
      level: "red",
      label: "Verify license",
      message: "Verify the license before listing this product for sale.",
      allowsListing: false,
    };
  }

  if (input.licenseId === "attribution_required") {
    return {
      level: "yellow",
      label: "Attribution required",
      message: "Commercial listing is allowed only when the public listing includes attribution.",
      allowsListing: true,
    };
  }

  if (input.licenseId === "hive_community") {
    return {
      level: "green",
      label: "Hive Community",
      message: "Physical print sales are allowed. Do not redistribute STL files.",
      allowsListing: true,
    };
  }

  if (input.licenseId === "original_owned" && input.sourceId === "original") {
    return {
      level: "green",
      label: "Original design",
      message: "High confidence: original design owned by Robinson PrintWorks.",
      allowsListing: true,
    };
  }

  if (
    input.licenseId === "hive_plus" ||
    input.licenseId === "commercial_allowed" ||
    input.licenseId === "original_owned"
  ) {
    return {
      level: "green",
      label: "Commercial use allowed",
      message: "Commercial listing is allowed under the selected license.",
      allowsListing: true,
    };
  }

  return {
    level: "red",
    label: "Verify license",
    message: "License is not recognized. Verify commercial sale rights before listing.",
    allowsListing: false,
  };
}

export function readyToList(input: ProductRuleInput): boolean {
  const sellability = sellabilityForProduct(input);
  const hasPrice = input.targetSalePrice !== null && input.targetSalePrice > 0;
  const hasModelReference = Boolean(input.modelUrl?.trim()) || input.mainFileId !== null;
  const hasPhoto = input.mainPhotoId !== null;
  const hasListableStatus =
    input.statusId === "ready_for_photos" ||
    input.statusId === "listed" ||
    input.statusId === "active" ||
    input.statusId === "selling_well";

  return (
    sellability.allowsListing && hasPrice && hasModelReference && hasPhoto && hasListableStatus
  );
}
