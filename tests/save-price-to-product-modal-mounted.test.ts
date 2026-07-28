// @vitest-environment happy-dom

import { h, render, type ComponentType } from "preact";
import { act } from "preact/test-utils";
import { useState } from "preact/hooks";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SavePriceToProductModal } from "../frontend/components/save-price-to-product-modal.js";
import type { Job } from "../frontend/components/jobs-view-types.js";
import { initialPriceThisDraft } from "../frontend/components/price-this-helpers.js";
import type { SavedProductPricingResponse } from "../frontend/lib/api.js";

const apiMocks = vi.hoisted(() => ({
  fetchProducts: vi.fn(),
  savePriceQuoteToProduct: vi.fn(),
}));
const toastMock = vi.hoisted(() => vi.fn());

vi.mock("../frontend/lib/api.js", () => apiMocks);
vi.mock("../frontend/components/toast.js", () => ({ toast: toastMock }));

const MountedModal = SavePriceToProductModal as unknown as ComponentType<{
  draft: ReturnType<typeof initialPriceThisDraft>;
  selectedJobs: Array<Job | undefined>;
  navigate: (path: string) => void;
  onClose: () => void;
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

const draft = initialPriceThisDraft([7]);
const selectedJobs: Job[] = [{ id: 7, designTitle: "Widget" }];

function Harness({ navigate, onClose }: { navigate: (path: string) => void; onClose: () => void }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return h(MountedModal, {
    draft,
    selectedJobs,
    navigate,
    onClose: () => {
      setOpen(false);
      onClose();
    },
  });
}

function button(container: HTMLElement, label: string): HTMLButtonElement {
  const result = [...container.querySelectorAll<HTMLButtonElement>("button")].find(
    (item) => item.textContent?.trim() === label,
  );
  if (!result) throw new Error(`Button not found: ${label}`);
  return result;
}

function submit(container: HTMLElement): void {
  container
    .querySelector<HTMLFormElement>("form")!
    .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
}

function savedResponse(productId = 12): SavedProductPricingResponse {
  return {
    saved: { product: { id: productId } },
    image_warnings: [],
  } as unknown as SavedProductPricingResponse;
}

describe("SavePriceToProductModal mounted request ownership", () => {
  let container: HTMLDivElement;
  let trigger: HTMLButtonElement;

  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.fetchProducts.mockResolvedValue([]);
    container = document.createElement("div");
    trigger = document.createElement("button");
    trigger.textContent = "Save to Product trigger";
    document.body.append(trigger, container);
    trigger.focus();
  });

  afterEach(() => {
    act(() => render(null, container));
    container.remove();
    trigger.remove();
  });

  it("aborts a dismissed submit and suppresses its late failure", async () => {
    const save = deferred<SavedProductPricingResponse>();
    const navigate = vi.fn();
    const onClose = vi.fn();
    apiMocks.savePriceQuoteToProduct.mockReturnValue(save.promise);
    await act(async () => render(h(Harness, { navigate, onClose }), container));

    await act(async () => submit(container));
    const signal = apiMocks.savePriceQuoteToProduct.mock.calls[0]?.[1] as AbortSignal;
    await act(async () => {
      container
        .querySelector<HTMLElement>(".overlay")!
        .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(signal.aborted).toBe(true);
    expect(onClose).toHaveBeenCalledTimes(1);
    await act(async () => {
      save.reject(new Error("Late dismissed failure"));
      await Promise.resolve();
    });
    expect(toastMock).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("aborts an unmounted submit and suppresses its late failure", async () => {
    const save = deferred<SavedProductPricingResponse>();
    const navigate = vi.fn();
    const onClose = vi.fn();
    apiMocks.savePriceQuoteToProduct.mockReturnValue(save.promise);
    await act(async () =>
      render(h(MountedModal, { draft, selectedJobs, navigate, onClose }), container),
    );

    await act(async () => submit(container));
    const signal = apiMocks.savePriceQuoteToProduct.mock.calls[0]?.[1] as AbortSignal;
    await act(async () => render(null, container));

    expect(signal.aborted).toBe(true);
    await act(async () => {
      save.reject(new Error("Late unmounted failure"));
      await Promise.resolve();
    });
    expect(toastMock).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it.each(["dismiss", "unmount"])("suppresses a late save success after %s", async (lifecycle) => {
    const save = deferred<SavedProductPricingResponse>();
    const navigate = vi.fn();
    const onClose = vi.fn();
    apiMocks.savePriceQuoteToProduct.mockReturnValue(save.promise);
    if (lifecycle === "dismiss") {
      await act(async () => render(h(Harness, { navigate, onClose }), container));
    } else {
      await act(async () =>
        render(h(MountedModal, { draft, selectedJobs, navigate, onClose }), container),
      );
    }

    await act(async () => submit(container));
    const signal = apiMocks.savePriceQuoteToProduct.mock.calls[0]?.[1] as AbortSignal;
    if (lifecycle === "dismiss") {
      await act(async () => {
        container
          .querySelector<HTMLElement>(".overlay")!
          .dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
    } else {
      await act(async () => render(null, container));
    }
    expect(signal.aborted).toBe(true);
    const closeCountAfterLifecycle = lifecycle === "dismiss" ? 1 : 0;
    expect(onClose).toHaveBeenCalledTimes(closeCountAfterLifecycle);

    await act(async () => {
      save.resolve(savedResponse(42));
      await Promise.resolve();
    });

    expect(toastMock).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(closeCountAfterLifecycle);
  });

  it("toasts one current failure and unlocks the form", async () => {
    apiMocks.savePriceQuoteToProduct.mockRejectedValue(new Error("Current save failure"));
    await act(async () =>
      render(
        h(MountedModal, { draft, selectedJobs, navigate: vi.fn(), onClose: vi.fn() }),
        container,
      ),
    );

    await act(async () => submit(container));

    expect(toastMock).toHaveBeenCalledTimes(1);
    expect(toastMock).toHaveBeenCalledWith("Current save failure", "error");
    expect(button(container, "Save to Product").disabled).toBe(false);
  });

  it("locks duplicate submission synchronously", async () => {
    const save = deferred<SavedProductPricingResponse>();
    apiMocks.savePriceQuoteToProduct.mockReturnValue(save.promise);
    await act(async () =>
      render(
        h(MountedModal, { draft, selectedJobs, navigate: vi.fn(), onClose: vi.fn() }),
        container,
      ),
    );

    await act(async () => {
      submit(container);
      submit(container);
    });

    expect(apiMocks.savePriceQuoteToProduct).toHaveBeenCalledTimes(1);
    expect(button(container, "Saving…").disabled).toBe(true);
  });

  it("handles one current success exactly once", async () => {
    const navigate = vi.fn();
    const onClose = vi.fn();
    apiMocks.savePriceQuoteToProduct.mockResolvedValue(savedResponse(42));
    await act(async () => render(h(Harness, { navigate, onClose }), container));

    await act(async () => submit(container));

    expect(toastMock).toHaveBeenCalledTimes(1);
    expect(toastMock).toHaveBeenCalledWith("Saved price quote to product.", "success");
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith("/products/42");
  });
});

describe("SavePriceToProductModal mounted focus containment", () => {
  let container: HTMLDivElement;
  let trigger: HTMLButtonElement;

  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.fetchProducts.mockResolvedValue([]);
    container = document.createElement("div");
    trigger = document.createElement("button");
    trigger.textContent = "Save to Product trigger";
    document.body.append(trigger, container);
    trigger.focus();
  });

  afterEach(() => {
    act(() => render(null, container));
    container.remove();
    trigger.remove();
  });

  async function mount(onClose = vi.fn()): Promise<ReturnType<typeof vi.fn>> {
    await act(async () => render(h(Harness, { navigate: vi.fn(), onClose }), container));
    return onClose;
  }

  it("focuses the first meaningful field and wraps Tab forward and backward", async () => {
    await mount();
    const name = [...container.querySelectorAll<HTMLInputElement>("input")].find((input) =>
      input.closest("label")?.textContent?.includes("Name"),
    )!;
    expect(document.activeElement).toBe(name);

    const enabled = [
      ...container.querySelectorAll<HTMLElement>("button, input, select, textarea"),
    ].filter((element) => !(element as HTMLButtonElement).disabled);
    enabled.at(-1)!.focus();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    expect(document.activeElement).toBe(enabled[0]);

    enabled[0]!.focus();
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true }),
    );
    expect(document.activeElement).toBe(enabled.at(-1));
  });

  it("retains Tab and Shift+Tab on the dialog when every control is disabled", async () => {
    await mount();
    const dialog = container.querySelector<HTMLElement>(".modal")!;
    expect(dialog.getAttribute("tabindex")).toBe("-1");
    for (const control of dialog.querySelectorAll<
      HTMLButtonElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >("button, input, select, textarea")) {
      control.disabled = true;
    }

    dialog.focus();
    expect(document.activeElement).toBe(dialog);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    expect(document.activeElement).toBe(dialog);

    trigger.focus();
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true }),
    );
    expect(document.activeElement).toBe(dialog);
  });

  it("skips disabled and hidden controls while wrapping focus", async () => {
    await mount();
    const controls = [
      ...container.querySelectorAll<HTMLElement>("button, input, select, textarea"),
    ];
    const disabledFirst = controls[0] as HTMLButtonElement;
    disabledFirst.disabled = true;
    const hiddenSecond = controls[1]!;
    hiddenSecond.hidden = true;
    const expectedFirst = controls[2]!;
    const expectedLast = controls.at(-1)!;

    expectedLast.focus();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    expect(document.activeElement).toBe(expectedFirst);

    expectedFirst.focus();
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true }),
    );
    expect(document.activeElement).toBe(expectedLast);
  });

  it("redirects a programmatically focused non-control to a directional edge", async () => {
    await mount();
    const dialog = container.querySelector<HTMLElement>(".modal")!;
    const programmatic = document.createElement("div");
    programmatic.tabIndex = -1;
    dialog.append(programmatic);
    const enabled = [
      ...dialog.querySelectorAll<HTMLElement>("button, input, select, textarea"),
    ].filter((element) => !(element as HTMLButtonElement).disabled && !element.hidden);

    programmatic.focus();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    expect(document.activeElement).toBe(enabled[0]);

    programmatic.focus();
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true }),
    );
    expect(document.activeElement).toBe(enabled.at(-1));
  });

  it("redirects Tab from a background control into the modal", async () => {
    await mount();
    trigger.focus();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    expect(container.querySelector(".modal")?.contains(document.activeElement)).toBe(true);
  });

  it.each(["cancel", "escape", "overlay"])(
    "restores the opening trigger after %s dismissal",
    async (method) => {
      const onClose = await mount();
      if (method === "cancel") {
        await act(async () => {
          button(container, "Cancel").dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });
      } else if (method === "escape") {
        await act(async () => {
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        });
      } else {
        await act(async () => {
          container
            .querySelector<HTMLElement>(".overlay")!
            .dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });
      }

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(document.activeElement).toBe(trigger);
    },
  );

  it("restores focus on unmount only while the opening trigger remains connected", async () => {
    await act(async () =>
      render(
        h(MountedModal, { draft, selectedJobs, navigate: vi.fn(), onClose: vi.fn() }),
        container,
      ),
    );
    await act(async () => render(null, container));
    expect(document.activeElement).toBe(trigger);

    trigger.focus();
    await act(async () =>
      render(
        h(MountedModal, { draft, selectedJobs, navigate: vi.fn(), onClose: vi.fn() }),
        container,
      ),
    );
    trigger.remove();
    await act(async () => render(null, container));
    expect(document.activeElement).not.toBe(trigger);
  });
});
