import { afterEach, describe, expect, it, vi } from "vitest";
import type { BambuApiTask } from "../lib/types.js";
import { BambuCloudProvider } from "../lib/providers/bambu/cloud.js";
import { bambuMultiMaterialPrint, bambuSingleSuccessfulPrint } from "./fixtures/bambu-history.js";

function bambuTask(id: number): BambuApiTask {
  return { ...bambuSingleSuccessfulPrint, id, title: `Task ${id}` };
}

describe("BambuCloudProvider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps Bambu tasks to normalized provider records", () => {
    const provider = new BambuCloudProvider({
      baseUrl: "https://api.example.test",
      token: "token",
      limit: 50,
    });

    const record = provider.toNormalizedRecord(bambuMultiMaterialPrint);

    expect(record).toMatchObject({
      provider_id: "bambu",
      provider_record_id: "2300",
      provider_printer_id: "bambu-p1s-001",
      title: "Fixture AMS Multi Material",
      status: "finish",
      duration_s: 3600,
      printer: {
        provider_id: "bambu",
        provider_printer_id: "bambu-p1s-001",
        name: "Shop P1S",
        model: "P1S",
      },
    });
    expect(record.materials).toHaveLength(2);
    expect(record.materials.map((material) => material.weight_g)).toEqual([40, 35]);
    expect(record.media.map((asset) => asset.kind)).toEqual(["cover", "thumbnail"]);
    expect(record.provider_metadata).toMatchObject({
      instanceId: 9001,
      plateIndex: 1,
      designId: "123456",
    });
  });

  it("continues pagination when Bambu returns fewer hits than requested before total", async () => {
    const firstPage = Array.from({ length: 20 }, (_, index) => bambuTask(1000 + index));
    const secondPage = Array.from({ length: 20 }, (_, index) => bambuTask(1020 + index));
    const thirdPage = Array.from({ length: 5 }, (_, index) => bambuTask(1040 + index));
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ total: 45, hits: firstPage }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ total: 45, hits: secondPage }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ total: 45, hits: thirdPage }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const provider = new BambuCloudProvider({
      baseUrl: "https://api.example.test",
      token: "token",
      limit: 1000,
    });

    const result = await provider.fetchHistory();

    expect(result.records).toHaveLength(45);
    const urls = fetchMock.mock.calls.map(([url]) => String(url));
    expect(urls[0]).toContain("limit=20");
    expect(urls[0]).not.toContain("offset=");
    expect(urls[1]).toContain("offset=20");
    expect(urls[2]).toContain("offset=40");
  });

  it("fetches one Bambu page and returns legacy PrintTask rows for existing sync", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ total: 1, hits: [bambuSingleSuccessfulPrint] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const provider = new BambuCloudProvider({
      baseUrl: "https://api.example.test",
      token: "token",
      limit: 50,
      deviceId: "bambu-p1s-001",
    });

    const page = await provider.fetchTaskPage(0);

    expect(page.apiTotal).toBe(1);
    expect(page.tasks).toHaveLength(1);
    expect(page.records).toHaveLength(1);
    expect(page.printTasks[0]).toMatchObject({
      id: "1000",
      provider: "bambu",
      provider_task_id: "1000",
      provider_printer_id: "bambu-p1s-001",
      deviceModel: "P1S",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        href: expect.stringContaining("limit=20") as unknown,
      }),
      expect.objectContaining({ headers: { Authorization: "Bearer token" } }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        href: expect.stringContaining("deviceId=bambu-p1s-001") as unknown,
      }),
      expect.objectContaining({ headers: { Authorization: "Bearer token" } }),
    );
  });
});
