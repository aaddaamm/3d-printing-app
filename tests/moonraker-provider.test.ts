import { afterEach, describe, expect, it, vi } from "vitest";
import { normalizedRecordToPrintTask } from "../lib/providers/normalized-task.js";
import { MoonrakerHistoryProvider } from "../lib/providers/moonraker/history.js";

describe("MoonrakerHistoryProvider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("normalizes Moonraker history jobs into provider records for Snapmaker U1", async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({
        result: {
          count: 1,
          jobs: [
            {
              job_id: "000001",
              filename: "customer-part.gcode",
              status: "completed",
              start_time: 1_767_260_400,
              end_time: 1_767_267_600,
              print_duration: 7200.4,
              filament_used: 2844.2,
              metadata: {
                filament_weight_total: 82.35,
                filament_type: ["PLA"],
                filament_colors: ["#222222"],
                thumbnails: [{ relative_path: ".thumbs/customer-part.png" }],
              },
            },
          ],
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const provider = new MoonrakerHistoryProvider({
      baseUrl: "http://snapmaker-u1.local",
      apiKey: "secret",
      printerName: "Snapmaker U1",
      printerModel: "U1",
    });

    const result = await provider.fetchHistory({ limit: 1 });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://snapmaker-u1.local/server/history/list?start=0&limit=1",
      { headers: { Accept: "application/json", "X-Api-Key": "secret" } },
    );
    expect(result.printers).toEqual([
      {
        provider_id: "moonraker",
        provider_printer_id: "snapmaker-u1.local",
        name: "Snapmaker U1",
        model: "U1",
      },
    ]);
    expect(result.records[0]).toMatchObject({
      provider_id: "moonraker",
      provider_record_id: "000001",
      provider_printer_id: "snapmaker-u1.local",
      title: "customer-part.gcode",
      status: "finish",
      duration_s: 7200,
      materials: [
        {
          weight_g: 82.35,
          filament_type: "PLA",
          color: "#222222",
          confidence: "slicer_estimate",
        },
      ],
      media: [{ kind: "thumbnail", url: ".thumbs/customer-part.png" }],
    });
  });

  it("converts normalized Moonraker records into print_tasks rows used by normalization", () => {
    const provider = new MoonrakerHistoryProvider({ baseUrl: "http://snapmaker-u1.local" });
    const record = provider.toNormalizedRecord({
      job_id: "000002",
      filename: "shop-jig.gcode",
      status: "cancelled",
      total_duration: 1800,
      metadata: { filament_weight_total: "12.5 g", filament_type: "PETG" },
    });

    const task = normalizedRecordToPrintTask(record, 123);
    const raw = JSON.parse(task.raw_json) as Record<string, unknown>;

    expect(task).toMatchObject({
      id: "moonraker:000002",
      provider: "moonraker",
      provider_task_id: "000002",
      provider_printer_id: "snapmaker-u1.local",
      printer_id: 123,
      status: "cancel",
      weight: 12.5,
      costTime: 1800,
      deviceModel: "Snapmaker U1",
    });
    expect(raw["amsDetailMapping"]).toEqual([
      expect.objectContaining({ filamentType: "PETG", weight: 12.5 }),
    ]);
  });
});
