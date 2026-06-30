export type Job = {
  id: number;
  designTitle?: string;
  customer?: string | null;
  status?: string;
  deviceModel?: string;
  startTime?: string;
  total_weight_g?: number | null;
  total_time_s?: number | null;
  final_price?: number | null;
  plate_count?: number | null;
  print_run?: number;
  cover_url?: string | null;
  filament_colors?: string[];
  material_usage_confidence?: string | null;
};

export type DeviceSummary = {
  deviceModel?: string | null;
  total_jobs?: number;
  total_plates?: number | null;
  total_time_s?: number | null;
};

export type Summary = {
  totals?: Record<string, number> | null;
  by_device?: DeviceSummary[];
} | null;

export type PrinterInventory = {
  id: number;
  provider: string;
  provider_display_name?: string | null;
  provider_printer_id: string;
  name?: string | null;
  model?: string | null;
  is_active: number;
  retired_at?: string | null;
  job_count: number;
  task_count: number;
  total_time_s?: number | null;
  total_weight_g?: number | null;
  first_print_at?: string | null;
  last_print_at?: string | null;
};

export type DataRange = { min_start?: string; max_start?: string; task_count?: number } | null;
