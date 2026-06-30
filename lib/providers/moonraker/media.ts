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

function dirname(filename: string): string {
  const lastSlash = filename.lastIndexOf("/");
  return lastSlash === -1 ? "" : filename.slice(0, lastSlash);
}

function joinPosixPath(...parts: string[]): string {
  return parts
    .flatMap((part) => part.split("/"))
    .filter((part) => part.length > 0 && part !== ".")
    .join("/");
}

function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

function moonrakerFileUrl(
  baseUrl: string,
  filename: string | null | undefined,
  path: string,
): string {
  const thumbnailPath = path.startsWith("/")
    ? path.slice(1)
    : joinPosixPath(dirname(filename ?? ""), path);
  return `${baseUrl}/server/files/gcodes/${encodePath(thumbnailPath)}`;
}

export function mediaFromJob(job: MoonrakerHistoryJob, baseUrl: string): NormalizedMediaAsset[] {
  const metadata = job.metadata ?? {};
  const thumbnail = firstThumbnail(metadata);
  return thumbnail
    ? [{ kind: "thumbnail", url: moonrakerFileUrl(baseUrl, job.filename, thumbnail) }]
    : [];
}
