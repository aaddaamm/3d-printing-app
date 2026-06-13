import { describe, expect, it } from "vitest";
import { normalizeTask } from "../lib/normalize.js";
import { deriveJobStatus, detectSessions, type RawTask } from "../lib/session-detection.js";
import type { BambuApiTask } from "../lib/types.js";
import {
  bambuMixedStatusSession,
  bambuMultiMaterialPrint,
  bambuMultiPlateSession,
  bambuRepeatedPlateStartsNewSession,
  bambuSingleSuccessfulPrint,
} from "./fixtures/bambu-history.js";

function toRawTask(task: BambuApiTask): RawTask {
  const normalized = normalizeTask(task);
  return {
    id: normalized.id,
    status: normalized.status,
    startTime: normalized.startTime,
    endTime: normalized.endTime,
    instanceId: normalized.instanceId,
    plateIndex: normalized.plateIndex,
    deviceId: normalized.deviceId,
    raw_json: normalized.raw_json,
  };
}

describe("Bambu regression fixtures", () => {
  it("normalizes a single successful print without losing pricing inputs or media", () => {
    const normalized = normalizeTask(bambuSingleSuccessfulPrint);

    expect(normalized).toMatchObject({
      id: "1000",
      instanceId: 9001,
      plateIndex: 1,
      deviceId: "bambu-p1s-001",
      deviceModel: "P1S",
      designId: "123456",
      profileId: "555",
      title: "Fixture Widget_plate_1",
      status: "finish",
      weight: 42.5,
      costTime: 3600,
      cover: "https://example.test/cover.png",
      thumbnail: "https://example.test/thumb.png",
    });
  });

  it("keeps Bambu multi-plate jobs in one detected session", () => {
    const sessions = detectSessions(bambuMultiPlateSession.map(toRawTask));

    expect(sessions.get("2000")).toBe("2000");
    expect(sessions.get("2001")).toBe("2000");
  });

  it("starts a new Bambu session when a nearby task repeats a plate index", () => {
    const sessions = detectSessions(bambuRepeatedPlateStartsNewSession.map(toRawTask));

    expect(sessions.get("2100")).toBe("2100");
    expect(sessions.get("2101")).toBe("2101");
  });

  it("preserves current worst-status-wins job status behavior", () => {
    const statuses = bambuMixedStatusSession.map((task) => normalizeTask(task).status ?? "");

    expect(deriveJobStatus(statuses)).toBe("cancel");
  });

  it("stores AMS/multi-material payloads in raw_json for future provider extraction", () => {
    const normalized = normalizeTask(bambuMultiMaterialPrint);
    const raw = JSON.parse(normalized.raw_json) as BambuApiTask;

    expect(raw.amsDetailMapping).toHaveLength(2);
    expect(raw.amsDetailMapping?.map((slot) => slot.filamentType)).toEqual(["PLA", "PETG"]);
    expect(raw.amsDetailMapping?.reduce((sum, slot) => sum + slot.weight, 0)).toBe(75);
  });
});
