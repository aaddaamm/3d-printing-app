import { describe, expect, it } from "vitest";
import { getRouteState, routeNeedsDashboardBootstrap } from "../frontend/components/app-shell.js";

describe("dashboard bootstrap route policy", () => {
  it.each(["/catalog", "/products", "/products/12", "/batches", "/batches/4", "/admin"])(
    "loads %s without print-history bootstrap data",
    (path) => {
      expect(routeNeedsDashboardBootstrap(getRouteState(path))).toBe(false);
    },
  );

  it.each(["/", "/projects", "/projects/12", "/printers", "/price"])(
    "keeps dashboard bootstrap enabled for %s",
    (path) => {
      expect(routeNeedsDashboardBootstrap(getRouteState(path))).toBe(true);
    },
  );
});

describe("Price-this route", () => {
  it("matches the route without interpreting a numeric detail ID", () => {
    expect(getRouteState("/price")).toMatchObject({
      isPrice: true,
      projectId: null,
      productId: null,
      batchId: null,
    });
  });

  it("matches the route when job IDs are present in the query string", () => {
    expect(getRouteState("/price?jobIds=12,7").isPrice).toBe(true);
  });
});
