import type { BambuApiTask, PrintTask } from "./types.js";

// Bambu status codes — verified against elapsed-vs-estimated-time analysis:
//   2 = finish  (~101% elapsed on avg — ran to completion)
//   3 = cancel  (~37% elapsed on avg — stopped early)
//   4 = running (0% elapsed — currently printing when synced)
const STATUS_MAP: Record<number, string> = {
  1: "created",
  2: "finish",
  3: "cancel",
  4: "running",
  5: "failed",
  6: "pause",
};

function toNullableString(value: unknown): string | null {
  return value != null ? String(value) : null;
}

function toNullableNumber(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

function toStatus(status: unknown): string | null {
  if (typeof status !== "number") return null;
  return STATUS_MAP[status] ?? String(status);
}

export function normalizeTask(t: BambuApiTask): PrintTask {
  return {
    id: String(t.id),
    session_id: null, // assigned later by normalize step
    instanceId: t.instanceId ?? null,
    plateIndex: t.plateIndex ?? null,
    deviceId: t.deviceId ?? null,
    deviceName: t.deviceName ?? null,
    deviceModel: t.deviceModel ?? null,
    designId: toNullableString(t.designId),
    designTitle: t.designTitle ?? null,
    modelId: t.modelId ?? null,
    profileId: toNullableString(t.profileId),
    title: t.title ?? null,
    status: toStatus(t.status),
    failedType: t.failedType ?? null,
    bedType: t.bedType ?? null,
    weight: toNullableNumber(t.weight),
    length: toNullableNumber(t.length),
    costTime: toNullableNumber(t.costTime),
    startTime: t.startTime ?? null,
    endTime: t.endTime ?? null,
    cover: t.cover ?? null,
    thumbnail: t.thumbnail ?? null,
    raw_json: JSON.stringify(t),
  };
}
