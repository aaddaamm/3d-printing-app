import type { NormalizedMaterialUsage, NormalizedPrintRecord } from "./types.js";
import type { PrintTask } from "../types.js";

function providerScopedId(providerId: string, recordId: string): string {
  if (providerId === "bambu") return recordId;
  return `${providerId}:${recordId}`;
}

function firstMediaUrl(record: NormalizedPrintRecord, kind: "cover" | "thumbnail"): string | null {
  return record.media.find((asset) => asset.kind === kind)?.url ?? null;
}

function totalMaterialWeight(materials: NormalizedMaterialUsage[]): number | null {
  const total = materials.reduce((sum, material) => sum + (material.weight_g ?? 0), 0);
  return total > 0 ? Math.round(total * 100) / 100 : null;
}

function toAmsDetailMapping(materials: NormalizedMaterialUsage[]): Record<string, unknown>[] {
  return materials
    .filter((material) => material.weight_g != null)
    .map((material, index) => ({
      amsId: null,
      slotId: material.slot_id != null ? Number(material.slot_id) || index : index,
      filamentType: material.filament_type ?? null,
      filamentId: material.filament_id ?? null,
      targetColor: material.color ?? null,
      weight: material.weight_g,
      usageConfidence: material.confidence,
      toolheadId: material.toolhead_id ?? null,
      spoolId: material.spool_id ?? null,
      raw: material.raw ?? null,
    }));
}

function metadataString(record: NormalizedPrintRecord, key: string): string | null {
  const value = record.provider_metadata?.[key];
  if (value == null) return null;
  return String(value);
}

function metadataNumber(record: NormalizedPrintRecord, key: string): number | null {
  const value = record.provider_metadata?.[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function buildRawJson(record: NormalizedPrintRecord): string {
  return JSON.stringify({
    ...((record.raw && typeof record.raw === "object" && !Array.isArray(record.raw)
      ? record.raw
      : { raw: record.raw }) as Record<string, unknown>),
    provider: record.provider_id,
    providerTaskId: record.provider_record_id,
    providerPrinterId: record.provider_printer_id,
    title: record.title,
    status: record.status,
    startTime: record.started_at,
    endTime: record.ended_at,
    costTime: record.duration_s,
    weight: totalMaterialWeight(record.materials),
    deviceId: record.provider_printer_id,
    deviceName: record.printer?.name ?? null,
    deviceModel: record.printer?.model ?? null,
    amsDetailMapping: toAmsDetailMapping(record.materials),
    media: record.media,
    providerMetadata: record.provider_metadata ?? null,
  });
}

export function normalizedRecordToPrintTask(
  record: NormalizedPrintRecord,
  printerId: number | null = null,
): PrintTask {
  return {
    id: providerScopedId(record.provider_id, record.provider_record_id),
    provider: record.provider_id,
    provider_task_id: record.provider_record_id,
    provider_printer_id: record.provider_printer_id,
    printer_id: printerId,
    session_id: null,
    instanceId: metadataNumber(record, "instanceId"),
    plateIndex: metadataNumber(record, "plateIndex"),
    deviceId: record.provider_printer_id,
    deviceName: record.printer?.name ?? null,
    deviceModel: record.printer?.model ?? null,
    designId: metadataString(record, "designId"),
    designTitle: metadataString(record, "designTitle") ?? record.title,
    modelId: metadataString(record, "modelId"),
    profileId: metadataString(record, "profileId"),
    title: record.title,
    status: record.status,
    failedType: metadataNumber(record, "failedType"),
    bedType: metadataString(record, "bedType"),
    weight: totalMaterialWeight(record.materials),
    length: null,
    costTime: record.duration_s,
    startTime: record.started_at,
    endTime: record.ended_at,
    cover: firstMediaUrl(record, "cover"),
    thumbnail: firstMediaUrl(record, "thumbnail"),
    raw_json: buildRawJson(record),
  };
}
