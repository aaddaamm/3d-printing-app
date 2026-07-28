// @vitest-environment happy-dom

import { h, render, type ComponentType } from "preact";
import { act } from "preact/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProductDetailView } from "../frontend/components/product-detail-view.js";
import type { ProductSummary } from "../frontend/lib/api.js";

const apiMocks = vi.hoisted(() => ({
  fetchProduct: vi.fn(),
  updateProduct: vi.fn(),
}));
const toastMock = vi.hoisted(() => vi.fn());
const imageHarness = vi.hoisted(() => ({ response: null as ProductSummary | null }));

vi.mock("../frontend/lib/api.js", () => apiMocks);
vi.mock("../frontend/components/toast.js", () => ({ toast: toastMock }));
vi.mock("../frontend/components/product-pricing-history.js", () => ({
  ProductPricingHistory: () => null,
}));
const MountedProductDetailView = ProductDetailView as unknown as ComponentType<{
  productId: number;
  navigate: unknown;
}>;

vi.mock("../frontend/components/product-image-panel.js", async () => {
  const { h: createElement } = await import("preact");
  return {
    ProductImagePanel: ({
      product,
      onProductChange,
    }: {
      product: ProductSummary;
      onProductChange: (updated: ProductSummary) => void;
    }) =>
      createElement(
        "button",
        {
          id: "mock-image-panel",
          type: "button",
          "data-name": product.name,
          "data-photo": product.main_photo_path ?? "none",
          "data-model": product.model_url ?? "none",
          "data-ready": String(product.ready_to_list),
          onClick: () => {
            if (imageHarness.response) onProductChange(imageHarness.response);
          },
        },
        "Apply image response",
      ),
  };
});

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
    name: "Original Product",
    designer: null,
    category_id: null,
    category_label: null,
    status_id: "idea",
    status_label: "Idea",
    source_id: null,
    source_label: null,
    license_id: "unknown_verify",
    license_label: "Unknown / Verify",
    main_photo_id: 10,
    main_photo_path: "/old.webp",
    main_photo_source_type: "print_cover",
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

function imageButton(container: HTMLElement): HTMLButtonElement {
  const button = container.querySelector<HTMLButtonElement>("#mock-image-panel");
  if (!button) throw new Error("Mock image panel was not rendered");
  return button;
}

describe("ProductDetailView mounted reconciliation", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    vi.clearAllMocks();
    imageHarness.response = null;
    container = document.createElement("div");
    document.body.append(container);
  });

  afterEach(() => {
    act(() => render(null, container));
    container.remove();
  });

  it("reconciles every form/image response and applies only the newest authoritative summary", async () => {
    const initial = deferred<ProductSummary>();
    const update = deferred<ProductSummary | null>();
    const formReconciliation = deferred<ProductSummary>();
    const imageReconciliation = deferred<ProductSummary>();
    const formResponse = product({ name: "Saved Product", notes: "Saved notes" });
    const imageResponse = product({
      name: "Original Product",
      main_photo_id: 22,
      main_photo_path: "/manual.webp",
      main_photo_source_type: "manual_upload",
      image_selection_mode: "manual",
      ready_to_list: true,
    });
    const authoritative = product({
      name: "Saved Product",
      notes: "Saved notes",
      main_photo_id: 22,
      main_photo_path: "/manual.webp",
      main_photo_source_type: "manual_upload",
      image_selection_mode: "manual",
      can_sell_level: "green",
      can_sell_label: "Ready to sell",
      ready_to_list: true,
    });

    apiMocks.fetchProduct
      .mockReturnValueOnce(initial.promise)
      .mockReturnValueOnce(formReconciliation.promise)
      .mockReturnValueOnce(imageReconciliation.promise);
    apiMocks.updateProduct.mockReturnValue(update.promise);

    await act(async () =>
      render(h(MountedProductDetailView, { productId: 1, navigate: vi.fn() }), container),
    );
    await settle(initial, product());

    const form = container.querySelector<HTMLFormElement>(".product-detail-form");
    expect(form).not.toBeNull();
    await act(async () => {
      form!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    expect(apiMocks.updateProduct).toHaveBeenCalledTimes(1);
    await settle(update, formResponse);
    expect(apiMocks.fetchProduct).toHaveBeenCalledTimes(2);

    imageHarness.response = imageResponse;
    await act(async () => {
      imageButton(container).dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(apiMocks.fetchProduct).toHaveBeenCalledTimes(3);

    let button = imageButton(container);
    expect(button.dataset.name).toBe("Saved Product");
    expect(button.dataset.photo).toBe("/manual.webp");
    expect(button.dataset.ready).toBe("false");

    await settle(imageReconciliation, authoritative);
    button = imageButton(container);
    expect(button.dataset.name).toBe("Saved Product");
    expect(button.dataset.photo).toBe("/manual.webp");
    expect(button.dataset.ready).toBe("true");

    await settle(
      formReconciliation,
      product({ name: "Stale form reconciliation", main_photo_path: "/stale.webp" }),
    );
    button = imageButton(container);
    expect(button.dataset.name).toBe("Saved Product");
    expect(button.dataset.photo).toBe("/manual.webp");
    expect(button.dataset.ready).toBe("true");
  });

  it.each(["https://makerworld.com/en/models/b", ""])(
    "shows the authoritative image fallback immediately after model URL changes to %s",
    async (value) => {
      const initial = deferred<ProductSummary>();
      const update = deferred<ProductSummary | null>();
      const reconciliation = deferred<ProductSummary>();
      const modelUrl = value || null;
      const fallback = product({
        model_url: modelUrl,
        main_photo_id: 44,
        main_photo_path: "/authoritative-fallback.webp",
        main_photo_source_type: "catalog_preview",
        image_selection_mode: "auto",
      });
      apiMocks.fetchProduct
        .mockReturnValueOnce(initial.promise)
        .mockReturnValueOnce(reconciliation.promise);
      apiMocks.updateProduct.mockReturnValue(update.promise);

      await act(async () =>
        render(h(MountedProductDetailView, { productId: 1, navigate: vi.fn() }), container),
      );
      await settle(
        initial,
        product({
          model_url: "https://makerworld.com/en/models/a",
          main_photo_id: 33,
          main_photo_path: "/source-a.webp",
          main_photo_source_type: "source_hero",
        }),
      );
      const modelInput = [...container.querySelectorAll("label")]
        .find((label) => label.textContent?.includes("Model URL"))!
        .querySelector("input")!;
      await act(async () => {
        modelInput.value = value;
        modelInput.dispatchEvent(new Event("input", { bubbles: true }));
      });
      await act(async () => {
        container
          .querySelector("form")!
          .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      });
      await settle(update, fallback);

      expect(apiMocks.updateProduct.mock.calls[0]?.[1]).toMatchObject({ model_url: modelUrl });
      expect(imageButton(container).dataset.photo).toBe("/authoritative-fallback.webp");
      expect(imageButton(container).dataset.model).toBe(modelUrl ?? "none");
      expect(imageButton(container).dataset.photo).not.toBe("/source-a.webp");
    },
  );

  it("loads, edits, and persists designer metadata", async () => {
    const initial = deferred<ProductSummary>();
    const update = deferred<ProductSummary | null>();
    const reconciliation = deferred<ProductSummary>();
    apiMocks.fetchProduct
      .mockReturnValueOnce(initial.promise)
      .mockReturnValueOnce(reconciliation.promise);
    apiMocks.updateProduct.mockReturnValue(update.promise);

    await act(async () =>
      render(h(MountedProductDetailView, { productId: 1, navigate: vi.fn() }), container),
    );
    await settle(initial, product({ designer: "Ada Designer" }));

    const designerLabel = [...container.querySelectorAll("label")].find((label) =>
      label.textContent?.trim().startsWith("Designer"),
    );
    expect(designerLabel).toBeDefined();
    const designerInput = designerLabel!.querySelector<HTMLInputElement>("input")!;
    expect(designerInput.value).toBe("Ada Designer");

    await act(async () => {
      designerInput.value = "Grace Creator";
      designerInput.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => {
      container
        .querySelector<HTMLFormElement>(".product-detail-form")!
        .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(apiMocks.updateProduct.mock.calls[0]?.[1]).toMatchObject({
      designer: "Grace Creator",
    });
    await settle(update, product({ designer: "Grace Creator" }));
    expect(
      [...container.querySelectorAll("label")]
        .find((label) => label.textContent?.trim().startsWith("Designer"))!
        .querySelector<HTMLInputElement>("input")!.value,
    ).toBe("Grace Creator");
  });

  it("toasts a current reconciliation failure without undoing the safe image merge", async () => {
    const initial = deferred<ProductSummary>();
    const reconciliation = deferred<ProductSummary>();
    apiMocks.fetchProduct
      .mockReturnValueOnce(initial.promise)
      .mockReturnValueOnce(reconciliation.promise);

    await act(async () =>
      render(h(MountedProductDetailView, { productId: 1, navigate: vi.fn() }), container),
    );
    await settle(initial, product());

    imageHarness.response = product({
      name: "Stale image response name",
      main_photo_id: 22,
      main_photo_path: "/manual.webp",
      main_photo_source_type: "manual_upload",
      image_selection_mode: "manual",
      ready_to_list: true,
    });
    await act(async () => {
      imageButton(container).dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    let button = imageButton(container);
    expect(button.dataset.name).toBe("Original Product");
    expect(button.dataset.photo).toBe("/manual.webp");
    expect(button.dataset.ready).toBe("false");

    await fail(reconciliation, new Error("Current reconciliation failure"));

    expect(toastMock).toHaveBeenCalledTimes(1);
    expect(toastMock).toHaveBeenCalledWith("Current reconciliation failure", "error");
    button = imageButton(container);
    expect(button.dataset.name).toBe("Original Product");
    expect(button.dataset.photo).toBe("/manual.webp");
    expect(button.dataset.ready).toBe("false");
  });

  it("aborts and suppresses reconciliation failures after Product change and unmount", async () => {
    const firstInitial = deferred<ProductSummary>();
    const firstReconciliation = deferred<ProductSummary>();
    const secondInitial = deferred<ProductSummary>();
    const secondReconciliation = deferred<ProductSummary>();
    apiMocks.fetchProduct
      .mockReturnValueOnce(firstInitial.promise)
      .mockReturnValueOnce(firstReconciliation.promise)
      .mockReturnValueOnce(secondInitial.promise)
      .mockReturnValueOnce(secondReconciliation.promise);

    await act(async () =>
      render(h(MountedProductDetailView, { productId: 1, navigate: vi.fn() }), container),
    );
    await settle(firstInitial, product({ id: 1 }));

    imageHarness.response = product({ id: 1, main_photo_path: "/first-manual.webp" });
    await act(async () => {
      imageButton(container).dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    const firstSignal = apiMocks.fetchProduct.mock.calls[1]?.[1]?.signal;

    await act(async () =>
      render(h(MountedProductDetailView, { productId: 2, navigate: vi.fn() }), container),
    );
    expect(firstSignal?.aborted).toBe(true);
    await fail(firstReconciliation, new Error("Stale changed-Product failure"));
    expect(toastMock).not.toHaveBeenCalled();

    await settle(secondInitial, product({ id: 2, name: "Second Product" }));
    imageHarness.response = product({ id: 2, main_photo_path: "/second-manual.webp" });
    await act(async () => {
      imageButton(container).dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    const secondSignal = apiMocks.fetchProduct.mock.calls[3]?.[1]?.signal;

    await act(async () => render(null, container));
    expect(secondSignal?.aborted).toBe(true);
    await fail(secondReconciliation, new Error("Stale unmounted failure"));
    expect(toastMock).not.toHaveBeenCalled();
  });
});
