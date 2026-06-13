import { describe, expect, it } from "vitest";
import type {
  NormalizedPrintRecord,
  PrintHistoryProvider,
  ProviderCapability,
} from "../lib/providers/types.js";

const moonrakerCapabilities: ProviderCapability[] = [
  "history:list",
  "history:actual_filament",
  "media:thumbnail",
  "printer:identity",
];

describe("provider history contract", () => {
  it("represents a history/pricing print record without Bambu-only fields", () => {
    const record: NormalizedPrintRecord = {
      provider_id: "moonraker",
      provider_record_id: "job-000001",
      provider_printer_id: "snapmaker-u1.local",
      title: "customer-part.gcode",
      status: "finish",
      started_at: "2026-02-01T10:00:00.000Z",
      ended_at: "2026-02-01T12:00:00.000Z",
      duration_s: 7200,
      printer: {
        provider_id: "moonraker",
        provider_printer_id: "snapmaker-u1.local",
        name: "Snapmaker U1",
        model: "U1",
      },
      materials: [
        {
          weight_g: 82.4,
          filament_type: "PLA",
          color: "#222222",
          confidence: "actual",
        },
      ],
      media: [
        {
          kind: "thumbnail",
          url: "http://snapmaker-u1.local/server/files/gcodes/.thumbs/customer-part.png",
          content_type: "image/png",
        },
      ],
      raw: { job_id: "000001" },
    };

    expect(record.materials[0]?.weight_g).toBe(82.4);
    expect(record.printer?.model).toBe("U1");
    expect(record.provider_metadata).toBeUndefined();
  });

  it("keeps provider capabilities explicit and history-focused", async () => {
    const provider: PrintHistoryProvider = {
      id: "moonraker",
      display_name: "Moonraker",
      capabilities: moonrakerCapabilities,
      async listPrinters() {
        return [
          {
            provider_id: "moonraker",
            provider_printer_id: "snapmaker-u1.local",
            name: "Snapmaker U1",
          },
        ];
      },
      async fetchHistory() {
        return {
          provider_id: "moonraker",
          records: [],
          printers: await this.listPrinters(),
          errors: [],
        };
      },
    };

    expect(provider.capabilities).toContain("history:list");
    expect(provider.capabilities).not.toContain("status:poll");
    await expect(provider.fetchHistory()).resolves.toMatchObject({ provider_id: "moonraker" });
  });
});
