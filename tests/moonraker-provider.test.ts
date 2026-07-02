import { afterEach, expect, it, vi } from "vitest";
import { normalizedRecordToPrintTask } from "../lib/providers/normalized-task.js";
import { MoonrakerHistoryProvider } from "../lib/providers/moonraker/history.js";
import { moonrakerHttpHistoryResponse } from "./fixtures/moonraker-history.js";

const LOCAL_PROTOCOL = "http";
const SNAPMAKER_HOST = "snapmaker-u1.local";
const VORON_HOST = "voron-2.local";
const SNAPMAKER_ORIGIN = `${LOCAL_PROTOCOL}://${SNAPMAKER_HOST}`;
const VORON_ORIGIN = `${LOCAL_PROTOCOL}://${VORON_HOST}`;

afterEach(() => {
  vi.unstubAllGlobals();
});

function parseRawJson(rawJson: string): Record<string, unknown> {
  try {
    return JSON.parse(rawJson) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function stubFetchJson(data: unknown) {
  const fetchMock = vi.fn(async () => Response.json(data));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function snapmakerProvider(): MoonrakerHistoryProvider {
  return new MoonrakerHistoryProvider({
    baseUrl: SNAPMAKER_ORIGIN,
    apiKey: "secret",
    printerName: "Snapmaker U1",
    printerModel: "U1",
  });
}

it("normalizes Moonraker history jobs into provider records for Snapmaker U1", async () => {
  const fetchMock = stubFetchJson({
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
  });

  const result = await snapmakerProvider().fetchHistory({ limit: 1 });

  expect(fetchMock).toHaveBeenCalledWith(
    `${SNAPMAKER_ORIGIN}/server/history/list?start=0&limit=1`,
    {
      headers: { Accept: "application/json", "X-Api-Key": "secret" },
      signal: expect.any(AbortSignal),
    },
  );
  expect(result.printers).toEqual([
    {
      provider_id: "moonraker",
      provider_printer_id: SNAPMAKER_HOST,
      name: "Snapmaker U1",
      model: "U1",
    },
  ]);
  expect(result.records[0]).toMatchObject({
    provider_id: "moonraker",
    provider_record_id: "000001",
    provider_printer_id: SNAPMAKER_HOST,
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
        url: `${SNAPMAKER_ORIGIN}/server/files/gcodes/.thumbs/customer-part.png`,
      },
    ],
  });
});

it("wraps network failures with the Moonraker URL", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      throw new TypeError("fetch failed", { cause: new Error("connection timed out") });
    }),
  );

  const provider = new MoonrakerHistoryProvider({ baseUrl: SNAPMAKER_ORIGIN });

  await expect(provider.fetchHistory({ limit: 1 })).rejects.toThrow(
    `Moonraker request failed for ${SNAPMAKER_ORIGIN}/server/history/list?start=0&limit=1: fetch failed (connection timed out)`,
  );
});

it("normalizes documented HTTP history responses with multi-tool material estimates", async () => {
  const fetchMock = stubFetchJson(moonrakerHttpHistoryResponse);
  const provider = new MoonrakerHistoryProvider({
    baseUrl: VORON_ORIGIN,
    printerName: "Voron 2.4",
    printerModel: "Voron 2.4 350",
  });

  const result = await provider.fetchHistory({ limit: 2, since: "1767000000" });

  expect(fetchMock).toHaveBeenCalledWith(
    `${VORON_ORIGIN}/server/history/list?start=0&limit=2&since=1767000000`,
    { headers: { Accept: "application/json" }, signal: expect.any(AbortSignal) },
  );
  expect(result.records[0]).toMatchObject({
    provider_record_id: "voron-000123",
    provider_printer_id: VORON_HOST,
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
        url: `${VORON_ORIGIN}/server/files/gcodes/printworks/.thumbs/customer-bracket-300x300.png`,
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
  const provider = new MoonrakerHistoryProvider({ baseUrl: SNAPMAKER_ORIGIN });
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
    provider_printer_id: SNAPMAKER_HOST,
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
