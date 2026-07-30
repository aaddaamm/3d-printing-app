import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockListProjects, mockLocalCoverExists } = vi.hoisted(() => ({
  mockListProjects: vi.fn(),
  mockLocalCoverExists: vi.fn(),
}));

vi.mock("../lib/db.js", () => ({
  db: { prepare: vi.fn() },
  stmts: { listProjects: { all: mockListProjects } },
}));

vi.mock("../lib/auto-group.js", () => ({
  autoGroupProjects: vi.fn(),
}));

vi.mock("../lib/price-cache.js", () => ({
  invalidateProjectPriceCache: vi.fn(),
}));

vi.mock("../lib/covers.js", () => ({
  localCoverExists: mockLocalCoverExists,
}));

vi.mock("../lib/media-urls.js", () => ({
  providerRemoteMediaUrl: vi.fn(() => null),
}));

import { listProjects } from "../models/projects-crud.js";

function projectRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: "Project",
    latest_cover_task_id: "123",
    latest_cover_provider: "bambu",
    latest_cover_provider_printer_id: null,
    latest_cover_title: "Project",
    latest_cover: "https://example.com/cover.png",
    latest_cover_thumbnail: null,
    ...overrides,
  };
}

describe("listProjects cover URLs", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockLocalCoverExists.mockReturnValue(false);
  });

  it("omits a Bambu cover URL when its local cache file is absent", () => {
    mockListProjects.mockReturnValue([projectRow()]);

    const projects = listProjects();

    expect(projects[0]?.cover_url).toBeNull();
  });
});
