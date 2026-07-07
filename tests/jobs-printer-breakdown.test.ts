import { expect, it } from "vitest";
import { jobsForInventoryPrinter } from "../frontend/components/jobs-printer-breakdown.js";
import type { Job, PrinterInventory } from "../frontend/components/jobs-view-types.js";

function printer(id: number): PrinterInventory {
  return {
    id,
    provider: "moonraker",
    provider_display_name: "Moonraker",
    provider_printer_id: `snapmaker-${id}`,
    name: "Snapmaker U1",
    model: "Snapmaker U1",
    is_active: 1,
    job_count: 0,
    task_count: 0,
  };
}

it("matches inventory printer jobs by printer_id instead of shared model/name", () => {
  const jobs: Job[] = [
    { id: 101, printer_id: 7, deviceModel: "Snapmaker U1", startTime: "2026-07-07" },
    { id: 102, printer_id: 3, deviceModel: "Snapmaker U1", startTime: "2026-07-06" },
  ];

  expect(jobsForInventoryPrinter(printer(7), jobs).map((job) => job.id)).toEqual([101]);
  expect(jobsForInventoryPrinter(printer(3), jobs).map((job) => job.id)).toEqual([102]);
});
