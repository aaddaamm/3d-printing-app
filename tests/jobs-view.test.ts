import { expect, it, vi } from "vitest";
import { handlePriceJobAction, isJobsRoute } from "../frontend/components/jobs-view.js";
import type { Job } from "../frontend/components/jobs-view-types.js";

it("does not mark the Jobs nav item active on non-job routes", () => {
  expect(isJobsRoute("/")).toBe(true);
  expect(isJobsRoute("/catalog")).toBe(false);
  expect(isJobsRoute("/projects")).toBe(false);
  expect(isJobsRoute("/printers")).toBe(false);
  expect(isJobsRoute("/products")).toBe(false);
  expect(isJobsRoute("/products/pipeline")).toBe(false);
  expect(isJobsRoute("/price")).toBe(false);
  expect(isJobsRoute("/admin")).toBe(false);
});

it("prices a job without propagating the row or card action", () => {
  const stopPropagation = vi.fn();
  const onPriceJob = vi.fn();
  const job: Job = { id: 42, designTitle: "Quoted print" };

  handlePriceJobAction({ stopPropagation }, job, onPriceJob);

  expect(stopPropagation).toHaveBeenCalledOnce();
  expect(onPriceJob).toHaveBeenCalledOnce();
  expect(onPriceJob).toHaveBeenCalledWith(job);
});
