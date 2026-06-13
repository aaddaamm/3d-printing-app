export type ProviderCapability =
  | "history:list"
  | "history:actual_filament"
  | "history:estimated_filament"
  | "media:thumbnail"
  | "printer:identity"
  | "status:poll";

export type CanonicalPrintStatus =
  | "created"
  | "running"
  | "pause"
  | "finish"
  | "cancel"
  | "failed"
  | "unknown";

export type MaterialUsageConfidence = "actual" | "slicer_estimate" | "manual" | "unknown";

export type NormalizedMediaAsset = {
  kind: "cover" | "thumbnail" | "other";
  url?: string | null;
  local_path?: string | null;
  content_type?: string | null;
  provider_asset_id?: string | null;
};

export type ProviderDefinition = {
  id: string;
  display_name: string;
  capabilities: ProviderCapability[];
};

export type PrinterIdentity = {
  provider_id: string;
  provider_printer_id: string;
  name?: string | null;
  model?: string | null;
  serial?: string | null;
};

export type NormalizedMaterialUsage = {
  weight_g: number | null;
  filament_type?: string | null;
  filament_id?: string | null;
  color?: string | null;
  toolhead_id?: string | null;
  spool_id?: string | null;
  slot_id?: string | null;
  confidence: MaterialUsageConfidence;
  raw?: unknown;
};

export type NormalizedPrintRecord = {
  provider_id: string;
  provider_record_id: string;
  provider_printer_id: string | null;
  title: string | null;
  status: CanonicalPrintStatus;
  started_at: string | null;
  ended_at: string | null;
  duration_s: number | null;
  printer: PrinterIdentity | null;
  materials: NormalizedMaterialUsage[];
  media: NormalizedMediaAsset[];
  raw: unknown;
  provider_metadata?: Record<string, unknown>;
};

export type HistorySyncOptions = {
  since?: string;
  before?: string;
  limit?: number;
  printer_id?: string;
};

export type HistorySyncResult = {
  provider_id: string;
  records: NormalizedPrintRecord[];
  printers: PrinterIdentity[];
  errors: ProviderSyncError[];
};

export type ProviderSyncError = {
  provider_id: string;
  printer_id?: string | null;
  code: string;
  message: string;
  retryable: boolean;
};

export type PrintHistoryProvider = ProviderDefinition & {
  listPrinters(): Promise<PrinterIdentity[]>;
  fetchHistory(options?: HistorySyncOptions): Promise<HistorySyncResult>;
};
