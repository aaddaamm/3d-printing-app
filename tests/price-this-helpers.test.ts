import { describe, expect, it } from "vitest";
import {
  filterPriceCandidateJobs,
  formatPriceQuoteForClipboard,
  parsePriceJobIds,
} from "../frontend/components/price-this-helpers.js";
import type { Job } from "../frontend/components/jobs-view-types.js";
import type { PriceQuoteResult } from "../frontend/lib/api.js";

const quote: PriceQuoteResult = {
  channel: "etsy",
  assumptions: {
    labor_hourly_rate: 30,
    target_margin_pct: 0.393,
    platform_fee_pct: 0.12,
    fixed_fee_per_order: 0.45,
    failure_buffer_pct: 0.1,
    overhead_buffer_pct: 0.05,
    resolved_rates: [
      {
        job_id: 12,
        task_id: "task-12",
        material_type: "PLA",
        material_rate_per_kg: 20,
        printer: "X1 Carbon",
        machine_rate_per_hr: 2.25,
        used_material_fallback: false,
        used_machine_fallback: false,
      },
      {
        job_id: 7,
        task_id: "task-7",
        material_type: "PLA",
        material_rate_per_kg: 20,
        printer: "SV08",
        machine_rate_per_hr: 1.8,
        used_material_fallback: true,
        used_machine_fallback: false,
      },
    ],
  },
  attempts: [
    {
      job_id: 12,
      title: "Green Ranger Dagger",
      status: "finish",
      printer: "X1 Carbon",
      material_cost: 24,
      machine_cost: 11.45,
      production_loss_cost: 0,
    },
    {
      job_id: 7,
      title: "Green Ranger Dagger",
      status: "failed",
      printer: "SV08",
      material_cost: 2,
      machine_cost: 1.25,
      production_loss_cost: 3.25,
    },
  ],
  warnings: [],
  breakdown: {
    sellableUnits: 1,
    materialCost: 26,
    machineCost: 12.7,
    productionLossCost: 3.25,
    batchLaborCost: 2.5,
    perUnitLaborCost: 0.5,
    packagingCost: 0.75,
    extraCost: 0,
    subtotalCost: 42.18,
    bufferCost: 0,
    totalCost: 42.18,
    unitCost: 42.18,
    minimumViablePrice: 48.44,
    suggestedPrice: 89.99,
    profitPerUnit: 35.41,
    profitPerBatch: 35.41,
    estimatedMarginPct: 0.393,
  },
};

describe("parsePriceJobIds", () => {
  it("parses unique positive integer job IDs in first-seen order", () => {
    expect(parsePriceJobIds("?jobIds=12,7,12,nope")).toEqual([12, 7]);
  });

  it("ignores missing and invalid job IDs", () => {
    expect(parsePriceJobIds("?jobIds=0,-2,3.5,,abc")).toEqual([]);
    expect(parsePriceJobIds("?other=12")).toEqual([]);
  });
});

describe("filterPriceCandidateJobs", () => {
  const jobs: Job[] = [
    { id: 1, designTitle: "Green Ranger Dagger", deviceModel: "X1 Carbon", status: "finish" },
    { id: 2, designTitle: "Helmet", deviceModel: "SV08", status: "failed" },
    { id: 3, designTitle: "Dragon", deviceModel: "A1 Mini", status: "running" },
  ];

  it.each([
    ["ranger", [1]],
    ["sv08", [2]],
    ["RUNNING", [3]],
  ])("searches title, printer, and status for %s", (query, expectedIds) => {
    expect(filterPriceCandidateJobs(jobs, query, new Set()).map((job) => job.id)).toEqual(
      expectedIds,
    );
  });

  it("excludes selected jobs, including when the query is blank", () => {
    expect(filterPriceCandidateJobs(jobs, "  ", new Set([2])).map((job) => job.id)).toEqual([1, 3]);
    expect(filterPriceCandidateJobs(jobs, "helmet", new Set([2]))).toEqual([]);
  });
});

describe("formatPriceQuoteForClipboard", () => {
  it("formats a concise, readable quote summary", () => {
    const formatted = formatPriceQuoteForClipboard(quote);

    expect(formatted).toContain("Green Ranger Dagger");
    expect(formatted).toContain("2 production attempts · 1 sellable unit");
    expect(formatted).toContain("Manufacturing cost: $42.18 per unit");
    expect(formatted).toContain("Production loss: $3.25");
    expect(formatted).toContain("Recommended Etsy price: $89.99 per unit");
    expect(formatted).toContain("Expected profit: $35.41 per unit (39.3% margin)");
    expect(formatted).not.toContain("Warnings:");
  });

  it("includes warnings only when present", () => {
    const formatted = formatPriceQuoteForClipboard({
      ...quote,
      warnings: ["Printer rate fell back to the default."],
    });

    expect(formatted).toContain("Warnings:\n- Printer rate fell back to the default.");
  });
});
