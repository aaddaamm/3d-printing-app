import { describe, it, expect } from "vitest";
import { deriveJobStatus, detectSessions } from "../lib/session-detection.js";
import type { RawTask } from "../lib/session-detection.js";

// ── deriveJobStatus ───────────────────────────────────────────────────────────

describe("deriveJobStatus", () => {
  it("returns finish for empty array (reduce seed)", () => {
    expect(deriveJobStatus([])).toBe("finish");
  });

  it("returns the single status when given one entry", () => {
    expect(deriveJobStatus(["cancel"])).toBe("cancel");
    expect(deriveJobStatus(["finish"])).toBe("finish");
  });

  it("worst status wins — failed beats all others", () => {
    expect(deriveJobStatus(["finish", "failed", "cancel"])).toBe("failed");
    expect(deriveJobStatus(["running", "failed"])).toBe("failed");
  });

  it("cancel beats finish, running, pause", () => {
    expect(deriveJobStatus(["finish", "cancel"])).toBe("cancel");
    expect(deriveJobStatus(["running", "pause", "cancel"])).toBe("cancel");
  });

  it("pause beats finish and running", () => {
    expect(deriveJobStatus(["finish", "running", "pause"])).toBe("pause");
  });

  it("running beats finish", () => {
    expect(deriveJobStatus(["finish", "running"])).toBe("running");
  });

  it("all identical statuses returns that status", () => {
    expect(deriveJobStatus(["finish", "finish", "finish"])).toBe("finish");
    expect(deriveJobStatus(["failed", "failed"])).toBe("failed");
  });

  it("unknown status has fallback priority 1 (same as running)", () => {
    // Unknown priority = 1, finish priority = 0 — unknown wins over finish
    const result = deriveJobStatus(["finish", "unknown_status"]);
    expect(result).toBe("unknown_status");
  });
});

// ── detectSessions ────────────────────────────────────────────────────────────

function makeTask(overrides: Partial<RawTask> & { id: string }): RawTask {
  return {
    status: "finish",
    startTime: null,
    endTime: null,
    instanceId: null,
    deviceId: null,
    raw_json: "{}",
    ...overrides,
  };
}

// ISO timestamp helpers
function ts(isoStr: string): string {
  return new Date(isoStr).toISOString();
}

describe("detectSessions", () => {
  it("single task with null instanceId is its own session", () => {
    const task = makeTask({ id: "1", instanceId: null });
    const map = detectSessions([task]);
    expect(map.get("1")).toBe("1");
  });

  it("single task with instanceId=0 is its own session", () => {
    const task = makeTask({ id: "2", instanceId: 0 });
    const map = detectSessions([task]);
    expect(map.get("2")).toBe("2");
  });

  it("two tasks with null instanceId each get their own session", () => {
    const t1 = makeTask({ id: "1", instanceId: null });
    const t2 = makeTask({ id: "2", instanceId: null });
    const map = detectSessions([t1, t2]);
    expect(map.get("1")).toBe("1");
    expect(map.get("2")).toBe("2");
    expect(map.get("1")).not.toBe(map.get("2"));
  });

  it("two tasks with same instanceId+deviceId and small gap share a session", () => {
    const t1 = makeTask({
      id: "10",
      instanceId: 42,
      deviceId: "dev-A",
      startTime: ts("2024-01-01T10:00:00Z"),
      endTime: ts("2024-01-01T11:00:00Z"),
    });
    const t2 = makeTask({
      id: "11",
      instanceId: 42,
      deviceId: "dev-A",
      startTime: ts("2024-01-01T11:30:00Z"), // 30 min gap — under 4h
      endTime: ts("2024-01-01T12:30:00Z"),
    });
    const map = detectSessions([t1, t2]);
    expect(map.get("10")).toBe("10");
    expect(map.get("11")).toBe("10"); // same session as t1
  });

  it("gap over 4h splits into separate sessions", () => {
    const t1 = makeTask({
      id: "20",
      instanceId: 99,
      deviceId: "dev-B",
      startTime: ts("2024-01-01T08:00:00Z"),
      endTime: ts("2024-01-01T09:00:00Z"),
    });
    const t2 = makeTask({
      id: "21",
      instanceId: 99,
      deviceId: "dev-B",
      startTime: ts("2024-01-01T14:00:00Z"), // 5h gap — over 4h
      endTime: ts("2024-01-01T15:00:00Z"),
    });
    const map = detectSessions([t1, t2]);
    expect(map.get("20")).toBe("20");
    expect(map.get("21")).toBe("21"); // new session
  });

  it("exactly 4h gap stays in the same session (boundary is >4h)", () => {
    const t1 = makeTask({
      id: "30",
      instanceId: 7,
      deviceId: "dev-C",
      startTime: ts("2024-06-01T10:00:00Z"),
      endTime: ts("2024-06-01T10:00:00Z"),
    });
    const t2 = makeTask({
      id: "31",
      instanceId: 7,
      deviceId: "dev-C",
      startTime: ts("2024-06-01T14:00:00Z"), // exactly 4h = 14400s, not > SESSION_GAP_S
      endTime: ts("2024-06-01T15:00:00Z"),
    });
    const map = detectSessions([t1, t2]);
    expect(map.get("31")).toBe("30"); // same session
  });

  it("different deviceId produces separate sessions even with same instanceId", () => {
    const t1 = makeTask({ id: "40", instanceId: 5, deviceId: "dev-X" });
    const t2 = makeTask({ id: "41", instanceId: 5, deviceId: "dev-Y" });
    const map = detectSessions([t1, t2]);
    expect(map.get("40")).not.toBe(map.get("41"));
  });

  it("three tasks in same session all map to the first task's id", () => {
    const tasks = [
      makeTask({
        id: "50",
        instanceId: 3,
        deviceId: "d",
        startTime: ts("2024-01-01T10:00:00Z"),
        endTime: ts("2024-01-01T11:00:00Z"),
      }),
      makeTask({
        id: "51",
        instanceId: 3,
        deviceId: "d",
        startTime: ts("2024-01-01T11:15:00Z"),
        endTime: ts("2024-01-01T12:00:00Z"),
      }),
      makeTask({
        id: "52",
        instanceId: 3,
        deviceId: "d",
        startTime: ts("2024-01-01T12:20:00Z"),
        endTime: ts("2024-01-01T13:00:00Z"),
      }),
    ];
    const map = detectSessions(tasks);
    expect(map.get("50")).toBe("50");
    expect(map.get("51")).toBe("50");
    expect(map.get("52")).toBe("50");
  });

  it("task with no startTime is attached to current session (not split)", () => {
    const t1 = makeTask({
      id: "60",
      instanceId: 8,
      deviceId: "d",
      startTime: ts("2024-01-01T10:00:00Z"),
      endTime: ts("2024-01-01T11:00:00Z"),
    });
    const t2 = makeTask({ id: "61", instanceId: 8, deviceId: "d", startTime: null, endTime: null });
    const map = detectSessions([t1, t2]);
    // t2 has no startTime — should attach to t1's session
    expect(map.get("61")).toBe("60");
  });

  it("covers all tasks in the result map", () => {
    const tasks = [
      makeTask({ id: "70", instanceId: null }),
      makeTask({ id: "71", instanceId: 1, deviceId: "d" }),
      makeTask({ id: "72", instanceId: 1, deviceId: "d", startTime: ts("2024-01-01T10:00:00Z") }),
    ];
    const map = detectSessions(tasks);
    expect(map.size).toBe(3);
    expect(map.has("70")).toBe(true);
    expect(map.has("71")).toBe(true);
    expect(map.has("72")).toBe(true);
  });
});
