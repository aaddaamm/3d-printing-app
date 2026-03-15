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

export function normalizeTask(t: BambuApiTask): PrintTask {
  const statusCode = typeof t.status === "number" ? t.status : null;
  return {
    id: String(t.id),
    session_id: null, // assigned later by normalize step
    instanceId: t.instanceId ?? null,
    plateIndex: t.plateIndex ?? null,
    deviceId: t.deviceId ?? null,
    deviceName: t.deviceName ?? null,
    deviceModel: t.deviceModel ?? null,
    designId: t.designId != null ? String(t.designId) : null,
    designTitle: t.designTitle ?? null,
    modelId: t.modelId ?? null,
    profileId: t.profileId != null ? String(t.profileId) : null,
    title: t.title ?? null,
    status: statusCode != null ? (STATUS_MAP[statusCode] ?? String(statusCode)) : null,
    failedType: t.failedType ?? null,
    bedType: t.bedType ?? null,
    weight: typeof t.weight === "number" ? t.weight : null,
    length: typeof t.length === "number" ? t.length : null,
    costTime: typeof t.costTime === "number" ? t.costTime : null,
    startTime: t.startTime ?? null,
    endTime: t.endTime ?? null,
    cover: t.cover ?? null,
    thumbnail: t.thumbnail ?? null,
    raw_json: JSON.stringify(t),
  };
}
