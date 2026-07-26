import fs from "node:fs";
import path from "node:path";

const EXPLICIT_HTTP_URL_RE = /^https?:\/\//i;

type ResolvedProductPhotoSource = { kind: "local"; path: string } | { kind: "remote"; url: string };

function resolveProductPhotoSource(storedPath: string | null): ResolvedProductPhotoSource | null {
  if (!storedPath) return null;
  if (EXPLICIT_HTTP_URL_RE.test(storedPath)) {
    try {
      const url = new URL(storedPath);
      if ((url.protocol === "http:" || url.protocol === "https:") && url.hostname) {
        return { kind: "remote", url: storedPath };
      }
    } catch {
      return null;
    }
    return null;
  }

  try {
    const filePath = path.resolve(storedPath);
    if (fs.lstatSync(filePath).isFile()) return { kind: "local", path: filePath };
  } catch {
    // Missing and invalid local paths are unavailable.
  }
  return null;
}

export function projectProductPhotoPath(
  photoId: number,
  storedPath: string | null,
): { url: string | null; available: boolean } {
  const source = resolveProductPhotoSource(storedPath);
  if (!source) return { url: null, available: false };
  return {
    url: source.kind === "remote" ? source.url : `/ui/product-photos/${photoId}`,
    available: true,
  };
}

export function resolveLocalProductPhotoPath(storedPath: string | null): string | null {
  const source = resolveProductPhotoSource(storedPath);
  return source?.kind === "local" ? source.path : null;
}
