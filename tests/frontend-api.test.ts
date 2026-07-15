import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "../frontend/components/toast.js";
import {
  addProjectJobsToBatch,
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
  fetchProducts,
  fetchProjects,
  patchJsonOrToast,
  postJsonOrToast,
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
  afterEach(() => {
    vi.unstubAllGlobals();
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

  it("returns null when create helpers cannot complete", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ error: "Rejected" }, 422)),
    );

    await expect(createProduct({ name: "Rejected" })).resolves.toBeNull();
    expect(toast).toHaveBeenCalledWith("Rejected", "error");
  });
});
