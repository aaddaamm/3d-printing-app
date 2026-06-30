import type { CanonicalPrintStatus, NormalizedPrintRecord, PrinterIdentity } from "../types.js";
import { materialsFromJob } from "./materials.js";
import { mediaFromJob } from "./media.js";
import type { MoonrakerHistoryJob } from "./types.js";
import { unixSecondsToIso } from "./utils.js";

const MOONRAKER_STATUS_MAP: Record<string, CanonicalPrintStatus> = {
  completed: "finish",
  complete: "finish",
  finished: "finish",
  finish: "finish",
  cancelled: "cancel",
  canceled: "cancel",
  cancel: "cancel",
  error: "failed",
  failed: "failed",
  failure: "failed",
  klippy_shutdown: "failed",
  klippy_disconnect: "failed",
  interrupted: "failed",
  in_progress: "running",
  printing: "running",
  running: "running",
  paused: "pause",
  pause: "pause",
};

function canonicalStatus(status: string | null | undefined): CanonicalPrintStatus {
  const s = status?.toLowerCase();
  return s ? (MOONRAKER_STATUS_MAP[s] ?? "unknown") : "unknown";
}

export function normalizeMoonrakerJob(
  job: MoonrakerHistoryJob,
  providerId: string,
  printer: PrinterIdentity,
  baseUrl: string,
): NormalizedPrintRecord {
  const recordId = job.job_id ?? job.filename;
  if (!recordId) throw new Error("Moonraker history job is missing job_id and filename");

  const duration = job.print_duration ?? job.total_duration ?? null;
  const title = job.filename ?? recordId;

  return {
    provider_id: providerId,
    provider_record_id: recordId,
    provider_printer_id: printer.provider_printer_id,
    title,
    status: canonicalStatus(job.status),
    started_at: unixSecondsToIso(job.start_time),
    ended_at: unixSecondsToIso(job.end_time),
    duration_s: duration != null ? Math.round(duration) : null,
    printer,
    materials: materialsFromJob(job),
    media: mediaFromJob(job, baseUrl),
    raw: job,
    provider_metadata: {
      filename: job.filename ?? null,
      exists: job.exists ?? null,
      filament_used_mm: job.filament_used ?? null,
    },
  };
}
