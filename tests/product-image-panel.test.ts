import { expect, it } from "vitest";
import {
  beginProductImagePanelMount,
  beginProductImageRequest,
  candidateActionLabel,
  currentImageSourceLabel,
  imageModeLabel,
  imageSourceLabel,
  initialProductImageRequestState,
  invalidateProductImageRequests,
  isCurrentProductImageRequest,
  resolveProductImageRequest,
  selectableCandidates,
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

it("orders async results and invalidates every request on Product changes and unmount", () => {
  const mounted = beginProductImagePanelMount(initialProductImageRequestState(), 7);
  const list = beginProductImageRequest(mounted.state);
  const refresh = beginProductImageRequest(list.state);

  let current = resolveProductImageRequest(refresh.state, refresh.request);
  expect(isCurrentProductImageRequest(current, list.request)).toBe(false);
  expect(resolveProductImageRequest(current, list.request)).toBe(current);

  const selection = beginProductImageRequest(current);
  current = resolveProductImageRequest(selection.state, selection.request);
  expect(isCurrentProductImageRequest(current, refresh.request)).toBe(false);

  const nextProduct = beginProductImagePanelMount(current, 8);
  expect(isCurrentProductImageRequest(nextProduct.state, selection.request)).toBe(false);

  const upload = beginProductImageRequest(nextProduct.state);
  const unmounted = invalidateProductImageRequests(upload.state);
  expect(isCurrentProductImageRequest(unmounted, upload.request)).toBe(false);
});
