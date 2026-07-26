import type { PriceQuoteRequest, PriceQuoteResult, SaveProductPricingRequest } from "../lib/api.js";
import type { Job } from "./jobs-view-types.js";

export type PriceThisDraft = {
  selectedJobIds: number[];
  sellableUnits: number;
  batchLaborMinutes: number;
  perUnitLaborMinutes: number;
  packagingCostPerUnit: number;
  extraCost: number;
  channel: "direct" | "etsy";
};

export type ExistingOrNewProductSelection =
  | { mode: "existing"; productId: number }
  | {
      mode: "new";
      name: string;
      designer: string;
      sourceId: string;
      licenseId: string;
      modelUrl: string;
      notes: string;
    };

export type SaveToProductModalState = {
  mode: ExistingOrNewProductSelection["mode"];
  existingProductId: string;
  newProduct: Extract<ExistingOrNewProductSelection, { mode: "new" }>;
};

export type SaveProductRequestState = {
  mounted: boolean;
  generation: number;
  activeGeneration: number | null;
};

export type PriceQuoteRequestState = {
  generation: number;
  activeGeneration: number | null;
};

export function initialSaveToProductModalState(
  jobs: Array<Job | undefined>,
): SaveToProductModalState {
  return {
    mode: "new",
    existingProductId: "",
    newProduct: {
      mode: "new",
      name: suggestedProductName(jobs),
      designer: "",
      sourceId: "",
      licenseId: "unknown_verify",
      modelUrl: "",
      notes: "",
    },
  };
}

export function setSaveToProductMode(
  state: SaveToProductModalState,
  mode: SaveToProductModalState["mode"],
): SaveToProductModalState {
  return { ...state, mode };
}

export function setSaveToProductExistingProductId(
  state: SaveToProductModalState,
  existingProductId: string,
): SaveToProductModalState {
  return { ...state, existingProductId };
}

export function setSaveToProductNewProductField(
  state: SaveToProductModalState,
  field: keyof SaveToProductModalState["newProduct"],
  value: string,
): SaveToProductModalState {
  if (field === "mode") return state;
  return {
    ...state,
    newProduct: {
      ...state.newProduct,
      [field]: value,
    },
  };
}

export function saveToProductSelection(
  state: SaveToProductModalState,
): ExistingOrNewProductSelection {
  return state.mode === "existing"
    ? { mode: "existing", productId: Number(state.existingProductId) }
    : { ...state.newProduct };
}

export function canSaveToProduct(
  state: SaveToProductModalState,
  options: { loadingProducts: boolean; saving: boolean },
): boolean {
  if (options.saving) return false;
  if (state.mode === "existing") {
    const existingProductNumber = Number(state.existingProductId);
    return (
      Number.isSafeInteger(existingProductNumber) &&
      existingProductNumber > 0 &&
      !options.loadingProducts
    );
  }
  return Boolean(state.newProduct.name.trim());
}

export function initialSaveProductRequestState(): SaveProductRequestState {
  return { mounted: true, generation: 0, activeGeneration: null };
}

export function beginSaveProductRequest(state: SaveProductRequestState): {
  state: SaveProductRequestState;
  requestGeneration: number;
} | null {
  if (!state.mounted || state.activeGeneration !== null) return null;

  const requestGeneration = state.generation + 1;
  return {
    state: { ...state, generation: requestGeneration, activeGeneration: requestGeneration },
    requestGeneration,
  };
}

export function invalidateSaveProductRequests(
  state: SaveProductRequestState,
): SaveProductRequestState {
  return { ...state, generation: state.generation + 1, activeGeneration: null };
}

export function unmountSaveProductRequests(
  state: SaveProductRequestState,
): SaveProductRequestState {
  return { mounted: false, generation: state.generation + 1, activeGeneration: null };
}

export function isCurrentSaveProductRequest(
  state: SaveProductRequestState,
  requestGeneration: number,
): boolean {
  return (
    state.mounted &&
    state.generation === requestGeneration &&
    state.activeGeneration === requestGeneration
  );
}

export function completeSaveProductRequest(
  state: SaveProductRequestState,
  requestGeneration: number,
): SaveProductRequestState {
  return isCurrentSaveProductRequest(state, requestGeneration)
    ? { ...state, activeGeneration: null }
    : state;
}

export function initialPriceQuoteRequestState(): PriceQuoteRequestState {
  return { generation: 0, activeGeneration: null };
}

export function beginPriceQuoteRequest(state: PriceQuoteRequestState): {
  state: PriceQuoteRequestState;
  requestGeneration: number;
} {
  const requestGeneration = state.generation + 1;
  return {
    state: { generation: requestGeneration, activeGeneration: requestGeneration },
    requestGeneration,
  };
}

export function invalidatePriceQuoteRequests(
  state: PriceQuoteRequestState,
): PriceQuoteRequestState {
  return { generation: state.generation + 1, activeGeneration: null };
}

export function isCurrentPriceQuoteRequest(
  state: PriceQuoteRequestState,
  requestGeneration: number,
): boolean {
  return state.generation === requestGeneration && state.activeGeneration === requestGeneration;
}

export function completePriceQuoteRequest(
  state: PriceQuoteRequestState,
  requestGeneration: number,
): PriceQuoteRequestState {
  return isCurrentPriceQuoteRequest(state, requestGeneration)
    ? { ...state, activeGeneration: null }
    : state;
}

export function initialPriceThisDraft(jobIds: number[]): PriceThisDraft {
  return {
    selectedJobIds: [...new Set(jobIds)],
    sellableUnits: 1,
    batchLaborMinutes: 0,
    perUnitLaborMinutes: 0,
    packagingCostPerUnit: 0,
    extraCost: 0,
    channel: "direct",
  };
}

export function canCalculatePriceQuote(draft: PriceThisDraft): boolean {
  return (
    draft.selectedJobIds.length > 0 &&
    Number.isInteger(draft.sellableUnits) &&
    draft.sellableUnits > 0
  );
}

export function togglePriceJob(draft: PriceThisDraft, jobId: number): PriceThisDraft {
  const selectedJobIds = draft.selectedJobIds.includes(jobId)
    ? draft.selectedJobIds.filter((id) => id !== jobId)
    : [...draft.selectedJobIds, jobId];
  return { ...draft, selectedJobIds };
}

export function priceThisDraftToRequest(draft: PriceThisDraft): PriceQuoteRequest {
  return {
    job_ids: [...draft.selectedJobIds],
    sellable_units: draft.sellableUnits,
    batch_labor_minutes: draft.batchLaborMinutes,
    per_unit_labor_minutes: draft.perUnitLaborMinutes,
    packaging_cost_per_unit: draft.packagingCostPerUnit,
    extra_cost: draft.extraCost,
    channel: draft.channel,
  };
}

export function suggestedProductName(jobs: Array<Job | undefined>): string {
  for (const job of jobs) {
    const designTitle = job?.designTitle?.trim();
    if (designTitle) return designTitle;

    const title = (job as (Job & { title?: string }) | undefined)?.title?.trim();
    if (title) return title;
  }

  return "New product";
}

export function buildSaveProductPricingRequest(
  draft: PriceThisDraft,
  selection: ExistingOrNewProductSelection,
): SaveProductPricingRequest {
  const request: SaveProductPricingRequest = {
    job_ids: [...draft.selectedJobIds],
    sellable_units: draft.sellableUnits,
    batch_labor_minutes: draft.batchLaborMinutes,
    per_unit_labor_minutes: draft.perUnitLaborMinutes,
    packaging_cost_per_unit: draft.packagingCostPerUnit,
    extra_cost: draft.extraCost,
  };

  if (selection.mode === "existing") {
    return { ...request, product_id: selection.productId };
  }

  return {
    ...request,
    new_product: {
      name: selection.name.trim(),
      designer: trimNullableText(selection.designer),
      source_id: trimNullableText(selection.sourceId),
      license_id: trimNullableText(selection.licenseId),
      model_url: trimNullableText(selection.modelUrl),
      notes: trimNullableText(selection.notes),
    },
  };
}

export function parsePriceJobIds(search: string): number[] {
  const values = new URLSearchParams(search).get("jobIds")?.split(",") ?? [];
  const jobIds: number[] = [];
  const seen = new Set<number>();

  for (const value of values) {
    const trimmed = value.trim();
    if (!/^\d+$/.test(trimmed)) continue;
    const jobId = Number(trimmed);
    if (!Number.isSafeInteger(jobId) || jobId <= 0 || seen.has(jobId)) continue;
    seen.add(jobId);
    jobIds.push(jobId);
  }

  return jobIds;
}

export function filterPriceCandidateJobs(
  jobs: Job[],
  query: string,
  selectedIds: Set<number>,
): Job[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  return jobs.filter((job) => {
    if (selectedIds.has(job.id)) return false;
    if (!normalizedQuery) return true;
    return [job.designTitle, job.deviceModel, job.status].some((value) =>
      value?.toLocaleLowerCase().includes(normalizedQuery),
    );
  });
}

export function formatPriceQuoteForClipboard(quote: PriceQuoteResult): string {
  const attemptCount = quote.attempts.length;
  const sellableUnits = quote.breakdown.sellableUnits;
  const channel = quote.channel === "etsy" ? "Etsy" : "direct";
  const heading = quote.attempts[0]?.title.trim() || "Price quote";
  const lines = [
    heading,
    `${attemptCount} production ${attemptCount === 1 ? "attempt" : "attempts"} · ${sellableUnits} sellable ${sellableUnits === 1 ? "unit" : "units"}`,
    `Manufacturing cost: ${formatMoney(quote.breakdown.unitCost)} per unit`,
    `Production loss: ${formatMoney(quote.breakdown.productionLossCost)}`,
    `Recommended ${channel} price: ${formatMoney(quote.breakdown.suggestedPrice)} per unit`,
    `Expected profit: ${formatMoney(quote.breakdown.profitPerUnit)} per unit (${(quote.breakdown.estimatedMarginPct * 100).toFixed(1)}% margin)`,
  ];

  if (quote.warnings.length > 0) {
    lines.push("", "Warnings:", ...quote.warnings.map((warning) => `- ${warning}`));
  }

  return lines.join("\n");
}

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}

function trimNullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}
