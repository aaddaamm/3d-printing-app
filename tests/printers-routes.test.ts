import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockListPrinters, mockGetPrinterById, mockPatchPrinter } = vi.hoisted(() => ({
  mockListPrinters: vi.fn(),
  mockGetPrinterById: vi.fn(),
  mockPatchPrinter: vi.fn(),
}));

vi.mock("../models/printers.js", () => ({
  listPrinters: mockListPrinters,
  getPrinterById: mockGetPrinterById,
  patchPrinter: mockPatchPrinter,
}));

import { printers } from "../routes/printers.js";

const printerRow = {
  id: 1,
  provider: "bambu",
  provider_display_name: "Bambu Lab",
  provider_printer_id: "a1-mini",
  name: "A1 Mini",
  model: "A1 mini",
  serial: null,
  is_active: 1,
  retired_at: null,
  notes: null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
  job_count: 10,
  task_count: 12,
  total_time_s: 3600,
  total_weight_g: 120,
  first_print_at: "2026-01-01T00:00:00.000Z",
  last_print_at: "2026-01-02T00:00:00.000Z",
};

async function patch(path: string, body: unknown): Promise<Response> {
  return printers.request(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("printers routes", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockListPrinters.mockReturnValue([printerRow]);
    mockGetPrinterById.mockReturnValue(printerRow);
    mockPatchPrinter.mockReturnValue({ ...printerRow, is_active: 0 });
  });

  it("lists printer inventory including retired printers by default", async () => {
    const res = await printers.request("/");
    expect(res.status).toBe(200);
    expect(mockListPrinters).toHaveBeenCalledWith({ includeRetired: true });
    await expect(res.json()).resolves.toMatchObject({ count: 1, printers: [printerRow] });
  });

  it("can exclude retired printers", async () => {
    const res = await printers.request("/?include_retired=0");
    expect(res.status).toBe(200);
    expect(mockListPrinters).toHaveBeenCalledWith({ includeRetired: false });
  });

  it("accepts active lifecycle updates", async () => {
    const res = await patch("/1", { is_active: false, notes: "Sold" });
    expect(res.status).toBe(200);
    expect(mockPatchPrinter).toHaveBeenCalledWith(1, { is_active: false, notes: "Sold" });
  });

  it("rejects non-boolean active values", async () => {
    const res = await patch("/1", { is_active: 0 });
    expect(res.status).toBe(400);
    expect(mockPatchPrinter).not.toHaveBeenCalled();
  });

  it("rejects unknown fields", async () => {
    const res = await patch("/1", { active: false });
    expect(res.status).toBe(400);
    expect(mockPatchPrinter).not.toHaveBeenCalled();
  });
});
