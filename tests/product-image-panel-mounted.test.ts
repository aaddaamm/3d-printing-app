// @vitest-environment happy-dom

import { h, render, type ComponentType } from "preact";
import { act } from "preact/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProductImagePanel } from "../frontend/components/product-image-panel.js";
import type {
  ProductImageCandidate,
  ProductImagesRefreshResponse,
  ProductSummary,
} from "../frontend/lib/api.js";

const apiMocks = vi.hoisted(() => ({
  fetchProductImageCandidates: vi.fn(),
  refreshProductImages: vi.fn(),
  returnProductImageToAuto: vi.fn(),
  selectProductImage: vi.fn(),
  uploadProductImage: vi.fn(),
}));
const toastMock = vi.hoisted(() => vi.fn());

vi.mock("../frontend/lib/api.js", () => apiMocks);
vi.mock("../frontend/components/toast.js", () => ({ toast: toastMock }));

const MountedProductImagePanel = ProductImagePanel as unknown as ComponentType<{
  product: ProductSummary;
  onProductChange: unknown;
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

function product(overrides: Partial<ProductSummary> = {}): ProductSummary {
  return {
    id: 1,
    name: "Test Product",
    designer: null,
    category_id: null,
    category_label: null,
    status_id: "idea",
    status_label: "Idea",
    source_id: null,
    source_label: null,
    license_id: "unknown_verify",
    license_label: "Unknown / Verify",
    main_photo_id: null,
    main_photo_path: null,
    main_photo_source_type: null,
    image_selection_mode: "auto",
    target_sale_price: null,
    restock_priority: "none",
    model_url: null,
    etsy_listing_url: null,
    default_material: null,
    primary_color: null,
    accent_color: null,
    preferred_printer_id: null,
    estimated_print_time_s: null,
    estimated_filament_g: null,
    booth_price: null,
    etsy_price: null,
    packaging_cost: null,
    handling_minutes: null,
    target_margin_pct: null,
    pricing_notes: null,
    notes: null,
    sales_companion_visible: false,
    can_sell_level: "red",
    can_sell_label: "Verify license",
    ready_to_list: false,
    ...overrides,
  };
}

function candidate(key: string, label: string): ProductImageCandidate {
  return {
    candidate_key: key,
    source_type: "print_cover",
    photo_id: 1,
    url: `/images/${key}.webp`,
    label,
    priority: 50,
    available: true,
    warning: null,
  };
}

async function settle<T>(pending: Deferred<T>, value: T): Promise<void> {
  await act(async () => {
    pending.resolve(value);
    await Promise.resolve();
  });
}

async function fail<T>(pending: Deferred<T>, error: Error): Promise<void> {
  await act(async () => {
    pending.reject(error);
    await Promise.resolve();
  });
}

describe("ProductImagePanel mounted effects", () => {
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

  it("starts local list first, invokes one refresh after an early action, and keeps action state", async () => {
    const list = deferred<ProductImageCandidate[]>();
    const action = deferred<ProductSummary>();
    const refresh = deferred<ProductImagesRefreshResponse>();
    const onProductChange = vi.fn();
    const manual = product({
      main_photo_id: 4,
      main_photo_path: "/manual.webp",
      main_photo_source_type: "manual_upload",
      image_selection_mode: "manual",
    });
    const automatic = product({
      main_photo_id: 8,
      main_photo_path: "/auto.webp",
      main_photo_source_type: "print_cover",
      image_selection_mode: "auto",
    });

    apiMocks.fetchProductImageCandidates.mockReturnValue(list.promise);
    apiMocks.returnProductImageToAuto.mockReturnValue(action.promise);
    apiMocks.refreshProductImages.mockReturnValue(refresh.promise);

    await act(async () =>
      render(h(MountedProductImagePanel, { product: manual, onProductChange }), container),
    );

    expect(apiMocks.fetchProductImageCandidates).toHaveBeenCalledTimes(1);
    expect(apiMocks.refreshProductImages).not.toHaveBeenCalled();

    const autoButton = [...container.querySelectorAll("button")].find(
      (button) => button.textContent?.trim() === "Return to Auto",
    );
    expect(autoButton).toBeDefined();
    await act(async () => {
      autoButton!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await settle(action, automatic);
    expect(onProductChange).toHaveBeenCalledWith(automatic);

    await settle(list, [candidate("list", "Local list candidate")]);
    expect(apiMocks.refreshProductImages).toHaveBeenCalledTimes(1);
    expect(apiMocks.fetchProductImageCandidates.mock.invocationCallOrder[0]).toBeLessThan(
      apiMocks.refreshProductImages.mock.invocationCallOrder[0]!,
    );

    await settle(refresh, {
      product: product({ name: "Stale refresh Product" }),
      candidates: [candidate("refresh", "Stale refresh candidate")],
      warnings: ["Stale refresh warning"],
    });

    expect(onProductChange).toHaveBeenCalledTimes(1);
    expect(container.textContent).not.toContain("Local list candidate");
    expect(container.textContent).not.toContain("Stale refresh candidate");
    expect(container.textContent).not.toContain("Stale refresh warning");
    expect(toastMock).toHaveBeenCalledTimes(1);
    expect(toastMock).toHaveBeenCalledWith("Product image returned to Auto.", "success");
  });

  it("aborts and suppresses late list work after Product change and unmount", async () => {
    const firstList = deferred<ProductImageCandidate[]>();
    const secondList = deferred<ProductImageCandidate[]>();
    const onProductChange = vi.fn();
    apiMocks.fetchProductImageCandidates
      .mockReturnValueOnce(firstList.promise)
      .mockReturnValueOnce(secondList.promise);

    await act(async () =>
      render(
        h(MountedProductImagePanel, { product: product({ id: 1 }), onProductChange }),
        container,
      ),
    );
    const firstSignal = apiMocks.fetchProductImageCandidates.mock.calls[0]?.[1]?.signal;

    await act(async () =>
      render(
        h(MountedProductImagePanel, { product: product({ id: 2 }), onProductChange }),
        container,
      ),
    );
    expect(firstSignal?.aborted).toBe(true);
    const secondSignal = apiMocks.fetchProductImageCandidates.mock.calls[1]?.[1]?.signal;

    await act(async () => render(null, container));
    expect(secondSignal?.aborted).toBe(true);

    await settle(firstList, [candidate("first", "First stale candidate")]);
    await settle(secondList, [candidate("second", "Second stale candidate")]);

    expect(apiMocks.refreshProductImages).not.toHaveBeenCalled();
    expect(onProductChange).not.toHaveBeenCalled();
    expect(toastMock).not.toHaveBeenCalled();
    expect(container.textContent).toBe("");
  });

  it.each(["https://makerworld.com/en/models/b", null])(
    "reboots for same-Product model_url %s and ignores stale source A",
    async (nextModelUrl) => {
      const firstList = deferred<ProductImageCandidate[]>();
      const secondList = deferred<ProductImageCandidate[]>();
      const firstRefresh = deferred<ProductImagesRefreshResponse>();
      const secondRefresh = deferred<ProductImagesRefreshResponse>();
      const onProductChange = vi.fn();
      const sourceA = product({ model_url: "https://makerworld.com/en/models/a" });
      const fallback = product({
        model_url: nextModelUrl,
        main_photo_id: 20,
        main_photo_path: "/fallback.webp",
        main_photo_source_type: "catalog_preview",
      });
      const enriched = product({
        model_url: nextModelUrl,
        main_photo_id: nextModelUrl ? 30 : 20,
        main_photo_path: nextModelUrl ? "/source-b.webp" : "/fallback.webp",
        main_photo_source_type: nextModelUrl ? "source_hero" : "catalog_preview",
      });
      apiMocks.fetchProductImageCandidates
        .mockReturnValueOnce(firstList.promise)
        .mockReturnValueOnce(secondList.promise);
      apiMocks.refreshProductImages
        .mockReturnValueOnce(firstRefresh.promise)
        .mockReturnValueOnce(secondRefresh.promise);

      await act(async () =>
        render(h(MountedProductImagePanel, { product: sourceA, onProductChange }), container),
      );
      await settle(firstList, [candidate("source-a", "Source A")]);
      const firstSignal = apiMocks.refreshProductImages.mock.calls[0]?.[1]?.signal;

      await act(async () =>
        render(h(MountedProductImagePanel, { product: fallback, onProductChange }), container),
      );
      expect(firstSignal?.aborted).toBe(true);
      await settle(secondList, [candidate("fallback", "Authoritative fallback")]);
      expect(container.textContent).toContain("Authoritative fallback");
      expect(container.textContent).not.toContain("Source A");

      await settle(firstRefresh, {
        product: product({ model_url: sourceA.model_url, main_photo_path: "/source-a.webp" }),
        candidates: [candidate("source-a-late", "Late Source A")],
        warnings: ["Late A warning"],
      });
      await settle(secondRefresh, {
        product: enriched,
        candidates: [candidate("source-b", nextModelUrl ? "Source B" : "Cleared fallback")],
        warnings: [],
      });

      expect(onProductChange).toHaveBeenCalledTimes(1);
      expect(onProductChange).toHaveBeenCalledWith(enriched);
      expect(container.textContent).not.toContain("Late Source A");
      expect(container.textContent).not.toContain("Late A warning");
      expect(container.textContent).toContain(nextModelUrl ? "Source B" : "Cleared fallback");
    },
  );

  it("suppresses stale refresh failures and shows only the current refresh failure", async () => {
    const firstList = deferred<ProductImageCandidate[]>();
    const secondList = deferred<ProductImageCandidate[]>();
    const firstRefresh = deferred<ProductImagesRefreshResponse>();
    const secondRefresh = deferred<ProductImagesRefreshResponse>();
    const onProductChange = vi.fn();
    apiMocks.fetchProductImageCandidates
      .mockReturnValueOnce(firstList.promise)
      .mockReturnValueOnce(secondList.promise);
    apiMocks.refreshProductImages
      .mockReturnValueOnce(firstRefresh.promise)
      .mockReturnValueOnce(secondRefresh.promise);

    await act(async () =>
      render(
        h(MountedProductImagePanel, { product: product({ id: 1 }), onProductChange }),
        container,
      ),
    );
    await settle(firstList, []);
    const firstRefreshSignal = apiMocks.refreshProductImages.mock.calls[0]?.[1]?.signal;

    await act(async () =>
      render(
        h(MountedProductImagePanel, { product: product({ id: 2 }), onProductChange }),
        container,
      ),
    );
    expect(firstRefreshSignal?.aborted).toBe(true);
    await fail(firstRefresh, new Error("Stale refresh failure"));

    await settle(secondList, []);
    expect(apiMocks.refreshProductImages).toHaveBeenCalledTimes(2);
    await fail(secondRefresh, new Error("Current refresh failure"));

    expect(toastMock).toHaveBeenCalledTimes(1);
    expect(toastMock).toHaveBeenCalledWith("Current refresh failure", "error");
    expect(container.textContent).toContain("Current refresh failure");
    expect(container.textContent).not.toContain("Stale refresh failure");
    expect(onProductChange).not.toHaveBeenCalled();
  });
});
