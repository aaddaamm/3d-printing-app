import type { NormalizedMaterialUsage } from "../types.js";
import type { MoonrakerHistoryJob } from "./types.js";
import { asNumber, asStringArray } from "./utils.js";

const METADATA_WEIGHT_KEYS = [
  "filament_weight_total",
  "filament_weight_g",
  "filament_weight",
  "filament_total_weight",
  "estimated_filament_weight_g",
];

function normalizeWeightGrams(value: unknown): number | null {
  const num = asNumber(value);
  if (num != null && num > 0) return Math.round(num * 100) / 100;

  if (typeof value === "string") {
    const match = value.match(/[0-9]+(?:\.[0-9]+)?/);
    if (!match) return null;
    const parsed = Number(match[0]);
    return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) / 100 : null;
  }

  return null;
}

function sumWeightValues(values: unknown[]): number | null {
  let total = 0;
  for (const value of values) total += normalizeWeightGrams(value) ?? 0;
  return total > 0 ? Math.round(total * 100) / 100 : null;
}

function firstWeightFromMetadata(metadata: Record<string, unknown>): number | null {
  for (const key of METADATA_WEIGHT_KEYS) {
    const value = metadata[key];
    const weight = Array.isArray(value) ? sumWeightValues(value) : normalizeWeightGrams(value);
    if (weight != null) return weight;
  }

  return null;
}

function materialRowsFromWeights(
  metadata: Record<string, unknown>,
  weights: unknown[],
): NormalizedMaterialUsage[] {
  const filamentTypes = asStringArray(metadata["filament_type"]);
  const filamentNames = asStringArray(metadata["filament_name"]);
  const filamentColors = asStringArray(metadata["filament_colors"] ?? metadata["filament_colour"]);
  const referencedTools = Array.isArray(metadata["referenced_tools"])
    ? metadata["referenced_tools"]
    : [];

  return weights
    .map((value, index) => ({ weight: normalizeWeightGrams(value), index }))
    .filter((item): item is { weight: number; index: number } => item.weight != null)
    .map(({ weight, index }) => ({
      weight_g: weight,
      filament_type: filamentTypes[index] ?? filamentTypes[0] ?? null,
      filament_id: filamentNames[index] ?? null,
      color: filamentColors[index] ?? filamentColors[0] ?? null,
      toolhead_id: referencedTools[index] != null ? String(referencedTools[index]) : String(index),
      slot_id: String(index),
      confidence: "slicer_estimate",
      raw: { metadata_key: "filament_weights", index },
    }));
}

export function materialsFromJob(job: MoonrakerHistoryJob): NormalizedMaterialUsage[] {
  const metadata = job.metadata ?? {};
  const filamentWeights = metadata["filament_weights"];
  if (Array.isArray(filamentWeights)) {
    const rows = materialRowsFromWeights(metadata, filamentWeights);
    if (rows.length > 0) return rows;
  }

  const weight = firstWeightFromMetadata(metadata);
  if (weight == null) return [];

  const filamentTypes = asStringArray(metadata["filament_type"]);
  const filamentNames = asStringArray(metadata["filament_name"]);
  const filamentColors = asStringArray(metadata["filament_colors"] ?? metadata["filament_colour"]);

  return [
    {
      weight_g: weight,
      filament_type: filamentTypes[0] ?? null,
      filament_id: filamentNames[0] ?? null,
      color: filamentColors[0] ?? null,
      confidence: "slicer_estimate",
      raw: {
        metadata,
        filament_used_mm: job.filament_used ?? null,
      },
    },
  ];
}
