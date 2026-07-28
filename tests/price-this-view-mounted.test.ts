// @vitest-environment happy-dom

import { h, render, type ComponentType } from "preact";
import { act } from "preact/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PriceThisView } from "../frontend/components/price-this-view.js";
import type { Job } from "../frontend/components/jobs-view-types.js";
import type { PriceQuoteResult } from "../frontend/lib/api.js";

const apiMocks = vi.hoisted(() => ({
  calculatePriceQuote: vi.fn(),
  fetchProducts: vi.fn(),
  savePriceQuoteToProduct: vi.fn(),
}));
const toastMock = vi.hoisted(() => vi.fn());

vi.mock("../frontend/lib/api.js", () => apiMocks);
vi.mock("../frontend/components/toast.js", () => ({ toast: toastMock }));

const MountedPriceThisView = PriceThisView as unknown as ComponentType<{
  jobs: Job[];
  initialJobIds: number[];
  navigate: (path: string) => void;
}>;

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
};

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

function quote(): PriceQuoteResult {
  return {
    channel: "direct",
    assumptions: {
      labor_hourly_rate: 20,
      target_margin_pct: 0.5,
      platform_fee_pct: 0,
      fixed_fee_per_order: 0,
      failure_buffer_pct: 0,
      overhead_buffer_pct: 0,
      material_contributions: [],
      machine_contributions: [],
    },
    attempts: [],
    warnings: [],
    breakdown: {
      sellableUnits: 1,
      materialCost: 1,
      machineCost: 1,
      productionLossCost: 0,
      batchLaborCost: 0,
      perUnitLaborCost: 0,
      packagingCost: 0,
      extraCost: 0,
      subtotalCost: 2,
      bufferCost: 0,
      totalCost: 2,
      unitCost: 2,
      minimumViablePrice: 4,
      suggestedPrice: 4,
      profitPerUnit: 2,
      profitPerBatch: 2,
      estimatedMarginPct: 0.5,
    },
  };
}

const jobs: Job[] = [{ id: 7, designTitle: "Widget" }];

function submit(container: HTMLElement): void {
  container
    .querySelector<HTMLFormElement>(".price-this-form")!
    .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
}

describe("PriceThisView mounted request ownership", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement("div");
    document.body.append(container);
  });

  afterEach(() => {
    act(() => render(null, container));
    container.remove();
  });

  it("aborts and suppresses a stale calculation failure after a draft edit", async () => {
    const calculation = deferred<PriceQuoteResult>();
    apiMocks.calculatePriceQuote.mockReturnValue(calculation.promise);

    await act(async () =>
      render(h(MountedPriceThisView, { jobs, initialJobIds: [7], navigate: vi.fn() }), container),
    );
    await act(async () => submit(container));

    const signal = apiMocks.calculatePriceQuote.mock.calls[0]?.[1] as AbortSignal;
    const quantity = [...container.querySelectorAll<HTMLInputElement>("input[type=number]")].find(
      (input) => input.closest("label")?.textContent?.includes("Sellable units"),
    )!;
    await act(async () => {
      quantity.value = "2";
      quantity.dispatchEvent(new Event("input", { bubbles: true }));
    });

    expect(signal.aborted).toBe(true);
    await act(async () => {
      calculation.reject(new Error("Stale calculation failure"));
      await Promise.resolve();
    });

    expect(toastMock).not.toHaveBeenCalled();
    expect(container.textContent).not.toContain("Stale calculation failure");
    expect(container.textContent).toContain("Calculate price");
  });

  it("aborts and suppresses a late calculation failure after unmount", async () => {
    const calculation = deferred<PriceQuoteResult>();
    apiMocks.calculatePriceQuote.mockReturnValue(calculation.promise);

    await act(async () =>
      render(h(MountedPriceThisView, { jobs, initialJobIds: [7], navigate: vi.fn() }), container),
    );
    await act(async () => submit(container));
    const signal = apiMocks.calculatePriceQuote.mock.calls[0]?.[1] as AbortSignal;

    await act(async () => render(null, container));
    expect(signal.aborted).toBe(true);
    await act(async () => {
      calculation.reject(new Error("Unmounted calculation failure"));
      await Promise.resolve();
    });

    expect(toastMock).not.toHaveBeenCalled();
    expect(container.textContent).toBe("");
  });

  it("aborts a prior recalculation and toasts only the current failure", async () => {
    const first = deferred<PriceQuoteResult>();
    const second = deferred<PriceQuoteResult>();
    apiMocks.calculatePriceQuote
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    await act(async () =>
      render(h(MountedPriceThisView, { jobs, initialJobIds: [7], navigate: vi.fn() }), container),
    );

    await act(async () => submit(container));
    const firstSignal = apiMocks.calculatePriceQuote.mock.calls[0]?.[1] as AbortSignal;
    await act(async () => submit(container));
    expect(firstSignal.aborted).toBe(true);

    await act(async () => {
      first.reject(new Error("Stale recalculation failure"));
      await Promise.resolve();
    });
    expect(toastMock).not.toHaveBeenCalled();

    await act(async () => {
      second.reject(new Error("Current calculation failure"));
      await Promise.resolve();
    });
    expect(toastMock).toHaveBeenCalledTimes(1);
    expect(toastMock).toHaveBeenCalledWith("Current calculation failure", "error");
    expect(container.textContent).toContain("Calculate price");
  });

  it("renders the current successful calculation once", async () => {
    apiMocks.calculatePriceQuote.mockResolvedValue(quote());
    await act(async () =>
      render(h(MountedPriceThisView, { jobs, initialJobIds: [7], navigate: vi.fn() }), container),
    );

    await act(async () => submit(container));

    expect(container.textContent).toContain("Recommended direct price");
    expect(container.textContent).toContain("Save to Product");
    expect(toastMock).not.toHaveBeenCalled();
  });
});
