import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockAddBatchJob,
  mockCreateBatch,
  mockDeleteBatchJob,
  mockGetBatch,
  mockListBatches,
  mockUpdateBatch,
  MockBatchValidationError,
} = vi.hoisted(() => {
  class BatchValidationError extends Error {}
  return {
    mockAddBatchJob: vi.fn(),
    mockCreateBatch: vi.fn(),
    mockDeleteBatchJob: vi.fn(),
    mockGetBatch: vi.fn(),
    mockListBatches: vi.fn(),
    mockUpdateBatch: vi.fn(),
    MockBatchValidationError: BatchValidationError,
  };
});

vi.mock("../models/batches.js", () => ({
  BatchValidationError: MockBatchValidationError,
  addBatchJob: mockAddBatchJob,
  createBatch: mockCreateBatch,
  deleteBatchJob: mockDeleteBatchJob,
  getBatch: mockGetBatch,
  listBatches: mockListBatches,
  updateBatch: mockUpdateBatch,
}));

import { batches } from "../routes/batches.js";

const sampleBatch = {
  id: 1,
  product_id: 2,
  product_name: "Controller Stand",
  pricing_profile_id: "booth",
  pricing_profile_label: "Booth",
  planned_quantity: 10,
  completed_quantity: 5,
  failed_quantity: 1,
  material_type: "PLA",
  primary_color: "#ffffff",
  total_filament_g: 120,
  total_print_time_s: 3600,
  unit_cost: 2.5,
  suggested_price: 5.99,
  estimated_margin_pct: 0.5,
  notes: null,
};

function apiApp(): Hono {
  const app = new Hono();
  app.route("/api/batches", batches);
  return app;
}

describe("batch routes", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockListBatches.mockReturnValue([sampleBatch]);
    mockGetBatch.mockReturnValue(sampleBatch);
    mockCreateBatch.mockReturnValue(sampleBatch);
    mockUpdateBatch.mockReturnValue({ ...sampleBatch, completed_quantity: 6 });
    mockAddBatchJob.mockReturnValue(sampleBatch);
    mockDeleteBatchJob.mockReturnValue(sampleBatch);
  });

  it("lists and gets batches", async () => {
    const listRes = await apiApp().request("/api/batches");
    expect(listRes.status).toBe(200);
    expect(await listRes.json()).toEqual({ batches: [sampleBatch] });

    const getRes = await apiApp().request("/api/batches/1");
    expect(getRes.status).toBe(200);
    expect(await getRes.json()).toEqual({ batch: sampleBatch });
  });

  it("creates a batch", async () => {
    const body = { product_id: 2, pricing_profile_id: "booth", planned_quantity: 10 };

    const res = await apiApp().request("/api/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    expect(res.status).toBe(201);
    expect(mockCreateBatch).toHaveBeenCalledWith(body);
    expect(await res.json()).toEqual({ batch: sampleBatch });
  });

  it("patches a batch", async () => {
    const res = await apiApp().request("/api/batches/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed_quantity: 6 }),
    });

    expect(res.status).toBe(200);
    expect(mockUpdateBatch).toHaveBeenCalledWith(1, { completed_quantity: 6 });
    expect(await res.json()).toEqual({ batch: { ...sampleBatch, completed_quantity: 6 } });
  });

  it("links and unlinks jobs", async () => {
    const addRes = await apiApp().request("/api/batches/1/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_id: 9 }),
    });
    expect(addRes.status).toBe(200);
    expect(mockAddBatchJob).toHaveBeenCalledWith(1, 9);

    const deleteRes = await apiApp().request("/api/batches/1/jobs/9", { method: "DELETE" });
    expect(deleteRes.status).toBe(200);
    expect(mockDeleteBatchJob).toHaveBeenCalledWith(1, 9);
  });

  it("returns 400 for unknown product and pricing profile ids", async () => {
    mockCreateBatch.mockImplementationOnce(() => {
      throw new MockBatchValidationError("Unknown product_id: 999");
    });
    const productRes = await apiApp().request("/api/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: 999, pricing_profile_id: "booth" }),
    });
    expect(productRes.status).toBe(400);
    expect(await productRes.json()).toEqual({ error: "Unknown product_id: 999" });

    mockCreateBatch.mockImplementationOnce(() => {
      throw new MockBatchValidationError("Unknown pricing_profile_id: missing");
    });
    const profileRes = await apiApp().request("/api/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: 2, pricing_profile_id: "missing" }),
    });
    expect(profileRes.status).toBe(400);
    expect(await profileRes.json()).toEqual({ error: "Unknown pricing_profile_id: missing" });
  });

  it("rejects unknown fields before calling the model", async () => {
    const res = await apiApp().request("/api/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: 2, pricing_profile_id: "booth", extra: true }),
    });

    expect(res.status).toBe(400);
    expect(mockCreateBatch).not.toHaveBeenCalled();
  });
});
