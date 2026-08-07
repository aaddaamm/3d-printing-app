import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRunConfiguredProviderSync, MockConcurrentConfiguredProviderSyncError } = vi.hoisted(
  () => {
    class ConcurrentConfiguredProviderSyncError extends Error {}
    return {
      mockRunConfiguredProviderSync: vi.fn(),
      MockConcurrentConfiguredProviderSyncError: ConcurrentConfiguredProviderSyncError,
    };
  },
);

vi.mock("../lib/configured-provider-sync.js", () => ({
  ConcurrentConfiguredProviderSyncError: MockConcurrentConfiguredProviderSyncError,
  runConfiguredProviderSync: mockRunConfiguredProviderSync,
}));

import { sync } from "../routes/sync.js";

const syncResult = {
  providers: [{ id: "shop", inserted: 2, updated: 1 }],
  covers: { downloaded: 3, skipped: 4, expired: 5, failed: 6 },
};

describe("POST /api/sync", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns configured-provider sync counts", async () => {
    mockRunConfiguredProviderSync.mockResolvedValue(syncResult);

    const response = await sync.request("/", { method: "POST" });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(syncResult);
    expect(mockRunConfiguredProviderSync).toHaveBeenCalledOnce();
  });

  it("returns 409 while another sync holds the lock", async () => {
    mockRunConfiguredProviderSync.mockRejectedValue(
      new MockConcurrentConfiguredProviderSyncError("sync already running"),
    );

    const response = await sync.request("/", { method: "POST" });

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "A sync is already running." });
  });

  it("returns a sanitized failure response", async () => {
    mockRunConfiguredProviderSync.mockRejectedValue(
      new Error("BAMBU_TOKEN=very-secret-token provider unavailable"),
    );

    const response = await sync.request("/", { method: "POST" });

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Sync failed." });
  });
});
