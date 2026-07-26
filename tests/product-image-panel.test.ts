import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import {
  beginProductImagePanelMount,
  beginProductImageRequest,
  candidateActionLabel,
  candidateWarningId,
  currentImageSourceLabel,
  imageModeLabel,
  imageSourceLabel,
  initialProductImageRequestState,
  finishProductImageAction,
  invalidateProductImageRequests,
  isCurrentProductImageRequest,
  resolveProductImageRequest,
  selectableCandidates,
  shouldInvokeProductImageRefresh,
  tryBeginProductImageAction,
} from "../frontend/components/product-image-panel.js";
import type { ProductImageCandidate } from "../frontend/lib/api.js";

function candidate(
  source_type: ProductImageCandidate["source_type"],
  available = true,
  warning: string | null = null,
): ProductImageCandidate {
  return {
    candidate_key: `${source_type}:1`,
    source_type,
    photo_id: 1,
    url: available ? `/images/${source_type}.webp` : null,
    label: source_type,
    priority: 1,
    available,
    warning,
  };
}

it("labels Product image modes, sources, and candidate actions", () => {
  expect(imageModeLabel("auto")).toBe("Auto-selected");
  expect(imageModeLabel("manual")).toBe("Manual choice");

  expect(imageSourceLabel("manual_upload")).toBe("Uploaded photo");
  expect(imageSourceLabel("source_hero")).toBe("MakerWorld hero");
  expect(imageSourceLabel("catalog_preview")).toBe("3MF preview");
  expect(imageSourceLabel("contact_sheet")).toBe("Print contact sheet");
  expect(imageSourceLabel("print_cover")).toBe("Print cover");
  expect(imageSourceLabel("placeholder")).toBe("Intentional placeholder");
  expect(imageSourceLabel(null)).toBe("No image selected");
  expect(
    currentImageSourceLabel({ image_selection_mode: "manual", main_photo_source_type: null }),
  ).toBe("Intentional placeholder");

  expect(candidateActionLabel(candidate("catalog_preview"))).toBe("Use 3MF preview");
  expect(candidateActionLabel(candidate("manual_upload"))).toBe("Use uploaded photo");
  expect(candidateActionLabel(candidate("source_hero"))).toBe("Use MakerWorld hero");
  expect(candidateActionLabel(candidate("contact_sheet"))).toBe("Use print contact sheet");
  expect(candidateActionLabel(candidate("print_cover"))).toBe("Use print cover");
  expect(candidateActionLabel(candidate("placeholder"))).toBe("Use intentional placeholder");
});

it("keeps unavailable candidates warning-visible but excludes them from selection", () => {
  const unavailable = candidate("contact_sheet", false, "The source covers are unavailable.");
  const candidates = [candidate("catalog_preview"), unavailable];

  expect(selectableCandidates(candidates)).toEqual([candidates[0]]);
  expect(selectableCandidates(candidates).every((item) => item.available)).toBe(true);
  expect(candidates).toContain(unavailable);
  expect(unavailable.warning).toBe("The source covers are unavailable.");
});

it("makes an older request stale as soon as a newer request starts, even when newer fails", () => {
  const mounted = beginProductImagePanelMount(initialProductImageRequestState(), 7);
  const older = beginProductImageRequest(mounted.state);
  const newer = beginProductImageRequest(older.state);

  expect(isCurrentProductImageRequest(newer.state, older.request)).toBe(false);
  expect(isCurrentProductImageRequest(newer.state, newer.request)).toBe(true);

  // A rejected request does not roll latest-started ordering back to an older generation.
  expect(isCurrentProductImageRequest(newer.state, older.request)).toBe(false);
  expect(resolveProductImageRequest(newer.state, older.request)).toBe(newer.state);
});

it("keeps bootstrap invocation separate from user-action currency", () => {
  const mounted = beginProductImagePanelMount(initialProductImageRequestState(), 7);
  const list = beginProductImageRequest(mounted.state);
  const selection = tryBeginProductImageAction(list.state)!;

  expect(isCurrentProductImageRequest(selection.state, list.request)).toBe(false);
  expect(isCurrentProductImageRequest(selection.state, selection.request)).toBe(true);
  expect(tryBeginProductImageAction(selection.state)).toBeNull();
  expect(shouldInvokeProductImageRefresh(selection.state, mounted.mountGeneration, 7)).toBe(true);

  const afterSelection = finishProductImageAction(selection.state, selection.request);
  const refresh = beginProductImageRequest(afterSelection);

  // Refresh is still invoked, but it neither becomes current nor invalidates the selection.
  expect(isCurrentProductImageRequest(refresh.state, refresh.request)).toBe(false);
  expect(isCurrentProductImageRequest(refresh.state, selection.request)).toBe(true);
});

it("prevents a slower local list from overwriting refresh", () => {
  const mounted = beginProductImagePanelMount(initialProductImageRequestState(), 7);
  const list = beginProductImageRequest(mounted.state);
  const refresh = beginProductImageRequest(list.state);

  expect(isCurrentProductImageRequest(refresh.state, list.request)).toBe(false);
  expect(isCurrentProductImageRequest(refresh.state, refresh.request)).toBe(true);
});

it("invalidates bootstrap and actions on Product changes and unmount", () => {
  const mounted = beginProductImagePanelMount(initialProductImageRequestState(), 7);
  const list = beginProductImageRequest(mounted.state);
  const nextProduct = beginProductImagePanelMount(list.state, 8);
  expect(isCurrentProductImageRequest(nextProduct.state, list.request)).toBe(false);
  expect(shouldInvokeProductImageRefresh(nextProduct.state, mounted.mountGeneration, 7)).toBe(
    false,
  );

  const upload = tryBeginProductImageAction(nextProduct.state)!;
  const unmounted = invalidateProductImageRequests(upload.state);
  expect(isCurrentProductImageRequest(unmounted, upload.request)).toBe(false);
  expect(shouldInvokeProductImageRefresh(unmounted, nextProduct.mountGeneration, 8)).toBe(false);
});

it("connects stable unavailable-warning IDs to independently rendered warning text", () => {
  const warningId = candidateWarningId("contact_sheet:batch/7");
  expect(warningId).toBe("product-image-warning-contact_sheet%3Abatch%2F7");

  const source = readFileSync(
    new URL("../frontend/components/product-image-panel.ts", import.meta.url),
    "utf8",
  );
  expect(source).toContain("aria-describedby=${warningId}");
  expect(source).toContain("id=${warningId}");
  expect(source).toContain('class="product-image-candidate-warning"');
});
