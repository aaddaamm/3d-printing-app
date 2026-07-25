import type { PriceQuoteResult } from "../lib/api.js";
import type { Job } from "./jobs-view-types.js";

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
