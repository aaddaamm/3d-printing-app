import { describe, expect, it } from "vitest";
import { getRouteState, routeNeedsDashboardBootstrap } from "../frontend/components/app-shell.js";

describe("dashboard bootstrap route policy", () => {
  it.each(["/catalog", "/products", "/products/12", "/batches", "/batches/4", "/admin"])(
    "loads %s without print-history bootstrap data",
    (path) => {
      expect(routeNeedsDashboardBootstrap(getRouteState(path))).toBe(false);
    },
  );

  it.each(["/", "/projects", "/projects/12", "/printers"])(
    "keeps dashboard bootstrap enabled for %s",
    (path) => {
      expect(routeNeedsDashboardBootstrap(getRouteState(path))).toBe(true);
    },
  );
});
