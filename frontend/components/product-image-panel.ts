import { h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import htm from "htm";

import {
  fetchProductImageCandidates,
  refreshProductImages,
  returnProductImageToAuto,
  selectProductImage,
  uploadProductImage,
  type ProductImageCandidate,
  type ProductImageSourceType,
  type ProductSummary,
} from "../lib/api.js";
import { toast } from "./toast.js";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

const SOURCE_LABELS: Record<ProductImageSourceType, string> = {
  manual_upload: "Uploaded photo",
  source_hero: "MakerWorld hero",
  catalog_preview: "3MF preview",
  contact_sheet: "Print contact sheet",
  print_cover: "Print cover",
  placeholder: "Intentional placeholder",
};

const CANDIDATE_ACTION_LABELS: Record<ProductImageSourceType, string> = {
  manual_upload: "Use uploaded photo",
  source_hero: "Use MakerWorld hero",
  catalog_preview: "Use 3MF preview",
  contact_sheet: "Use print contact sheet",
  print_cover: "Use print cover",
  placeholder: "Use intentional placeholder",
};

export function imageModeLabel(mode: ProductSummary["image_selection_mode"]): string {
  return mode === "manual" ? "Manual choice" : "Auto-selected";
}

export function imageSourceLabel(source: ProductImageSourceType | null): string {
  return source === null ? "No image selected" : SOURCE_LABELS[source];
}

export function currentImageSourceLabel(
  product: Pick<ProductSummary, "image_selection_mode" | "main_photo_source_type">,
): string {
  const source =
    product.main_photo_source_type ??
    (product.image_selection_mode === "manual" ? "placeholder" : null);
  return imageSourceLabel(source);
}

export function candidateActionLabel(
  candidate: Pick<ProductImageCandidate, "source_type" | "available">,
): string {
  return CANDIDATE_ACTION_LABELS[candidate.source_type];
}

export function selectableCandidates(
  candidates: readonly ProductImageCandidate[],
): ProductImageCandidate[] {
  return candidates.filter(({ available }) => available);
}

export function candidateWarningId(candidateKey: string): string {
  return `product-image-warning-${encodeURIComponent(candidateKey)}`;
}

export type ProductImageRequest = {
  kind: "bootstrap" | "action";
  mountGeneration: number;
  operationGeneration: number;
  actionGeneration: number;
  productId: number;
};

export type ProductImageRequestState = {
  mountGeneration: number;
  bootstrapGeneration: number;
  completedBootstrapGeneration: number;
  actionGeneration: number;
  completedActionGeneration: number;
  activeActionGeneration: number | null;
  productId: number | null;
  active: boolean;
};

export function initialProductImageRequestState(): ProductImageRequestState {
  return {
    mountGeneration: 0,
    bootstrapGeneration: 0,
    completedBootstrapGeneration: 0,
    actionGeneration: 0,
    completedActionGeneration: 0,
    activeActionGeneration: null,
    productId: null,
    active: false,
  };
}

export function beginProductImagePanelMount(
  state: ProductImageRequestState,
  productId: number,
): { state: ProductImageRequestState; mountGeneration: number } {
  const mountGeneration = state.mountGeneration + 1;
  return {
    mountGeneration,
    state: {
      mountGeneration,
      bootstrapGeneration: 0,
      completedBootstrapGeneration: 0,
      actionGeneration: 0,
      completedActionGeneration: 0,
      activeActionGeneration: null,
      productId,
      active: true,
    },
  };
}

export function beginProductImageRequest(state: ProductImageRequestState): {
  state: ProductImageRequestState;
  request: ProductImageRequest;
} {
  if (!state.active || state.productId === null) {
    throw new Error("Cannot begin a Product image request without an active Product.");
  }
  const operationGeneration = state.bootstrapGeneration + 1;
  return {
    state: { ...state, bootstrapGeneration: operationGeneration },
    request: {
      kind: "bootstrap",
      mountGeneration: state.mountGeneration,
      operationGeneration,
      actionGeneration: 0,
      productId: state.productId,
    },
  };
}

export function isCurrentProductImageRequest(
  state: ProductImageRequestState,
  request: ProductImageRequest,
): boolean {
  return (
    state.active &&
    state.mountGeneration === request.mountGeneration &&
    state.productId === request.productId &&
    (request.kind === "action"
      ? state.actionGeneration === request.operationGeneration
      : state.bootstrapGeneration === request.operationGeneration &&
        state.actionGeneration === request.actionGeneration)
  );
}

export function tryBeginProductImageAction(state: ProductImageRequestState): {
  state: ProductImageRequestState;
  request: ProductImageRequest;
} | null {
  if (!state.active || state.productId === null || state.activeActionGeneration !== null) {
    return null;
  }
  const operationGeneration = state.actionGeneration + 1;
  const request: ProductImageRequest = {
    kind: "action",
    mountGeneration: state.mountGeneration,
    operationGeneration,
    actionGeneration: operationGeneration,
    productId: state.productId,
  };
  return {
    request,
    state: {
      ...state,
      actionGeneration: operationGeneration,
      activeActionGeneration: operationGeneration,
    },
  };
}

export function finishProductImageAction(
  state: ProductImageRequestState,
  request: ProductImageRequest,
): ProductImageRequestState {
  if (
    request.kind !== "action" ||
    state.mountGeneration !== request.mountGeneration ||
    state.productId !== request.productId ||
    state.activeActionGeneration !== request.operationGeneration
  ) {
    return state;
  }
  return { ...state, activeActionGeneration: null };
}

export function resolveProductImageRequest(
  state: ProductImageRequestState,
  request: ProductImageRequest,
): ProductImageRequestState {
  if (!isCurrentProductImageRequest(state, request)) return state;
  return request.kind === "action"
    ? { ...state, completedActionGeneration: request.operationGeneration }
    : { ...state, completedBootstrapGeneration: request.operationGeneration };
}

export function shouldInvokeProductImageRefresh(
  state: ProductImageRequestState,
  mountGeneration: number,
  productId: number,
): boolean {
  return state.active && state.mountGeneration === mountGeneration && state.productId === productId;
}

export function invalidateProductImageRequests(
  state: ProductImageRequestState,
): ProductImageRequestState {
  return { ...state, active: false };
}

function requestErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function candidateFromUpload(
  product: ProductSummary,
  uploaded: Awaited<ReturnType<typeof uploadProductImage>>["photo"],
): ProductImageCandidate {
  return {
    candidate_key: uploaded.candidate_key,
    source_type: "manual_upload",
    photo_id: uploaded.id,
    url: uploaded.url,
    label: `${product.name} uploaded photo`,
    priority: 10,
    available: true,
    warning: null,
  };
}

export function ProductImagePanel({
  product,
  onProductChange,
}: {
  product: ProductSummary;
  onProductChange: (product: ProductSummary) => void;
}) {
  const [candidates, setCandidates] = useState<ProductImageCandidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [refreshing, setRefreshing] = useState(true);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const requestState = useRef(initialProductImageRequestState());
  const controllers = useRef(new Set<AbortController>());

  const beginRequest = () => {
    const started = beginProductImageRequest(requestState.current);
    requestState.current = started.state;
    const controller = new AbortController();
    controllers.current.add(controller);
    return { request: started.request, controller };
  };

  const beginAction = () => {
    const started = tryBeginProductImageAction(requestState.current);
    if (!started) return null;
    requestState.current = started.state;
    const controller = new AbortController();
    controllers.current.add(controller);
    return { request: started.request, controller };
  };

  const isCurrentMount = (mountGeneration: number, productId: number) =>
    requestState.current.active &&
    requestState.current.mountGeneration === mountGeneration &&
    requestState.current.productId === productId;

  useEffect(() => {
    const mounted = beginProductImagePanelMount(requestState.current, product.id);
    requestState.current = mounted.state;
    setCandidates([]);
    setLoadingCandidates(true);
    setRefreshing(false);
    setBusyAction(null);
    setWarnings([]);
    setStatusMessage("");

    const bootstrapImages = async () => {
      const list = beginRequest();
      try {
        const items = await fetchProductImageCandidates(product.id, {
          signal: list.controller.signal,
        });
        if (isCurrentProductImageRequest(requestState.current, list.request)) {
          requestState.current = resolveProductImageRequest(requestState.current, list.request);
          setCandidates(items);
        }
      } catch (error: unknown) {
        if (isCurrentProductImageRequest(requestState.current, list.request)) {
          const message = requestErrorMessage(error, "Failed to load product image candidates.");
          setStatusMessage(message);
          toast(message, "error");
        }
      } finally {
        controllers.current.delete(list.controller);
        if (isCurrentMount(mounted.mountGeneration, product.id)) setLoadingCandidates(false);
      }

      if (
        !shouldInvokeProductImageRefresh(requestState.current, mounted.mountGeneration, product.id)
      ) {
        return;
      }
      setRefreshing(true);
      const refresh = beginRequest();
      try {
        const result = await refreshProductImages(product.id, {
          signal: refresh.controller.signal,
        });
        if (!isCurrentProductImageRequest(requestState.current, refresh.request)) return;
        requestState.current = resolveProductImageRequest(requestState.current, refresh.request);
        setCandidates(result.candidates);
        setWarnings(result.warnings);
        onProductChange(result.product);
      } catch (error: unknown) {
        if (!isCurrentProductImageRequest(requestState.current, refresh.request)) return;
        const message = requestErrorMessage(error, "Failed to refresh product images.");
        setWarnings([message]);
        toast(message, "error");
      } finally {
        controllers.current.delete(refresh.controller);
        if (isCurrentMount(mounted.mountGeneration, product.id)) setRefreshing(false);
      }
    };

    void bootstrapImages();

    return () => {
      requestState.current = invalidateProductImageRequests(requestState.current);
      for (const controller of controllers.current) controller.abort();
      controllers.current.clear();
    };
  }, [product.id, product.model_url]);

  const chooseCandidate = async (candidate: ProductImageCandidate) => {
    if (!candidate.available || busyAction) return;
    const started = beginAction();
    if (!started) return;
    setBusyAction(candidate.candidate_key);
    setStatusMessage(`Selecting ${imageSourceLabel(candidate.source_type)}…`);
    try {
      const updated = await selectProductImage(product.id, candidate.candidate_key, {
        signal: started.controller.signal,
      });
      if (!isCurrentProductImageRequest(requestState.current, started.request)) return;
      requestState.current = resolveProductImageRequest(requestState.current, started.request);
      onProductChange(updated);
      setStatusMessage(`${imageSourceLabel(candidate.source_type)} selected.`);
      toast("Product image updated.", "success");
    } catch (error: unknown) {
      if (!isCurrentProductImageRequest(requestState.current, started.request)) return;
      const message = requestErrorMessage(error, "Failed to select product image.");
      setStatusMessage(message);
      toast(message, "error");
    } finally {
      controllers.current.delete(started.controller);
      requestState.current = finishProductImageAction(requestState.current, started.request);
      if (isCurrentMount(started.request.mountGeneration, started.request.productId)) {
        setBusyAction(null);
      }
    }
  };

  const upload = async (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (!file || busyAction) return;

    const started = beginAction();
    if (!started) return;
    setBusyAction("upload");
    setStatusMessage(`Uploading ${file.name}…`);
    try {
      const result = await uploadProductImage(product.id, file, {
        signal: started.controller.signal,
      });
      if (!isCurrentProductImageRequest(requestState.current, started.request)) return;
      requestState.current = resolveProductImageRequest(requestState.current, started.request);
      const uploadedCandidate = candidateFromUpload(result.product, result.photo);
      setCandidates((items) => [
        uploadedCandidate,
        ...items.filter(({ candidate_key }) => candidate_key !== uploadedCandidate.candidate_key),
      ]);
      onProductChange(result.product);
      setStatusMessage("Uploaded photo selected.");
      toast("Product photo uploaded.", "success");
    } catch (error: unknown) {
      if (!isCurrentProductImageRequest(requestState.current, started.request)) return;
      const message = requestErrorMessage(error, "Failed to upload product photo.");
      setStatusMessage(message);
      toast(message, "error");
    } finally {
      controllers.current.delete(started.controller);
      requestState.current = finishProductImageAction(requestState.current, started.request);
      if (isCurrentMount(started.request.mountGeneration, started.request.productId)) {
        setBusyAction(null);
      }
    }
  };

  const returnToAuto = async () => {
    if (busyAction) return;
    const started = beginAction();
    if (!started) return;
    setBusyAction("auto");
    setStatusMessage("Returning to automatic image selection…");
    try {
      const updated = await returnProductImageToAuto(product.id, {
        signal: started.controller.signal,
      });
      if (!isCurrentProductImageRequest(requestState.current, started.request)) return;
      requestState.current = resolveProductImageRequest(requestState.current, started.request);
      onProductChange(updated);
      setStatusMessage("Automatic image selection restored.");
      toast("Product image returned to Auto.", "success");
    } catch (error: unknown) {
      if (!isCurrentProductImageRequest(requestState.current, started.request)) return;
      const message = requestErrorMessage(error, "Failed to return product image to Auto.");
      setStatusMessage(message);
      toast(message, "error");
    } finally {
      controllers.current.delete(started.controller);
      requestState.current = finishProductImageAction(requestState.current, started.request);
      if (isCurrentMount(started.request.mountGeneration, started.request.productId)) {
        setBusyAction(null);
      }
    }
  };

  return html`<section class="product-image-panel" aria-labelledby="product-image-title">
    <div class="product-image-current">
      ${product.main_photo_path
        ? html`<img
            class="product-detail-photo"
            src=${product.main_photo_path}
            alt=${`${product.name} identification image`}
          />`
        : html`<div
            class="product-detail-photo product-detail-photo--empty"
            role="img"
            aria-label=${`${product.name} has no identification image`}
          >
            <span aria-hidden="true">▧</span>
            <span>No identification image</span>
          </div>`}
    </div>
    <div class="product-image-panel-body">
      <div class="product-image-heading">
        <div>
          <h3 id="product-image-title">Identification image</h3>
          <p>${currentImageSourceLabel(product)}</p>
        </div>
        <span class=${`product-image-mode product-image-mode--${product.image_selection_mode}`}>
          ${imageModeLabel(product.image_selection_mode)}
        </span>
      </div>

      <details class="product-image-choices">
        <summary>Choose image</summary>
        <div class="product-image-candidate-grid">
          ${candidates.map((candidate) => {
            const warningId = candidate.warning
              ? candidateWarningId(candidate.candidate_key)
              : undefined;
            return html`<div class="product-image-candidate-item" key=${candidate.candidate_key}>
              <button
                type="button"
                class=${`product-image-candidate${candidate.available ? "" : " product-image-candidate--unavailable"}`}
                disabled=${!candidate.available || Boolean(busyAction)}
                onClick=${() => chooseCandidate(candidate)}
                aria-label=${candidate.available
                  ? candidateActionLabel(candidate)
                  : `${candidate.label} unavailable`}
                aria-describedby=${warningId}
              >
                ${candidate.url
                  ? html`<img
                      src=${candidate.url}
                      alt=${`${candidate.label} candidate for ${product.name}`}
                      loading="lazy"
                    />`
                  : html`<span class="product-image-candidate-placeholder" aria-hidden="true"
                      >▧</span
                    >`}
                <strong>${candidate.label || imageSourceLabel(candidate.source_type)}</strong>
                <span>${candidateActionLabel(candidate)}</span>
              </button>
              ${candidate.warning
                ? html`<small id=${warningId} class="product-image-candidate-warning">
                    ${candidate.warning}
                  </small>`
                : null}
            </div>`;
          })}
        </div>
        ${loadingCandidates && candidates.length === 0
          ? html`<p class="product-image-loading">Finding local image choices…</p>`
          : null}
        ${!loadingCandidates && candidates.length === 0
          ? html`<p class="product-image-loading">No image choices are available yet.</p>`
          : null}
      </details>

      <div class="product-image-actions">
        <label
          class=${`product-image-upload${busyAction ? " product-image-upload--disabled" : ""}`}
        >
          <span>${busyAction === "upload" ? "Uploading…" : "Upload photo"}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled=${Boolean(busyAction)}
            onChange=${upload}
          />
        </label>
        ${product.image_selection_mode === "manual"
          ? html`<button
              class="btn-secondary product-image-auto"
              type="button"
              disabled=${Boolean(busyAction)}
              onClick=${returnToAuto}
            >
              ${busyAction === "auto" ? "Returning…" : "Return to Auto"}
            </button>`
          : null}
      </div>

      <div class="product-image-status" role="status" aria-live="polite">
        ${refreshing ? html`<p>Refreshing image sources…</p>` : null}
        ${warnings.map((warning) => html`<p key=${warning}>${warning}</p>`)}
        ${statusMessage ? html`<p>${statusMessage}</p>` : null}
      </div>
    </div>
  </section>`;
}
