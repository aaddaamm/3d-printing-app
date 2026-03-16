// ── API response shapes ───────────────────────────────────────────────────────

export interface BambuApiTask {
  id: number;
  instanceId: number | null;
  plateIndex: number | null;
  deviceId: string | null;
  deviceName: string | null;
  deviceModel: string | null;
  designId: number | null;
  designTitle: string | null;
  modelId: string | null;
  profileId: number | null;
  title: string | null;
  status: number | null;
  failedType: number | null;
  bedType: string | null;
  weight: number | null;
  length: number | null;
  costTime: number | null;
  startTime: string | null;
  endTime: string | null;
  cover: string | null;
  thumbnail: string | null;
  amsDetailMapping: AmsSlot[] | null;
  [key: string]: unknown;
}

export interface AmsSlot {
  amsId: number;
  slotId: number;
  filamentType: string;
  filamentId: string;
  targetColor: string;
  weight: number;
}

export interface BambuApiResponse {
  total: number;
  hits: BambuApiTask[];
}

// ── DB row shapes ─────────────────────────────────────────────────────────────

export interface PrintTask {
  id: string;
  session_id: string | null;
  instanceId: number | null;
  plateIndex: number | null;
  deviceId: string | null;
  deviceName: string | null;
  deviceModel: string | null;
  designId: string | null;
  designTitle: string | null;
  modelId: string | null;
  profileId: string | null;
  title: string | null;
  status: string | null;
  failedType: number | null;
  bedType: string | null;
  weight: number | null;
  length: number | null;
  costTime: number | null;
  startTime: string | null;
  endTime: string | null;
  cover: string | null;
  thumbnail: string | null;
  raw_json: string;
}

export interface Job {
  id: number;           // auto-increment PK, used in API URLs
  session_id: string;   // first task id in the session — stable upsert key
  instanceId: number | null;  // Bambu design id (repeats when same design printed multiple times)
  print_run: number;    // 1st, 2nd, 3rd time this design was printed on this device
  designId: string | null;
  designTitle: string | null;
  deviceId: string | null;
  deviceModel: string | null;
  startTime: string | null;
  endTime: string | null;
  total_weight_g: number | null;
  total_time_s: number | null;
  plate_count: number;
  status: string | null;
  customer: string | null;
  notes: string | null;
  price_override: number | null;
  status_override: string | null;
  project_id: number | null;
  extra_labor_minutes: number | null;
}

export interface Project {
  id: number;
  name: string;
  customer: string | null;
  notes: string | null;
  created_at: string;
  source_design_id: string | null;  // set when auto-created from a designId; null for manual projects
}

export interface JobFilament {
  id: number;
  task_id: string;
  instanceId: number | null;
  filament_type: string | null;
  filament_id: string | null;
  color: string | null;
  weight_g: number | null;
  ams_id: number | null;
  slot_id: number | null;
}

export interface MachineRate {
  device_model: string;
  purchase_price: number;
  lifetime_hrs: number;
  electricity_rate: number;
  maintenance_buffer: number;
  machine_rate_per_hr: number;
}

export interface MaterialRate {
  filament_type: string;
  cost_per_g: number;
  waste_buffer_pct: number;
  rate_per_g: number;
}

export interface LaborConfig {
  id: 1;
  hourly_rate: number;
  minimum_minutes: number;
  profit_markup_pct: number;
}

export interface SyncLog {
  id: number;
  started_at: string;
  ended_at: string | null;
  inserted: number | null;
  updated: number | null;
  error: string | null;
}

// ── Pricing ───────────────────────────────────────────────────────────────────

export interface PriceBreakdown {
  material_cost: number;
  machine_cost: number;
  labor_cost: number;
  extra_labor_cost: number;
  base_price: number;
  final_price: number;
  is_override: boolean;
}
