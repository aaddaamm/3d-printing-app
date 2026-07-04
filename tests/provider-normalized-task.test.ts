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

it("maps Bambu provider metadata onto legacy task columns", () => {
  const task = normalizedRecordToPrintTask({
    ...record("bambu"),
    provider_metadata: {
      instanceId: 123,
      plateIndex: 2,
      designId: "456",
      designTitle: "Design Name",
      modelId: "model-1",
      profileId: "profile-1",
      failedType: 0,
      bedType: "supertack_plate",
    },
  });

  expect(task).toMatchObject({
    instanceId: 123,
    plateIndex: 2,
    designId: "456",
    designTitle: "Design Name",
    modelId: "model-1",
    profileId: "profile-1",
    failedType: 0,
    bedType: "supertack_plate",
  });
});
