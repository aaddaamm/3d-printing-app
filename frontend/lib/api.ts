import { toast } from "../components/toast.js";
import { FETCH_TIMEOUT_MS } from "./constants.js";

type JsonRecord = Record<string, unknown>;

type RequestOptions = (RequestInit & { timeoutMs?: number | null }) | undefined;

export type SellabilityLevel = "green" | "yellow" | "red";

export type ProductSummary = {
  id: number;
  name: string;
  category_id: string | null;
  category_label: string | null;
  status_id: string;
  status_label: string;
  source_id: string | null;
  source_label: string | null;
  license_id: string | null;
  license_label: string | null;
  main_photo_path: string | null;
  target_sale_price: number | null;
  restock_priority: string;
  model_url: string | null;
  etsy_listing_url: string | null;
  default_material: string | null;
  primary_color: string | null;
  accent_color: string | null;
  preferred_printer_id: number | null;
  estimated_print_time_s: number | null;
  estimated_filament_g: number | null;
  booth_price: number | null;
  etsy_price: number | null;
  packaging_cost: number | null;
  handling_minutes: number | null;
  target_margin_pct: number | null;
  pricing_notes: string | null;
  notes: string | null;
  can_sell_level: SellabilityLevel;
  can_sell_label: string;
  ready_to_list: boolean;
};

export type ProductInput = Partial<{
  name: string;
  description: string | null;
  category_id: string | null;
  status_id: string;
  source_id: string | null;
  license_id: string | null;
  model_url: string | null;
  main_file_id: number | null;
  main_photo_id: number | null;
  etsy_listing_url: string | null;
  default_material: string | null;
  primary_color: string | null;
  accent_color: string | null;
  preferred_printer_id: number | null;
  estimated_print_time_s: number | null;
  estimated_filament_g: number | null;
  target_sale_price: number | null;
  booth_price: number | null;
  etsy_price: number | null;
  packaging_cost: number | null;
  handling_minutes: number | null;
  target_margin_pct: number | null;
  pricing_notes: string | null;
  notes: string | null;
  is_original_design: boolean;
  restock_priority: string | null;
}>;

export type PricingProfileOption = {
  id: "personal" | "booth" | "etsy" | "custom";
  label: string;
};

export const PRICING_PROFILE_OPTIONS: readonly PricingProfileOption[] = [
  { id: "personal", label: "Personal" },
  { id: "booth", label: "Booth" },
  { id: "etsy", label: "Etsy" },
  { id: "custom", label: "Custom" },
] as const;

export type BatchSummary = {
  id: number;
  product_id: number;
  product_name: string;
  pricing_profile_id: string;
  pricing_profile_label: string;
  planned_quantity: number;
  completed_quantity: number;
  failed_quantity: number;
  material_type: string | null;
  primary_color: string | null;
  total_filament_g: number | null;
  total_print_time_s: number | null;
  setup_minutes?: number | null;
  handling_minutes_per_unit?: number | null;
  packaging_cost_per_unit?: number | null;
  unit_cost: number | null;
  suggested_price: number | null;
  estimated_margin_pct: number | null;
  fixed_fee_per_order: number | null;
  notes: string | null;
};

export type BatchInput = Partial<{
  product_id: number;
  pricing_profile_id: string;
  planned_quantity: number;
  completed_quantity: number;
  failed_quantity: number;
  material_type: string | null;
  primary_color: string | null;
  printer_id: number | null;
  total_filament_g: number | null;
  total_print_time_s: number | null;
  setup_minutes: number | null;
  handling_minutes_per_unit: number | null;
  packaging_cost_per_unit: number | null;
  target_margin_pct: number | null;
  platform_fee_pct: number | null;
  notes: string | null;
}>;

export type ProjectSummary = {
  id: number;
  name: string;
  customer?: string | null;
  notes?: string | null;
  job_count?: number;
  total_weight_g?: number | null;
  total_time_s?: number | null;
  product_id?: number | null;
};

export type JobPlateSummary = {
  id: string;
  plateIndex: number | null;
  title: string | null;
  status: string | null;
  weight: number | null;
  costTime: number | null;
  startTime: string | null;
  endTime: string | null;
};

export type JobDetailResponse = {
  job: { id: number };
  plates: JobPlateSummary[];
};

type ProductsResponse = { products: ProductSummary[] };
type ProductResponse = { product: ProductSummary };
type ProjectsResponse = { projects: ProjectSummary[] };
type BatchesResponse = { batches: BatchSummary[] };
type BatchResponse = { batch: BatchSummary };

async function errorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = (await res.json()) as JsonRecord;
    return typeof data.error === "string" ? data.error : fallback;
  } catch {
    return fallback;
  }
}

function requestOptions(options: RequestOptions): RequestInit {
  const { timeoutMs = FETCH_TIMEOUT_MS, ...requestInit } = options ?? {};
  if (requestInit.signal || timeoutMs === null) return requestInit;
  return { signal: AbortSignal.timeout(timeoutMs), ...requestInit };
}

function toRequestError(err: unknown, fallback: string): Error {
  if ((err as { name?: string } | null)?.name === "TimeoutError") {
    return new Error(`${fallback} (request timed out)`);
  }
  return new Error(`${fallback} (network error)`);
}

export async function fetchJson<T = JsonRecord>(
  url: string,
  fallback: string,
  options?: RequestInit,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, requestOptions(options));
  } catch (err) {
    throw toRequestError(err, fallback);
  }
  if (!res.ok) throw new Error(await errorMessage(res, fallback));
  return (await res.json()) as T;
}

export async function fetchJsonResult<T = JsonRecord>(
  url: string,
  fallback: string,
  options?: RequestInit,
): Promise<{ data: T | null; error: Error | null }> {
  try {
    return { data: await fetchJson<T>(url, fallback, options), error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(fallback) };
  }
}

export async function fetchJsonOrToast<T = JsonRecord>(
  url: string,
  fallback: string,
  options?: RequestInit,
): Promise<T | null> {
  const { data, error } = await fetchJsonResult<T>(url, fallback, options);
  if (error) {
    toast(error.message || fallback, "error");
    return null;
  }
  return data;
}

export async function patchJsonOrToast<T = JsonRecord>(
  url: string,
  payload: unknown,
  fallback: string,
): Promise<T | null> {
  return fetchJsonOrToast<T>(url, fallback, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function postJsonOrToast<T = JsonRecord>(
  url: string,
  payload: unknown,
  fallback: string,
  options?: RequestOptions,
): Promise<T | null> {
  return fetchJsonOrToast<T>(url, fallback, {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(payload),
  });
}

export async function fetchProjects(): Promise<ProjectSummary[]> {
  const data = await fetchJson<ProjectsResponse>("/api/projects", "Failed to load projects.");
  return data.projects;
}

export async function fetchJobDetails(jobId: number): Promise<JobDetailResponse> {
  return fetchJson<JobDetailResponse>(`/jobs/${jobId}`, "Failed to load job details.");
}

export async function fetchProducts(): Promise<ProductSummary[]> {
  const data = await fetchJson<ProductsResponse>("/api/products", "Failed to load products.");
  return data.products;
}

export async function fetchProduct(id: number): Promise<ProductSummary> {
  const data = await fetchJson<ProductResponse>(`/api/products/${id}`, "Failed to load product.");
  return data.product;
}

export async function fetchPrintNextProducts(): Promise<ProductSummary[]> {
  const data = await fetchJson<ProductsResponse>(
    "/api/products/print-next",
    "Failed to load print-next products.",
  );
  return data.products;
}

export async function createProduct(input: ProductInput): Promise<ProductSummary | null> {
  const data = await postJsonOrToast<ProductResponse>(
    "/api/products",
    input,
    "Failed to create product.",
  );
  return data?.product ?? null;
}

export async function createProductFromJob(jobId: number): Promise<ProductSummary | null> {
  const data = await postJsonOrToast<ProductResponse>(
    `/api/products/from-job/${jobId}`,
    {},
    "Failed to create product from job.",
  );
  return data?.product ?? null;
}

export async function createProductFromProject(projectId: number): Promise<ProductSummary | null> {
  const data = await postJsonOrToast<ProductResponse>(
    `/api/products/from-project/${projectId}`,
    {},
    "Failed to create product from project.",
  );
  return data?.product ?? null;
}

export async function updateProduct(
  id: number,
  input: ProductInput,
): Promise<ProductSummary | null> {
  const data = await patchJsonOrToast<ProductResponse>(
    `/api/products/${id}`,
    input,
    "Failed to update product.",
  );
  return data?.product ?? null;
}

export async function fetchBatches(): Promise<BatchSummary[]> {
  const data = await fetchJson<BatchesResponse>("/api/batches", "Failed to load batches.");
  return data.batches;
}

export async function fetchBatch(id: number): Promise<BatchSummary> {
  const data = await fetchJson<BatchResponse>(`/api/batches/${id}`, "Failed to load batch.");
  return data.batch;
}

export async function createBatch(input: BatchInput): Promise<BatchSummary | null> {
  const data = await postJsonOrToast<BatchResponse>(
    "/api/batches",
    input,
    "Failed to create batch.",
  );
  return data?.batch ?? null;
}

export async function updateBatch(id: number, input: BatchInput): Promise<BatchSummary | null> {
  const data = await patchJsonOrToast<BatchResponse>(
    `/api/batches/${id}`,
    input,
    "Failed to update batch.",
  );
  return data?.batch ?? null;
}

export async function addProjectJobsToBatch(
  batchId: number,
  projectId: number,
): Promise<BatchSummary | null> {
  const data = await postJsonOrToast<BatchResponse>(
    `/api/batches/${batchId}/projects/${projectId}`,
    {},
    "Failed to add project jobs to batch.",
  );
  return data?.batch ?? null;
}
