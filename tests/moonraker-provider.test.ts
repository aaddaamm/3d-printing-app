import { afterEach, describe, expect, it, vi } from "vitest";
import { normalizedRecordToPrintTask } from "../lib/providers/normalized-task.js";
import { MoonrakerHistoryProvider } from "../lib/providers/moonraker/history.js";
import { moonrakerHttpHistoryResponse } from "./fixtures/moonraker-history.js";

function parseRawJson(rawJson: string): Record<string, unknown> {
  try {
    return JSON.parse(rawJson) as Record<string, unknown>;
  } catch {
    return {};
  }
}

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
      media: [
        {
          kind: "thumbnail",
          url: "http://snapmaker-u1.local/server/files/gcodes/.thumbs/customer-part.png",
        },
      ],
    });
  });

  it("normalizes documented HTTP history responses with multi-tool material estimates", async () => {
    const fetchMock = vi.fn(async () => Response.json(moonrakerHttpHistoryResponse));
    vi.stubGlobal("fetch", fetchMock);

    const provider = new MoonrakerHistoryProvider({
      baseUrl: "http://voron-2.local",
      printerName: "Voron 2.4",
      printerModel: "Voron 2.4 350",
    });

    const result = await provider.fetchHistory({ limit: 2, since: "1767000000" });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://voron-2.local/server/history/list?start=0&limit=2&since=1767000000",
      { headers: { Accept: "application/json" } },
    );
    expect(result.records[0]).toMatchObject({
      provider_record_id: "voron-000123",
      provider_printer_id: "voron-2.local",
      title: "printworks/customer-bracket_0.2mm_PLA_Voron2_3h14m.gcode",
      status: "finish",
      duration_s: 10980,
      materials: [
        {
          weight_g: 20.25,
          filament_type: "PLA",
          filament_id: "Polymaker PLA Black",
          color: "#1f1f1f",
          toolhead_id: "0",
          confidence: "slicer_estimate",
        },
        {
          weight_g: 7.5,
          filament_type: "PETG",
          filament_id: "Generic PETG Clear",
          color: "#eeeeee",
          toolhead_id: "1",
          confidence: "slicer_estimate",
        },
      ],
      media: [
        {
          kind: "thumbnail",
          url: "http://voron-2.local/server/files/gcodes/printworks/.thumbs/customer-bracket-300x300.png",
        },
      ],
    });
    expect(result.records[1]).toMatchObject({
      provider_record_id: "voron-000124",
      status: "failed",
      materials: [{ weight_g: 4.2, filament_type: "ABS" }],
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
    const raw = parseRawJson(task.raw_json);

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
