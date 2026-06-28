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

type MoonrakerHistoryList = {
  count?: number;
  jobs?: MoonrakerHistoryJob[];
};

type MoonrakerHistoryResponse = MoonrakerHistoryList & {
  result?: MoonrakerHistoryList;
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

function splitMoonrakerList(value: string): string[] {
  return value
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => (typeof item === "string" ? splitMoonrakerList(item) : []));
  }
  const single = asString(value);
  return single ? splitMoonrakerList(single) : [];
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

function thumbnailArea(thumbnail: Record<string, unknown>): number {
  const width = asNumber(thumbnail["width"]) ?? 0;
  const height = asNumber(thumbnail["height"]) ?? 0;
  return width * height;
}

function firstThumbnail(metadata: Record<string, unknown>): string | null {
  const thumbnails = metadata["thumbnails"];
  if (!Array.isArray(thumbnails)) return null;

  const candidates = thumbnails
    .filter(
      (thumbnail): thumbnail is Record<string, unknown> =>
        !!thumbnail && typeof thumbnail === "object",
    )
    .map((thumbnail) => ({
      path: asString(thumbnail["relative_path"]) ?? asString(thumbnail["thumbnail_path"]),
      area: thumbnailArea(thumbnail),
    }))
    .filter((thumbnail): thumbnail is { path: string; area: number } => thumbnail.path != null);

  return candidates.sort((a, b) => b.area - a.area)[0]?.path ?? null;
}

function dirname(filename: string): string {
  const lastSlash = filename.lastIndexOf("/");
  return lastSlash === -1 ? "" : filename.slice(0, lastSlash);
}

function joinPosixPath(...parts: string[]): string {
  return parts
    .flatMap((part) => part.split("/"))
    .filter((part) => part.length > 0 && part !== ".")
    .join("/");
}

function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

function moonrakerFileUrl(
  baseUrl: string,
  filename: string | null | undefined,
  path: string,
): string {
  const thumbnailPath = path.startsWith("/")
    ? path.slice(1)
    : joinPosixPath(dirname(filename ?? ""), path);
  return `${baseUrl}/server/files/gcodes/${encodePath(thumbnailPath)}`;
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

function materialsFromJob(job: MoonrakerHistoryJob): NormalizedMaterialUsage[] {
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

function mediaFromJob(job: MoonrakerHistoryJob, baseUrl: string): NormalizedMediaAsset[] {
  const metadata = job.metadata ?? {};
  const thumbnail = firstThumbnail(metadata);
  return thumbnail
    ? [{ kind: "thumbnail", url: moonrakerFileUrl(baseUrl, job.filename, thumbnail) }]
    : [];
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
      const jobs = await this.fetchHistoryPage(start, pageLimit, options);
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

  async fetchHistoryPage(
    start = 0,
    limit = this.limit,
    options: Pick<HistorySyncOptions, "since" | "before"> = {},
  ): Promise<MoonrakerHistoryJob[]> {
    const params = new URLSearchParams({ start: String(start), limit: String(limit) });
    if (options.since) params.set("since", options.since);
    if (options.before) params.set("before", options.before);
    const response = await this.request<MoonrakerHistoryResponse>(
      `/server/history/list?${params.toString()}`,
    );

    if (response.error) {
      throw new Error(
        response.error.message ?? `Moonraker error ${response.error.code ?? "unknown"}`,
      );
    }

    return (response.result ?? response).jobs ?? [];
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
      media: mediaFromJob(job, this.baseUrl),
      raw: job,
      provider_metadata: {
        filename: job.filename ?? null,
        exists: job.exists ?? null,
        filament_used_mm: job.filament_used ?? null,
      },
    };
  }

  private printerIdentity(): PrinterIdentity {
    let host = this.baseUrl;
    let hostname = this.baseUrl;
    try {
      const url = new URL(this.baseUrl);
      host = url.host;
      hostname = url.hostname;
    } catch {
      // Fall back to the raw configured value for validation errors surfaced elsewhere.
    }

    return {
      provider_id: this.id,
      provider_printer_id: this.config.printerId ?? host,
      name: this.config.printerName ?? hostname,
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
