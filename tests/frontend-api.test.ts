import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "../frontend/components/toast.js";
import {
  addProjectJobsToBatch,
  calculatePriceQuote,
  composeAbortSignals,
  createBatch,
  createProduct,
  createProductFromJob,
  createProductFromProject,
  fetchBatch,
  fetchBatches,
  fetchJobDetails,
  fetchJson,
  fetchJsonOrToast,
  fetchJsonResult,
  fetchPrintNextProducts,
  fetchProduct,
  fetchProductImageCandidates,
  fetchProducts,
  fetchProjects,
  patchJsonOrToast,
  postJsonOrToast,
  refreshProductImages,
  savePriceQuoteToProduct,
  updateBatch,
  updateProduct,
} from "../frontend/lib/api.js";

vi.mock("../frontend/components/toast.js", () => ({ toast: vi.fn() }));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("frontend API transport", () => {
  beforeEach(() => {
    vi.mocked(toast).mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns JSON data and reports server-provided errors", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ value: 42 }))
      .mockResolvedValueOnce(jsonResponse({ error: "Invalid product" }, 400));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchJson<{ value: number }>("/ok", "Request failed")).resolves.toEqual({
      value: 42,
    });
    await expect(fetchJson("/bad", "Request failed")).rejects.toThrow("Invalid product");
  });

  it("uses the fallback for non-JSON errors and distinguishes network timeouts", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response("not json", { status: 500 }))
      .mockRejectedValueOnce(new Error("offline"))
      .mockRejectedValueOnce({ name: "TimeoutError" });
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchJson("/html-error", "Unable to load")).rejects.toThrow("Unable to load");
    await expect(fetchJson("/offline", "Unable to load")).rejects.toThrow(
      "Unable to load (network error)",
    );
    await expect(fetchJson("/slow", "Unable to load")).rejects.toThrow(
      "Unable to load (request timed out)",
    );
  });

  it("returns result objects and surfaces toast errors without throwing", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ ok: true }))
      .mockRejectedValueOnce("offline")
      .mockResolvedValueOnce(jsonResponse({ error: "No access" }, 403));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchJsonResult<{ ok: boolean }>("/ok", "Failed")).resolves.toEqual({
      data: { ok: true },
      error: null,
    });
    await expect(fetchJsonResult("/offline", "Failed")).resolves.toMatchObject({
      data: null,
      error: expect.objectContaining({ message: "Failed (network error)" }),
    });
    await expect(fetchJsonOrToast("/forbidden", "Failed")).resolves.toBeNull();
    expect(toast).toHaveBeenCalledWith("No access", "error");
  });

  it("constructs PATCH and POST JSON requests while preserving custom headers", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ patched: true }))
      .mockResolvedValueOnce(jsonResponse({ posted: true }));
    vi.stubGlobal("fetch", fetchMock);

    await patchJsonOrToast("/resource/1", { name: "Updated" }, "Patch failed");
    await postJsonOrToast("/resource", { name: "New" }, "Post failed", {
      timeoutMs: null,
      headers: { "X-Request-ID": "test-1" },
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/resource/1",
      expect.objectContaining({
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated" }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/resource", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Request-ID": "test-1" },
      body: JSON.stringify({ name: "New" }),
    });
  });
});

describe("frontend API endpoint contracts", () => {
  beforeEach(() => {
    vi.mocked(toast).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("posts the exact price quote payload and throws without transport-owned toasts", async () => {
    const input = {
      job_ids: [4, 9],
      sellable_units: 3,
      batch_labor_minutes: 12,
      per_unit_labor_minutes: 2.5,
      packaging_cost_per_unit: 0.75,
      extra_cost: 1.25,
      channel: "etsy" as const,
      target_margin_pct: 0.45,
    };
    const quote = { channel: "etsy", attempts: [{ job_id: 4 }] };
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ quote }))
      .mockResolvedValueOnce(jsonResponse({ error: "Cannot calculate quote" }, 422));
    vi.stubGlobal("fetch", fetchMock);

    const controller = new AbortController();
    await expect(calculatePriceQuote(input, controller.signal)).resolves.toEqual(quote);
    await expect(calculatePriceQuote(input, controller.signal)).rejects.toThrow(
      "Cannot calculate quote",
    );
    expect(toast).not.toHaveBeenCalled();

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/price-quotes/calculate",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/price-quotes/calculate",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    );
  });

  it("preserves caller abort identity for specialized quote/save requests", async () => {
    const calculateController = new AbortController();
    const saveController = new AbortController();
    const fetchMock = vi.fn<typeof fetch>().mockImplementation((_url, options) => {
      return new Promise<Response>((_resolve, reject) => {
        options?.signal?.addEventListener("abort", () => reject(options.signal?.reason), {
          once: true,
        });
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const calculation = calculatePriceQuote(
      {
        job_ids: [4],
        sellable_units: 1,
        batch_labor_minutes: 0,
        per_unit_labor_minutes: 0,
        packaging_cost_per_unit: 0,
        extra_cost: 0,
        channel: "direct",
      },
      calculateController.signal,
    );
    const saving = savePriceQuoteToProduct(
      {
        product_id: 2,
        job_ids: [4],
        sellable_units: 1,
        batch_labor_minutes: 0,
        per_unit_labor_minutes: 0,
        packaging_cost_per_unit: 0,
        extra_cost: 0,
      },
      saveController.signal,
    );
    calculateController.abort();
    saveController.abort(new DOMException("Modal dismissed", "AbortError"));

    await expect(calculation).rejects.toMatchObject({ name: "AbortError" });
    await expect(saving).rejects.toMatchObject({ name: "AbortError", message: "Modal dismissed" });
    expect(toast).not.toHaveBeenCalled();
  });

  it("returns candidate warnings with the candidate list", async () => {
    const payload = {
      candidates: [{ candidate_key: "cover" }],
      warnings: ["Cover scan was incomplete"],
    };
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(payload)));

    await expect(fetchProductImageCandidates(2)).resolves.toEqual(payload);
  });

  it("maps every exported domain helper to its expected URL and method", async () => {
    const product = { id: 2, name: "Widget" };
    const batch = { id: 3, product_id: 2, product_name: "Widget" };
    const project = { id: 1, name: "Project" };
    const responses = [
      { projects: [project] },
      { job: { id: 9 }, plates: [] },
      { products: [product] },
      { product },
      { products: [product] },
      { product },
      { product },
      { product },
      { product },
      { batches: [batch] },
      { batch },
      { batch },
      { batch },
      { batch },
    ];
    const fetchMock = vi.fn<typeof fetch>();
    for (const response of responses) fetchMock.mockResolvedValueOnce(jsonResponse(response));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchProjects()).resolves.toEqual([project]);
    await expect(fetchJobDetails(9)).resolves.toEqual({ job: { id: 9 }, plates: [] });
    await expect(fetchProducts()).resolves.toEqual([product]);
    await expect(fetchProduct(2)).resolves.toEqual(product);
    await expect(fetchPrintNextProducts()).resolves.toEqual([product]);
    await expect(createProduct({ name: "Widget" })).resolves.toEqual(product);
    await expect(createProductFromJob(9)).resolves.toEqual(product);
    await expect(createProductFromProject(1)).resolves.toEqual(product);
    await expect(updateProduct(2, { name: "Renamed" })).resolves.toEqual(product);
    await expect(fetchBatches()).resolves.toEqual([batch]);
    await expect(fetchBatch(3)).resolves.toEqual(batch);
    await expect(createBatch({ product_id: 2 })).resolves.toEqual(batch);
    await expect(updateBatch(3, { planned_quantity: 4 })).resolves.toEqual(batch);
    await expect(addProjectJobsToBatch(3, 1)).resolves.toEqual(batch);

    expect(fetchMock.mock.calls.map(([url, options]) => [url, options?.method ?? "GET"])).toEqual([
      ["/api/projects", "GET"],
      ["/jobs/9", "GET"],
      ["/api/products", "GET"],
      ["/api/products/2", "GET"],
      ["/api/products/print-next", "GET"],
      ["/api/products", "POST"],
      ["/api/products/from-job/9", "POST"],
      ["/api/products/from-project/1", "POST"],
      ["/api/products/2", "PATCH"],
      ["/api/batches", "GET"],
      ["/api/batches/3", "GET"],
      ["/api/batches", "POST"],
      ["/api/batches/3", "PATCH"],
      ["/api/batches/3/projects/1", "POST"],
    ]);
  });

  it("gives server-side image refresh enough time to finish its bounded operation", async () => {
    const payload = { product: { id: 2 }, candidates: [], warnings: [] };
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(payload));
    const timeoutSpy = vi.spyOn(AbortSignal, "timeout");
    vi.stubGlobal("fetch", fetchMock);

    await expect(refreshProductImages(2)).resolves.toEqual(payload);

    expect(timeoutSpy).toHaveBeenCalledWith(20_000);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/products/2/images/refresh",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      }),
    );
  });

  it("composes a caller abort signal with the image refresh timeout", async () => {
    const payload = { product: { id: 2 }, candidates: [], warnings: [] };
    const caller = new AbortController();
    const timeoutSignal = new AbortController().signal;
    const composedSignal = new AbortController().signal;
    const timeoutSpy = vi.spyOn(AbortSignal, "timeout").mockReturnValue(timeoutSignal);
    const anySpy = vi.spyOn(AbortSignal, "any").mockReturnValue(composedSignal);
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(payload));
    vi.stubGlobal("fetch", fetchMock);

    await expect(refreshProductImages(2, { signal: caller.signal })).resolves.toEqual(payload);

    expect(timeoutSpy).toHaveBeenCalledWith(20_000);
    expect(anySpy).toHaveBeenCalledWith([caller.signal, timeoutSignal]);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/products/2/images/refresh",
      expect.objectContaining({ signal: composedSignal }),
    );
  });

  it("propagates caller abort through the composed image refresh signal", async () => {
    const caller = new AbortController();
    const fetchMock = vi.fn<typeof fetch>().mockImplementation((_url, options) => {
      return new Promise<Response>((_resolve, reject) => {
        options?.signal?.addEventListener("abort", () => reject(options.signal?.reason), {
          once: true,
        });
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const refresh = refreshProductImages(2, { signal: caller.signal });
    caller.abort();

    await expect(refresh).rejects.toMatchObject({ name: "AbortError" });
    expect(fetchMock.mock.calls[0]?.[1]?.signal).not.toBe(caller.signal);
    expect(fetchMock.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
  });

  it("removes fallback abort listeners from every signal after the first abort", () => {
    const first = new AbortController();
    const second = new AbortController();
    const firstRemove = vi.spyOn(first.signal, "removeEventListener");
    const secondRemove = vi.spyOn(second.signal, "removeEventListener");

    const composed = composeAbortSignals([first.signal, second.signal], false);
    first.abort("cancelled");

    expect(composed.aborted).toBe(true);
    expect(composed.reason).toBe("cancelled");
    expect(firstRemove).toHaveBeenCalledWith("abort", expect.any(Function));
    expect(secondRemove).toHaveBeenCalledWith("abort", expect.any(Function));
  });

  it("returns null when create helpers cannot complete", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ error: "Rejected" }, 422)),
    );

    await expect(createProduct({ name: "Rejected" })).resolves.toBeNull();
    expect(toast).toHaveBeenCalledWith("Rejected", "error");
  });
});
