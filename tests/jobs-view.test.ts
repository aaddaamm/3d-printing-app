import { expect, it } from "vitest";
import { isJobsRoute } from "../frontend/components/jobs-view.js";

it("does not mark the Jobs nav item active on non-job routes", () => {
  expect(isJobsRoute("/")).toBe(true);
  expect(isJobsRoute("/catalog")).toBe(false);
  expect(isJobsRoute("/projects")).toBe(false);
  expect(isJobsRoute("/printers")).toBe(false);
  expect(isJobsRoute("/products")).toBe(false);
  expect(isJobsRoute("/products/pipeline")).toBe(false);
  expect(isJobsRoute("/admin")).toBe(false);
});
