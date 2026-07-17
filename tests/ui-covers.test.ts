import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockDbPrepare, mockLocalCoverExists } = vi.hoisted(() => ({
  mockDbPrepare: vi.fn(),
  mockLocalCoverExists: vi.fn(),
}));

vi.mock("../lib/db.js", () => ({
  db: { prepare: mockDbPrepare },
}));

vi.mock("../lib/covers.js", () => ({
  localCoverExists: mockLocalCoverExists,
}));

import { listUiJobs } from "../models/ui.js";

function uiJobRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    session_id: "s1",
    instanceId: 1,
    print_run: 1,
    designTitle: "Thing",
    deviceModel: "P1S",
    startTime: null,
    endTime: null,
    total_weight_g: 1,
    total_time_s: 1,
    plate_count: 1,
    status: "finish",
    status_override: null,
    customer: null,
    notes: null,
    price_override: null,
    extra_labor_minutes: null,
    project_id: null,
    printer_id: null,
    first_task_id: "123",
    first_task_provider: "bambu",
    first_task_provider_printer_id: null,
    first_task_title: "Thing",
    first_task_cover: "https://example.com/cover.png",
    first_task_thumbnail: null,
    filament_colors_json: null,
    material_usage_confidence: null,
    ...overrides,
  };
}

describe("listUiJobs cover URLs", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockDbPrepare.mockReturnValue({ all: vi.fn(() => []) });
    mockLocalCoverExists.mockReturnValue(false);
  });

  it("returns the local cover route for Bambu tasks with a stored cover even before the file is cached", () => {
    mockDbPrepare.mockReturnValue({ all: vi.fn(() => [uiJobRow()]) });

    const jobs = listUiJobs();

    expect(jobs).toHaveLength(1);
    expect(jobs[0]?.cover_url).toBe("/ui/covers/123");
  });

  it("keeps Moonraker media URLs remote because they are served from the printer", () => {
    mockDbPrepare.mockReturnValue({
      all: vi.fn(() => [
        uiJobRow({
          first_task_id: "moonraker:000001",
          first_task_provider: "moonraker",
          first_task_provider_printer_id: "printer.local",
          first_task_title: "folder/part.gcode",
          first_task_cover: "thumbs/part.png",
        }),
      ]),
    });

    const jobs = listUiJobs();

    expect(jobs).toHaveLength(1);
    expect(jobs[0]?.cover_url).toBe(
      "http://printer.local/server/files/gcodes/folder/thumbs/part.png",
    );
  });
});
