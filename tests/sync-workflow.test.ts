import { expect, it } from "vitest";
import { hasSyncChanges } from "../lib/sync-workflow.js";

it("detects whether sync counts include real row changes", () => {
  expect(hasSyncChanges([])).toBe(false);
  expect(hasSyncChanges([{ inserted: 0, updated: 0 }])).toBe(false);
  expect(
    hasSyncChanges([
      { inserted: 0, updated: 0 },
      { inserted: 1, updated: 0 },
    ]),
  ).toBe(true);
  expect(hasSyncChanges([{ inserted: 0, updated: 2 }])).toBe(true);
});
