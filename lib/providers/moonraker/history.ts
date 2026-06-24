import type {
  CanonicalPrintStatus,
  HistorySyncOptions,
  HistorySyncResult,
  NormalizedMaterialUsage,
  NormalizedMediaAsset,
  NormalizedPrintRecord,
  PrinterIdentity,
  PrintHistoryProvider,
  ProviderCapability,
} from "../types.js";

const MOONRAKER_PROVIDER_ID = "moonraker";

type MoonrakerHistoryJob = {
  job_id?: string | null;
  filename?: string | null;
  status?: string | null;
  start_time?: number | null;
  end_time?: number | null;
  print_duration?: number | null;
  total_duration?: number | null;
  filament_used?: number | null;
  metadata?: Record<string, unknown> | null;
  auxiliary_data?: unknown;
  exists?: boolean;
  [key: string]: unknown;
};

type MoonrakerHistoryResponse = {
  result?: {
    count?: number;
    jobs?: MoonrakerHistoryJob[];
  };
  error?: {
    code?: number;
    message?: string;
  };
};

export type MoonrakerProviderConfig = {
  baseUrl: string;
  apiKey?: string | undefined;
  printerId?: string | undefined;
  printerName?: string | undefined;
  printerModel?: string | undefined;
  limit?: number | undefined;
};

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  const single = asString(value);
  return single ? [single] : [];
}

function unixSecondsToIso(value: number | null | undefined): string | null {
  if (value == null || !Number.isFinite(value) || value <= 0) return null;
  const milliseconds = value > 10_000_000_000 ? value : value * 1000;
  return new Date(milliseconds).toISOString();
}

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

const METADATA_WEIGHT_KEYS = [
  "filament_weight_total",
  "filament_weight_g",
  "filament_weight",
  "filament_total_weight",
  "estimated_filament_weight_g",
];

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

function firstThumbnail(metadata: Record<string, unknown>): string | null {
  const thumbnails = metadata["thumbnails"];
  if (!Array.isArray(thumbnails)) return null;

  for (const thumbnail of thumbnails) {
    if (!thumbnail || typeof thumbnail !== "object") continue;
    const relativePath = asString((thumbnail as Record<string, unknown>)["relative_path"]);
    if (relativePath) return relativePath;
  }

  return null;
}

function materialsFromJob(job: MoonrakerHistoryJob): NormalizedMaterialUsage[] {
  const metadata = job.metadata ?? {};
  const weight = firstWeightFromMetadata(metadata);
  if (weight == null) return [];

  const filamentTypes = asStringArray(metadata["filament_type"]);
  const filamentColors = asStringArray(metadata["filament_colors"] ?? metadata["filament_colour"]);

  return [
    {
      weight_g: weight,
      filament_type: filamentTypes[0] ?? null,
      color: filamentColors[0] ?? null,
      confidence: "slicer_estimate",
      raw: {
        metadata,
        filament_used_mm: job.filament_used ?? null,
      },
    },
  ];
}

function mediaFromJob(job: MoonrakerHistoryJob): NormalizedMediaAsset[] {
  const metadata = job.metadata ?? {};
  const thumbnail = firstThumbnail(metadata);
  return thumbnail ? [{ kind: "thumbnail", url: thumbnail }] : [];
}

export class MoonrakerHistoryProvider implements PrintHistoryProvider {
  readonly id = MOONRAKER_PROVIDER_ID;
  readonly display_name = "Moonraker";
  readonly capabilities: ProviderCapability[] = [
    "history:list",
    "history:estimated_filament",
    "media:thumbnail",
    "printer:identity",
  ];

  private readonly baseUrl: string;
  private readonly limit: number;

  constructor(private readonly config: MoonrakerProviderConfig) {
    this.baseUrl = trimTrailingSlash(config.baseUrl);
    this.limit = config.limit ?? 50;
  }

  async listPrinters(): Promise<PrinterIdentity[]> {
    return [this.printerIdentity()];
  }

  async fetchHistory(options: HistorySyncOptions = {}): Promise<HistorySyncResult> {
    const maxRecords = options.limit ?? Number.POSITIVE_INFINITY;
    const records: NormalizedPrintRecord[] = [];
    let start = 0;

    while (records.length < maxRecords) {
      const pageLimit = Math.min(this.limit, maxRecords - records.length);
      const jobs = await this.fetchHistoryPage(start, pageLimit);
      if (jobs.length === 0) break;

      for (const job of jobs) {
        records.push(this.toNormalizedRecord(job));
        if (records.length >= maxRecords) break;
      }

      if (jobs.length < pageLimit) break;
      start += jobs.length;
    }

    return {
      provider_id: this.id,
      records,
      printers: [this.printerIdentity()],
      errors: [],
    };
  }

  async fetchHistoryPage(start = 0, limit = this.limit): Promise<MoonrakerHistoryJob[]> {
    const response = await this.request<MoonrakerHistoryResponse>(
      `/server/history/list?start=${encodeURIComponent(String(start))}&limit=${encodeURIComponent(String(limit))}`,
    );

    if (response.error) {
      throw new Error(
        response.error.message ?? `Moonraker error ${response.error.code ?? "unknown"}`,
      );
    }

    return response.result?.jobs ?? [];
  }

  toNormalizedRecord(job: MoonrakerHistoryJob): NormalizedPrintRecord {
    const recordId = job.job_id ?? job.filename;
    if (!recordId) throw new Error("Moonraker history job is missing job_id and filename");

    const duration = job.print_duration ?? job.total_duration ?? null;
    const title = job.filename ?? recordId;
    const printer = this.printerIdentity();

    return {
      provider_id: this.id,
      provider_record_id: recordId,
      provider_printer_id: printer.provider_printer_id,
      title,
      status: canonicalStatus(job.status),
      started_at: unixSecondsToIso(job.start_time),
      ended_at: unixSecondsToIso(job.end_time),
      duration_s: duration != null ? Math.round(duration) : null,
      printer,
      materials: materialsFromJob(job),
      media: mediaFromJob(job),
      raw: job,
      provider_metadata: {
        filename: job.filename ?? null,
        exists: job.exists ?? null,
        filament_used_mm: job.filament_used ?? null,
      },
    };
  }

  private printerIdentity(): PrinterIdentity {
    const url = new URL(this.baseUrl);
    return {
      provider_id: this.id,
      provider_printer_id: this.config.printerId ?? url.host,
      name: this.config.printerName ?? url.hostname,
      model: this.config.printerModel ?? "Snapmaker U1",
    };
  }

  private async request<T>(path: string): Promise<T> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (this.config.apiKey) headers["X-Api-Key"] = this.config.apiKey;

    const response = await fetch(`${this.baseUrl}${path}`, { headers });
    if (!response.ok)
      throw new Error(`Moonraker request failed: ${response.status} ${response.statusText}`);
    return (await response.json()) as T;
  }
}
