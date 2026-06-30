export type MoonrakerHistoryJob = {
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

export type MoonrakerHistoryList = {
  count?: number;
  jobs?: MoonrakerHistoryJob[];
};

export type MoonrakerHistoryResponse = MoonrakerHistoryList & {
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
