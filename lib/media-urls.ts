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

const HTTP_URL_RE = /^https?:\/\//i;

function isHttpUrl(url: string): boolean {
  return HTTP_URL_RE.test(url);
}

export interface ProviderRemoteMediaInput {
  provider: string;
  providerPrinterId: string | null | undefined;
  filename: string | null | undefined;
  thumbnail: string | null | undefined;
  cover: string | null | undefined;
}

export function moonrakerFileMediaUrl(
  hostOrBaseUrl: string,
  filename: string | null | undefined,
  mediaPath: string,
): string {
  if (isHttpUrl(mediaPath)) return mediaPath;

  const baseUrl = isHttpUrl(hostOrBaseUrl) ? hostOrBaseUrl : `http://${hostOrBaseUrl}`;
  const resolvedPath = mediaPath.startsWith("/")
    ? mediaPath.slice(1)
    : joinPosixPath(dirname(filename ?? ""), mediaPath);

  return `${baseUrl}/server/files/gcodes/${encodePath(resolvedPath)}`;
}

export function providerRemoteMediaUrl({
  provider,
  providerPrinterId,
  filename,
  thumbnail,
  cover,
}: ProviderRemoteMediaInput): string | null {
  if (provider === "bambu") return null;

  const mediaUrl = thumbnail ?? cover;
  if (!mediaUrl) return null;
  if (provider === "moonraker") {
    return providerPrinterId ? moonrakerFileMediaUrl(providerPrinterId, filename, mediaUrl) : null;
  }
  return isHttpUrl(mediaUrl) ? mediaUrl : null;
}
