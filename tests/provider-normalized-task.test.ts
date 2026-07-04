import { expect, it } from "vitest";
import { normalizedRecordToPrintTask } from "../lib/providers/normalized-task.js";
import type { NormalizedPrintRecord } from "../lib/providers/types.js";

function record(providerId: string): NormalizedPrintRecord {
  return {
    provider_id: providerId,
    provider_record_id: "1000",
    provider_printer_id: "printer-1",
    title: "Test Print",
    status: "finish",
    started_at: null,
    ended_at: null,
    duration_s: null,
    printer: null,
    materials: [],
    media: [],
    raw: {},
  };
}

it("preserves legacy Bambu task ids when storing provider records", () => {
  const task = normalizedRecordToPrintTask(record("bambu"));

  expect(task.id).toBe("1000");
  expect(task.provider_task_id).toBe("1000");
});

it("scopes non-Bambu task ids by provider", () => {
  const task = normalizedRecordToPrintTask(record("moonraker"));

  expect(task.id).toBe("moonraker:1000");
  expect(task.provider_task_id).toBe("1000");
});
