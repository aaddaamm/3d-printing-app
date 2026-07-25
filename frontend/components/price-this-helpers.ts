import type { PriceQuoteRequest, PriceQuoteResult } from "../lib/api.js";
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
