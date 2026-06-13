import type { BambuApiTask } from "../../lib/types.js";

export function bambuTask(overrides: Partial<BambuApiTask> = {}): BambuApiTask {
  return {
    id: 1000,
    instanceId: 9001,
    plateIndex: 1,
    deviceId: "bambu-p1s-001",
    deviceName: "Shop P1S",
    deviceModel: "P1S",
    designId: 123456,
    designTitle: "Fixture Widget",
    modelId: "model-1",
    profileId: 555,
    title: "Fixture Widget_plate_1",
    status: 2,
    failedType: null,
    bedType: "textured_plate",
    weight: 42.5,
    length: 1420,
    costTime: 3600,
    startTime: "2026-01-01T10:00:00.000Z",
    endTime: "2026-01-01T11:00:00.000Z",
    cover: "https://example.test/cover.png",
    thumbnail: "https://example.test/thumb.png",
    amsDetailMapping: [
      {
        amsId: 0,
        slotId: 1,
        filamentType: "PLA",
        filamentId: "PLA-BLACK-001",
        targetColor: "#111111",
        weight: 42.5,
      },
    ],
    ...overrides,
  };
}

export const bambuSingleSuccessfulPrint = bambuTask();

export const bambuMultiPlateSession = [
  bambuTask({
    id: 2000,
    instanceId: 9100,
    plateIndex: 1,
    title: "Fixture Multi_plate_1",
    startTime: "2026-01-02T10:00:00.000Z",
    endTime: "2026-01-02T11:00:00.000Z",
    weight: 30,
    costTime: 3600,
  }),
  bambuTask({
    id: 2001,
    instanceId: 9100,
    plateIndex: 2,
    title: "Fixture Multi_plate_2",
    startTime: "2026-01-02T11:30:00.000Z",
    endTime: "2026-01-02T12:30:00.000Z",
    weight: 45,
    costTime: 3600,
  }),
];

export const bambuRepeatedPlateStartsNewSession = [
  bambuTask({
    id: 2100,
    instanceId: 9200,
    plateIndex: 1,
    startTime: "2026-01-03T10:00:00.000Z",
    endTime: "2026-01-03T11:00:00.000Z",
  }),
  bambuTask({
    id: 2101,
    instanceId: 9200,
    plateIndex: 1,
    startTime: "2026-01-03T11:05:00.000Z",
    endTime: "2026-01-03T12:00:00.000Z",
  }),
];

export const bambuMixedStatusSession = [
  bambuTask({ id: 2200, instanceId: 9300, plateIndex: 1, status: 2 }),
  bambuTask({ id: 2201, instanceId: 9300, plateIndex: 2, status: 3 }),
  bambuTask({ id: 2202, instanceId: 9300, plateIndex: 3, status: 4 }),
];

export const bambuMultiMaterialPrint = bambuTask({
  id: 2300,
  title: "Fixture AMS Multi Material",
  weight: 75,
  amsDetailMapping: [
    {
      amsId: 0,
      slotId: 1,
      filamentType: "PLA",
      filamentId: "PLA-BLACK-001",
      targetColor: "#111111",
      weight: 40,
    },
    {
      amsId: 0,
      slotId: 2,
      filamentType: "PETG",
      filamentId: "PETG-CLEAR-001",
      targetColor: "#eeeeee",
      weight: 35,
    },
  ],
});
