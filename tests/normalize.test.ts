import { describe, it, expect } from "vitest";
import { normalizeTask } from "../lib/normalize.js";
import type { BambuApiTask } from "../lib/types.js";

function makeTask(overrides: Partial<BambuApiTask> = {}): BambuApiTask {
  return {
    id: 12345,
    instanceId: null,
    plateIndex: null,
    deviceId: null,
    deviceName: null,
    deviceModel: null,
    designId: null,
    designTitle: null,
    modelId: null,
    profileId: null,
    title: null,
    status: null,
    failedType: null,
    bedType: null,
    weight: null,
    length: null,
    costTime: null,
    startTime: null,
    endTime: null,
    cover: null,
    thumbnail: null,
    amsDetailMapping: null,
    ...overrides,
  };
}

describe("normalizeTask", () => {
  it("converts numeric id to string", () => {
    const result = normalizeTask(makeTask({ id: 42 }));
    expect(result.id).toBe("42");
  });

  it("maps known status codes to strings", () => {
    expect(normalizeTask(makeTask({ status: 1 })).status).toBe("created");
    expect(normalizeTask(makeTask({ status: 2 })).status).toBe("finish");
    expect(normalizeTask(makeTask({ status: 3 })).status).toBe("cancel");
    expect(normalizeTask(makeTask({ status: 4 })).status).toBe("running");
    expect(normalizeTask(makeTask({ status: 5 })).status).toBe("failed");
    expect(normalizeTask(makeTask({ status: 6 })).status).toBe("pause");
  });

  it("falls back to string for unknown status codes", () => {
    expect(normalizeTask(makeTask({ status: 99 })).status).toBe("99");
  });

  it("maps null status to null", () => {
    expect(normalizeTask(makeTask({ status: null })).status).toBeNull();
  });

  it("converts numeric designId and profileId to strings", () => {
    const result = normalizeTask(makeTask({ designId: 999, profileId: 1234 }));
    expect(result.designId).toBe("999");
    expect(result.profileId).toBe("1234");
  });

  it("propagates null for missing fields", () => {
    const result = normalizeTask(makeTask());
    expect(result.instanceId).toBeNull();
    expect(result.deviceId).toBeNull();
    expect(result.weight).toBeNull();
    expect(result.costTime).toBeNull();
  });

  it("passes numeric weight and costTime through", () => {
    const result = normalizeTask(makeTask({ weight: 42.5, costTime: 3600 }));
    expect(result.weight).toBe(42.5);
    expect(result.costTime).toBe(3600);
  });

  it("stores raw_json as JSON string of the original task", () => {
    const task = makeTask({ id: 1, title: "My Print" });
    const result = normalizeTask(task);
    const parsed = JSON.parse(result.raw_json) as BambuApiTask;
    expect(parsed.id).toBe(1);
    expect(parsed.title).toBe("My Print");
  });
});
