import { toast } from "../components/toast.js";
import { FETCH_TIMEOUT_MS } from "./constants.js";

type JsonRecord = Record<string, unknown>;

type RequestOptions = (RequestInit & { timeoutMs?: number | null }) | undefined;

export type SellabilityLevel = "green" | "yellow" | "red";

export type ProductImageSourceType =
  | "manual_upload"
  | "source_hero"
  | "catalog_preview"
  | "contact_sheet"
  | "print_cover"
  | "placeholder";

export type ProductImageCandidate = {
  candidate_key: string;
  source_type: ProductImageSourceType;
  photo_id: number | null;
  url: string | null;
  label: string;
  priority: number;
  available: boolean;
  warning: string | null;
};

export type ProductImageSelectionInput =
  { mode: "auto" } | { mode: "manual"; candidate_key: string };

export type ProductSummary = {
  id: number;
  name: string;
  designer: string | null;
  category_id: string | null;
  category_label: string | null;
  status_id: string;
  status_label: string;
  source_id: string | null;
  source_label: string | null;
  license_id: string | null;
  license_label: string | null;
  main_photo_id: number | null;
  main_photo_path: string | null;
  main_photo_source_type: ProductImageSourceType | null;
  image_selection_mode: "auto" | "manual";
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
  sales_companion_visible: boolean;
  can_sell_level: SellabilityLevel;
  can_sell_label: string;
  ready_to_list: boolean;
};

export type ProductInput = Partial<{
  name: string;
  description: string | null;
  designer: string | null;
  category_id: string | null;
  status_id: string;
  source_id: string | null;
  license_id: string | null;
  model_url: string | null;
  main_file_id: number | null;
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
  sales_companion_visible: boolean;
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

export type PriceQuoteRequest = {
  job_ids: number[];
  sellable_units: number;
  batch_labor_minutes: number;
  per_unit_labor_minutes: number;
  packaging_cost_per_unit: number;
  extra_cost: number;
  channel: "direct" | "etsy";
  target_margin_pct?: number;
};

export type PriceQuoteMaterialContribution = {
  job_id: number;
  task_id: string;
  filament_row_id: number | null;
  ams_id: number | null;
  slot_id: number | null;
  recorded_material_type: string | null;
  resolved_material_type: string;
  weight_g: number;
  material_rate_per_kg: number;
  material_cost: number;
  used_material_fallback: boolean;
};

export type PriceQuoteMachineContribution = {
  job_id: number;
  task_id: string;
  duration_seconds: number;
  printer: string;
  machine_rate_per_hr: number;
  machine_cost: number;
  used_machine_fallback: boolean;
};

export type PriceQuoteResult = {
  channel: "direct" | "etsy";
  assumptions: {
    labor_hourly_rate: number;
    target_margin_pct: number;
    platform_fee_pct: number;
    fixed_fee_per_order: number;
    failure_buffer_pct: number;
    overhead_buffer_pct: number;
    material_contributions: PriceQuoteMaterialContribution[];
    machine_contributions: PriceQuoteMachineContribution[];
  };
  attempts: Array<{
    job_id: number;
    title: string;
    status: string;
    printer: string;
    material_cost: number;
    machine_cost: number;
    production_loss_cost: number;
  }>;
  warnings: string[];
  breakdown: {
    sellableUnits: number;
    materialCost: number;
    machineCost: number;
    productionLossCost: number;
    batchLaborCost: number;
    perUnitLaborCost: number;
    packagingCost: number;
    extraCost: number;
    subtotalCost: number;
    bufferCost: number;
    totalCost: number;
    unitCost: number;
    minimumViablePrice: number;
    suggestedPrice: number;
    profitPerUnit: number;
    profitPerBatch: number;
    estimatedMarginPct: number;
  };
};

export type SaveProductPricingRequest = {
  job_ids: number[];
  sellable_units: number;
  batch_labor_minutes: number;
  per_unit_labor_minutes: number;
  packaging_cost_per_unit: number;
  extra_cost: number;
  target_margin_pct?: number;
  product_id?: number;
  new_product?: {
    name: string;
    designer?: string | null;
    source_id?: string | null;
    license_id?: string | null;
    model_url?: string | null;
    notes?: string | null;
  };
  notes?: string | null;
};

export type LegacyPriceQuoteRateAssumption = {
  job_id: number;
  task_id: string;
  material_type: string;
  material_rate_per_kg: number;
  printer: string;
  machine_rate_per_hr: number;
  used_material_fallback: boolean;
  used_machine_fallback: boolean;
};

export type LegacyPriceQuoteResult = Omit<PriceQuoteResult, "assumptions"> & {
  assumptions: Omit<
    PriceQuoteResult["assumptions"],
    "material_contributions" | "machine_contributions"
  > & {
    resolved_rates: LegacyPriceQuoteRateAssumption[];
  };
};

export type SavedPriceSnapshot = {
  id: number;
  batch_id: number;
  channel: "direct" | "etsy";
  provenance: "current";
  snapshot_version: 2;
  created_at: string;
  quote: PriceQuoteResult;
};

export type LegacySavedPriceSnapshot = {
  id: number;
  batch_id: number;
  channel: "direct" | "etsy";
  provenance: "legacy_v1";
  snapshot_version: 1;
  created_at: string;
  quote: LegacyPriceQuoteResult;
};

export type SavedProductPricing = {
  product: ProductSummary;
  batch_id: number;
  snapshots: { direct: SavedPriceSnapshot; etsy: SavedPriceSnapshot };
};

type SavedProductPricingBatchBase = {
  batch_id: number;
  created_at: string;
  sellable_units: number;
  job_ids: number[];
  notes: string | null;
};

export type SavedProductPricingBatch =
  | (SavedProductPricingBatchBase & {
      provenance: "current";
      snapshots: { direct: SavedPriceSnapshot; etsy: SavedPriceSnapshot };
    })
  | (SavedProductPricingBatchBase & {
      provenance: "legacy_v1";
      snapshots: { direct: LegacySavedPriceSnapshot; etsy: LegacySavedPriceSnapshot };
    });

export type SalesCompanionProduct = {
  id: number;
  name: string;
  identification_image_url: string | null;
  unit_cost: number;
  production_loss_cost: number;
  direct_price: number;
  direct_margin_pct: number;
  etsy_price: number;
  etsy_margin_pct: number;
  priced_at: string;
};

export type SavedProductPricingResponse = {
  saved: SavedProductPricing;
  image_warnings: string[];
};

type ProductsResponse = { products: ProductSummary[] };
type SalesCompanionProductsResponse = { products: SalesCompanionProduct[] };
type PriceQuoteResponse = { quote: PriceQuoteResult };
type ProductResponse = { product: ProductSummary };
export type ProductImageCandidatesResponse = {
  candidates: ProductImageCandidate[];
  warnings: string[];
};
export type ProductImageUploadPhoto = {
  id: number;
  product_id: number;
  source_type: "manual_upload";
  source_ref: string | null;
  candidate_key: string;
  content_type: string;
  width: number;
  height: number;
  is_app_owned: boolean;
  url: string;
};
export type ProductImageUploadResponse = {
  product: ProductSummary;
  photo: ProductImageUploadPhoto;
};
export type ProductImagesRefreshResponse = {
  product: ProductSummary;
  candidates: ProductImageCandidate[];
  warnings: string[];
};
type ProductPricingHistoryResponse = { history: SavedProductPricingBatch[] };
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

export function composeAbortSignals(signals: AbortSignal[], useNativeAny = true): AbortSignal {
  const abortSignalWithAny = AbortSignal as typeof AbortSignal & {
    any?: (signals: AbortSignal[]) => AbortSignal;
  };
  if (useNativeAny && typeof abortSignalWithAny.any === "function") {
    return abortSignalWithAny.any(signals);
  }

  const controller = new AbortController();
  const listeners = new Map<AbortSignal, () => void>();
  const cleanup = () => {
    for (const [signal, listener] of listeners) {
      signal.removeEventListener("abort", listener);
    }
    listeners.clear();
  };
  const abortFrom = (signal: AbortSignal) => {
    if (controller.signal.aborted) return;
    cleanup();
    controller.abort(signal.reason);
  };
  for (const signal of signals) {
    if (signal.aborted) {
      abortFrom(signal);
      return controller.signal;
    }
    const listener = () => abortFrom(signal);
    listeners.set(signal, listener);
    signal.addEventListener("abort", listener, { once: true });
  }
  return controller.signal;
}

function requestOptions(options: RequestOptions): RequestInit {
  const { timeoutMs = FETCH_TIMEOUT_MS, ...requestInit } = options ?? {};
  if (timeoutMs === null) return requestInit;

  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const signal = requestInit.signal
    ? composeAbortSignals([requestInit.signal, timeoutSignal])
    : timeoutSignal;
  return { ...requestInit, signal };
}

function toRequestError(err: unknown, fallback: string, signal?: AbortSignal | null): Error {
  const reason = signal?.aborted ? signal.reason : err;
  if ((reason as { name?: string } | null)?.name === "TimeoutError") {
    return new Error(`${fallback} (request timed out)`);
  }
  if (signal?.aborted || (err as { name?: string } | null)?.name === "AbortError") {
    if (reason instanceof Error) return reason;
    return new DOMException(
      typeof reason === "string" ? reason : "The operation was aborted.",
      "AbortError",
    );
  }
  return new Error(`${fallback} (network error)`);
}

export async function fetchJson<T = JsonRecord>(
  url: string,
  fallback: string,
  options?: RequestOptions,
): Promise<T> {
  let res: Response;
  const resolvedOptions = requestOptions(options);
  try {
    res = await fetch(url, resolvedOptions);
  } catch (err) {
    throw toRequestError(err, fallback, resolvedOptions.signal);
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

export async function calculatePriceQuote(
  input: PriceQuoteRequest,
  signal?: AbortSignal,
): Promise<PriceQuoteResult> {
  const data = await fetchJson<PriceQuoteResponse>(
    "/api/price-quotes/calculate",
    "Failed to calculate price quote.",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      ...(signal ? { signal } : {}),
    },
  );
  return data.quote;
}

export async function savePriceQuoteToProduct(
  input: SaveProductPricingRequest,
  signal?: AbortSignal,
): Promise<SavedProductPricingResponse> {
  return fetchJson<SavedProductPricingResponse>(
    "/api/price-quotes/save-to-product",
    "Failed to save product pricing.",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      ...(signal ? { signal } : {}),
    },
  );
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

export async function fetchSalesCompanionProducts(): Promise<SalesCompanionProduct[]> {
  const data = await fetchJson<SalesCompanionProductsResponse>(
    "/api/products/sales-companion",
    "Failed to load Sales Companion products.",
  );
  return data.products;
}

export async function fetchProduct(id: number, options?: RequestInit): Promise<ProductSummary> {
  const data = await fetchJson<ProductResponse>(
    `/api/products/${id}`,
    "Failed to load product.",
    options,
  );
  return data.product;
}

export async function fetchProductImageCandidates(
  productId: number,
  options?: RequestInit,
): Promise<ProductImageCandidatesResponse> {
  return fetchJson<ProductImageCandidatesResponse>(
    `/api/products/${productId}/image-candidates`,
    "Failed to load product image candidates.",
    options,
  );
}

export function refreshProductImages(
  productId: number,
  options?: RequestInit,
): Promise<ProductImagesRefreshResponse> {
  return fetchJson<ProductImagesRefreshResponse>(
    `/api/products/${productId}/images/refresh`,
    "Failed to refresh product images.",
    {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json", ...options?.headers },
      body: "{}",
      timeoutMs: 20_000,
    },
  );
}

export async function setProductImageSelection(
  productId: number,
  input: ProductImageSelectionInput,
  options?: RequestInit,
): Promise<ProductSummary> {
  const data = await fetchJson<ProductResponse>(
    `/api/products/${productId}/image-selection`,
    "Failed to update product image selection.",
    {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json", ...options?.headers },
      body: JSON.stringify(input),
    },
  );
  return data.product;
}

export function selectProductImage(
  productId: number,
  candidateKey: string,
  options?: RequestInit,
): Promise<ProductSummary> {
  return setProductImageSelection(
    productId,
    {
      mode: "manual",
      candidate_key: candidateKey,
    },
    options,
  );
}

export function returnProductImageToAuto(
  productId: number,
  options?: RequestInit,
): Promise<ProductSummary> {
  return setProductImageSelection(productId, { mode: "auto" }, options);
}

export function uploadProductImage(
  productId: number,
  photo: File,
  options?: RequestInit,
): Promise<ProductImageUploadResponse> {
  const body = new FormData();
  body.append("photo", photo);
  return fetchJson<ProductImageUploadResponse>(
    `/api/products/${productId}/photos`,
    "Failed to upload product photo.",
    { ...options, method: "POST", body },
  );
}

export async function fetchProductPricingHistory(
  productId: number,
): Promise<SavedProductPricingBatch[]> {
  const data = await fetchJson<ProductPricingHistoryResponse>(
    `/api/products/${productId}/pricing-history`,
    "Failed to load product pricing history.",
  );
  return data.history;
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
