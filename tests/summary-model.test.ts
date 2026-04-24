import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockDbPrepare } = vi.hoisted(() => ({
  mockDbPrepare: vi.fn(),
}));

vi.mock("../lib/db.js", () => ({
  db: { prepare: mockDbPrepare },
}));

import { getSummary } from "../models/summary.js";

describe("getSummary", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns zero totals for an empty dataset", () => {
    mockDbPrepare.mockReturnValue({ all: vi.fn(() => []) });

    expect(getSummary()).toEqual({
      totals: { total_jobs: 0, total_plates: 0, total_weight_g: 0, total_time_s: 0 },
      by_device: [],
    });
  });

  it("treats null aggregate values as zero", () => {
    mockDbPrepare.mockReturnValue({
      all: vi.fn(() => [
        {
          deviceModel: "A1 mini",
          total_jobs: 2,
          total_plates: null,
          total_weight_g: null,
          total_time_s: null,
        },
      ]),
    });

    expect(getSummary().totals).toEqual({
      total_jobs: 2,
      total_plates: 0,
      total_weight_g: 0,
      total_time_s: 0,
    });
  });
});
