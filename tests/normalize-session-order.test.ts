import { describe, expect, it } from "vitest";
import { computeSessionOrder } from "../lib/normalize-session-order.js";
import type { RawTask } from "../lib/session-detection.js";

function task(input: Partial<RawTask> & Pick<RawTask, "id">): RawTask {
  const { id, ...overrides } = input;
  return {
    id,
    status: null,
    startTime: null,
    endTime: null,
    instanceId: null,
    plateIndex: null,
    deviceId: null,
    raw_json: "{}",
    ...overrides,
  };
}

describe("session ordering", () => {
  it("orders deduplicated sessions chronologically within a printer instance", () => {
    const tasks = [
      task({
        id: "late-plate",
        instanceId: 10,
        deviceId: "printer-1",
        startTime: "2026-07-15T12:00:00Z",
      }),
      task({
        id: "early-plate-1",
        instanceId: 10,
        deviceId: "printer-1",
        startTime: "2026-07-15T08:00:00Z",
      }),
      task({
        id: "early-plate-2",
        instanceId: 10,
        deviceId: "printer-1",
        startTime: "2026-07-15T09:00:00Z",
      }),
    ];
    const sessions = new Map([
      ["late-plate", "late-session"],
      ["early-plate-1", "early-session"],
      ["early-plate-2", "early-session"],
    ]);

    expect(computeSessionOrder(tasks, sessions)).toEqual(
      new Map([
        ["early-session", 1],
        ["late-session", 2],
      ]),
    );
  });

  it("places sessions without start times after dated sessions", () => {
    const tasks = [
      task({ id: "unknown", instanceId: 4, deviceId: "p1" }),
      task({
        id: "dated",
        instanceId: 4,
        deviceId: "p1",
        startTime: "2026-07-15T08:00:00Z",
      }),
    ];

    expect(
      computeSessionOrder(
        tasks,
        new Map([
          ["unknown", "unknown-session"],
          ["dated", "dated-session"],
        ]),
      ),
    ).toEqual(
      new Map([
        ["dated-session", 1],
        ["unknown-session", 2],
      ]),
    );
  });

  it("keeps solo tasks and different devices in independent order groups", () => {
    const tasks = [
      task({ id: "solo-null", instanceId: null }),
      task({ id: "solo-zero", instanceId: 0 }),
      task({ id: "device-a", instanceId: 8, deviceId: "a" }),
      task({ id: "device-b", instanceId: 8, deviceId: "b" }),
    ];
    const sessions = new Map(tasks.map((item) => [item.id, `${item.id}-session`]));

    expect([...computeSessionOrder(tasks, sessions).values()]).toEqual([1, 1, 1, 1]);
  });

  it("ignores tasks that were not assigned to a session", () => {
    expect(computeSessionOrder([task({ id: "unassigned" })], new Map())).toEqual(new Map());
  });
});
