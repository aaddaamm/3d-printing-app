import { moonrakerFileMediaUrl } from "../../media-urls.js";
import type { NormalizedMediaAsset } from "../types.js";
import type { MoonrakerHistoryJob } from "./types.js";
import { asNumber, asString } from "./utils.js";

function thumbnailArea(thumbnail: Record<string, unknown>): number {
  const width = asNumber(thumbnail["width"]) ?? 0;
  const height = asNumber(thumbnail["height"]) ?? 0;
  return width * height;
}

function firstThumbnail(metadata: Record<string, unknown>): string | null {
  const thumbnails = metadata["thumbnails"];
  if (!Array.isArray(thumbnails)) return null;

  const candidates = thumbnails
    .filter(
      (thumbnail): thumbnail is Record<string, unknown> =>
        !!thumbnail && typeof thumbnail === "object",
    )
    .map((thumbnail) => ({
      path: asString(thumbnail["relative_path"]) ?? asString(thumbnail["thumbnail_path"]),
      area: thumbnailArea(thumbnail),
    }))
    .filter((thumbnail): thumbnail is { path: string; area: number } => thumbnail.path != null);

  return candidates.sort((a, b) => b.area - a.area)[0]?.path ?? null;
}

export function mediaFromJob(job: MoonrakerHistoryJob, baseUrl: string): NormalizedMediaAsset[] {
  const metadata = job.metadata ?? {};
  const thumbnail = firstThumbnail(metadata);
  return thumbnail
    ? [{ kind: "thumbnail", url: moonrakerFileMediaUrl(baseUrl, job.filename, thumbnail) }]
    : [];
}
