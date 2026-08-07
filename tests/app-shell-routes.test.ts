// @vitest-environment happy-dom

import { h, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const toastMock = vi.hoisted(() => vi.fn());

vi.mock("../frontend/components/toast.js", () => ({ toast: toastMock }));

import {
  getRouteState,
  routeNeedsDashboardBootstrap,
  SyncNowButton,
} from "../frontend/components/app-shell.js";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((onResolve) => {
    resolve = onResolve;
  });
  return { promise, resolve };
}

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

describe("Sync now control", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    toastMock.mockReset();
    container = document.createElement("div");
    document.body.append(container);
  });

  afterEach(() => {
    act(() => render(null, container));
    container.remove();
    vi.unstubAllGlobals();
  });

  it("posts once while pending, then refreshes data and confirms success", async () => {
    const response = deferred<Response>();
    const fetchMock = vi.fn<typeof fetch>().mockReturnValue(response.promise);
    const onSyncComplete = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("fetch", fetchMock);

    await act(async () => {
      render(h(SyncNowButton, { onSyncComplete }), container);
    });
    const button = container.querySelector<HTMLButtonElement>(".sync-now-btn")!;

    await act(async () => {
      button.click();
      await Promise.resolve();
    });
    expect(button.disabled).toBe(true);
    button.click();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith("/api/sync", { method: "POST" });

    await act(async () => {
      response.resolve(jsonResponse({ providers: [], covers: {} }));
      await Promise.resolve();
    });

    expect(onSyncComplete).toHaveBeenCalledOnce();
    expect(toastMock).toHaveBeenCalledWith("Sync complete.", "success");
    expect(button.disabled).toBe(false);
  });

  it("confirms a completed sync and warns when its data refresh fails", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ providers: [], covers: {} }));
    const onSyncComplete = vi.fn().mockRejectedValue(new Error("Failed to refresh projects."));
    vi.stubGlobal("fetch", fetchMock);

    await act(async () => {
      render(h(SyncNowButton, { onSyncComplete }), container);
    });

    await act(async () => {
      container.querySelector<HTMLButtonElement>(".sync-now-btn")!.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/sync", { method: "POST" });
    expect(onSyncComplete).toHaveBeenCalledOnce();
    expect(toastMock).toHaveBeenNthCalledWith(1, "Sync complete.", "success");
    expect(toastMock).toHaveBeenNthCalledWith(
      2,
      "Sync completed, but page data may be stale. Reload to view the latest data.",
      "error",
    );
  });

  it("shows the server failure without refreshing data", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ error: "A sync is already running." }, 409));
    const onSyncComplete = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await act(async () => {
      render(h(SyncNowButton, { onSyncComplete }), container);
    });

    await act(async () => {
      container.querySelector<HTMLButtonElement>(".sync-now-btn")!.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(onSyncComplete).not.toHaveBeenCalled();
    expect(toastMock).toHaveBeenCalledWith("A sync is already running.", "error");
  });
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
