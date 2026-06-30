import type {
  HistorySyncOptions,
  HistorySyncResult,
  NormalizedPrintRecord,
  PrinterIdentity,
  PrintHistoryProvider,
  ProviderCapability,
} from "../types.js";
import { normalizeMoonrakerJob } from "./normalize.js";
import type {
  MoonrakerHistoryJob,
  MoonrakerHistoryResponse,
  MoonrakerProviderConfig,
} from "./types.js";
import { trimTrailingSlash } from "./utils.js";

export type { MoonrakerProviderConfig } from "./types.js";

const MOONRAKER_PROVIDER_ID = "moonraker";

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
    return normalizeMoonrakerJob(job, this.id, this.printerIdentity(), this.baseUrl);
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
