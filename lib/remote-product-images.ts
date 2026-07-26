import { lookup as dnsLookup } from "node:dns/promises";
import { isIP } from "node:net";

const SOURCE_PAGE_HOSTS = new Set(["makerworld.com", "www.makerworld.com"]);
const SOURCE_IMAGE_HOSTS = new Set(["makerworld.bblmw.com"]);
const HTML_BYTE_LIMIT = 1024 * 1024;
const IMAGE_BYTE_LIMIT = 10 * 1024 * 1024;
const MAX_REDIRECTS = 3;
const FETCH_TIMEOUT_MS = 10_000;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const IMAGE_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export type RemoteImageDependencies = {
  fetch: typeof globalThis.fetch;
  lookup: typeof import("node:dns/promises").lookup;
};

type FetchStage = "page" | "image";

type ResolvedAddress = {
  address: string;
  family: number;
};

function decodeHtmlEntities(value: string): string {
  return value.replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi, (entity): string => {
    const normalized = entity.toLowerCase();
    const named: Record<string, string> = {
      "&amp;": "&",
      "&quot;": '"',
      "&apos;": "'",
      "&lt;": "<",
      "&gt;": ">",
    };
    if (named[normalized]) return named[normalized];
    const numeric = normalized.startsWith("&#x")
      ? Number.parseInt(normalized.slice(3, -1), 16)
      : Number.parseInt(normalized.slice(2, -1), 10);
    if (!Number.isFinite(numeric) || numeric < 0 || numeric > 0x10ffff) return entity;
    try {
      return String.fromCodePoint(numeric);
    } catch {
      return entity;
    }
  });
}

function attributes(tag: string): Map<string, string> {
  const result = new Map<string, string>();
  const pattern = /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
  for (const match of tag.matchAll(pattern)) {
    const name = match[1]?.toLowerCase();
    if (!name) continue;
    result.set(name, match[2] ?? match[3] ?? match[4] ?? "");
  }
  return result;
}

export function extractOpenGraphImage(html: string, pageUrl: URL): URL | null {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const values = attributes(match[0]);
    if (values.get("property")?.trim().toLowerCase() !== "og:image") continue;
    const content = values.get("content")?.trim();
    if (!content) return null;
    try {
      return new URL(decodeHtmlEntities(content), pageUrl);
    } catch {
      return null;
    }
  }
  return null;
}

function parseIpv4(address: string): number | null {
  if (isIP(address) !== 4) return null;
  const octets = address.split(".").map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet))) return null;
  return (((octets[0]! << 24) >>> 0) | (octets[1]! << 16) | (octets[2]! << 8) | octets[3]!) >>> 0;
}

function ipv4InCidr(address: number, base: number, bits: number): boolean {
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (address & mask) === (base & mask);
}

function isPublicIpv4(address: string): boolean {
  const numeric = parseIpv4(address);
  if (numeric === null) return false;
  const blocked: Array<[number, number]> = [
    [0x00000000, 8],
    [0x0a000000, 8],
    [0x64400000, 10],
    [0x7f000000, 8],
    [0xa9fe0000, 16],
    [0xac100000, 12],
    [0xc0000000, 24],
    [0xc0000200, 24],
    [0xc0586300, 24],
    [0xc0a80000, 16],
    [0xc6120000, 15],
    [0xc6336400, 24],
    [0xcb007100, 24],
    [0xe0000000, 4],
    [0xf0000000, 4],
  ];
  return !blocked.some(([base, bits]) => ipv4InCidr(numeric, base, bits));
}

function parseIpv6(address: string): number[] | null {
  if (isIP(address) !== 6) return null;
  const withoutZone = address.split("%", 1)[0]!;
  const halves = withoutZone.split("::");
  if (halves.length > 2) return null;

  const parseHalf = (half: string): number[] | null => {
    if (!half) return [];
    const result: number[] = [];
    for (const part of half.split(":")) {
      if (part.includes(".")) {
        const ipv4 = parseIpv4(part);
        if (ipv4 === null) return null;
        result.push((ipv4 >>> 16) & 0xffff, ipv4 & 0xffff);
      } else {
        const value = Number.parseInt(part, 16);
        if (!/^[\da-f]{1,4}$/i.test(part) || !Number.isInteger(value)) return null;
        result.push(value);
      }
    }
    return result;
  };

  const left = parseHalf(halves[0] ?? "");
  const right = parseHalf(halves[1] ?? "");
  if (!left || !right) return null;
  if (halves.length === 1) return left.length === 8 ? left : null;
  const omitted = 8 - left.length - right.length;
  if (omitted < 1) return null;
  return [...left, ...Array<number>(omitted).fill(0), ...right];
}

function isPublicIpv6(address: string): boolean {
  const groups = parseIpv6(address);
  if (!groups) return false;

  const mapped = groups.slice(0, 5).every((group) => group === 0) && groups[5] === 0xffff;
  if (mapped) {
    const ipv4 = `${groups[6]! >>> 8}.${groups[6]! & 0xff}.${groups[7]! >>> 8}.${groups[7]! & 0xff}`;
    return isPublicIpv4(ipv4);
  }

  // Globally routable unicast currently occupies 2000::/3. Fixed provider hosts do not need
  // transition, local, multicast, or other special-purpose IPv6 ranges.
  if ((groups[0]! & 0xe000) !== 0x2000) return false;
  if (groups[0] === 0x2001 && groups[1] === 0x0db8) return false;
  if (groups[0] === 0x2001 && groups[1] === 0x0002 && groups[2] === 0) return false;
  if (
    groups[0] === 0x2001 &&
    (groups[1]! & 0xfff0) === 0x0010 &&
    (groups[1] === 0x0010 || groups[1] === 0x0020)
  ) {
    return false;
  }
  if (groups[0] === 0x3fff && (groups[1]! & 0xf000) === 0) return false;
  return true;
}

function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  return family === 4 ? isPublicIpv4(address) : family === 6 ? isPublicIpv6(address) : false;
}

function validateUrl(url: URL, stage: FetchStage): void {
  if (url.protocol !== "https:") throw new Error("MakerWorld image enrichment requires HTTPS");
  if (url.username || url.password) {
    throw new Error("MakerWorld image enrichment URLs must not contain credentials");
  }
  if (url.port) throw new Error("MakerWorld image enrichment only supports the default HTTPS port");
  const allowedHosts = stage === "page" ? SOURCE_PAGE_HOSTS : SOURCE_IMAGE_HOSTS;
  if (!allowedHosts.has(url.hostname.toLowerCase())) {
    throw new Error(
      stage === "page"
        ? "URL is not a supported MakerWorld public page"
        : "Open Graph image is not on the supported MakerWorld image host",
    );
  }
}

async function validateDns(url: URL, lookup: RemoteImageDependencies["lookup"]): Promise<void> {
  let addresses: ResolvedAddress[];
  try {
    addresses = (await lookup(url.hostname, { all: true, verbatim: true })) as ResolvedAddress[];
  } catch (error: unknown) {
    throw new Error(`Could not resolve the MakerWorld host: ${String(error)}`, { cause: error });
  }
  if (addresses.length === 0 || addresses.some(({ address }) => !isPublicAddress(address))) {
    throw new Error("MakerWorld host must resolve only to public network addresses");
  }
}

function contentType(response: Response): string {
  return (response.headers.get("Content-Type") ?? "").split(";", 1)[0]!.trim().toLowerCase();
}

async function readBoundedBody(
  response: Response,
  limit: number,
  label: string,
): Promise<Uint8Array> {
  const declaredLength = response.headers.get("Content-Length");
  if (declaredLength && /^\d+$/.test(declaredLength) && BigInt(declaredLength) > BigInt(limit)) {
    throw new Error(`${label} exceeds the ${limit === HTML_BYTE_LIMIT ? "1 MiB" : "10 MiB"} limit`);
  }
  if (!response.body) return new Uint8Array();

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limit) {
        await reader.cancel();
        throw new Error(
          `${label} exceeds the ${limit === HTML_BYTE_LIMIT ? "1 MiB" : "10 MiB"} limit`,
        );
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

async function fetchWithPolicy(
  initialUrl: URL,
  stage: FetchStage,
  dependencies: RemoteImageDependencies,
): Promise<{ response: Response; finalUrl: URL }> {
  let url = initialUrl;
  for (let redirects = 0; ; redirects += 1) {
    validateUrl(url, stage);
    await validateDns(url, dependencies.lookup);

    let response: Response;
    try {
      response = await dependencies.fetch(url, {
        redirect: "manual",
        credentials: "omit",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
    } catch (error: unknown) {
      const name = (error as { name?: unknown } | null)?.name;
      if (name === "TimeoutError" || name === "AbortError") {
        throw new Error("MakerWorld request timed out after 10 seconds", { cause: error });
      }
      throw new Error(`MakerWorld request failed: ${String(error)}`, { cause: error });
    }

    if (!REDIRECT_STATUSES.has(response.status)) return { response, finalUrl: url };
    if (redirects >= MAX_REDIRECTS) throw new Error("MakerWorld response exceeded 3 redirects");
    const location = response.headers.get("Location");
    if (!location) throw new Error("MakerWorld redirect did not include a Location header");
    try {
      url = new URL(location, url);
    } catch (error: unknown) {
      throw new Error("MakerWorld redirect URL is malformed", { cause: error });
    }
  }
}

function requireSuccessfulStatus(response: Response, label: string): void {
  if (!response.ok) throw new Error(`${label} returned status ${response.status}`);
}

export async function fetchSupportedSourceImage(
  modelUrl: string,
  dependencies: Partial<RemoteImageDependencies> = {},
): Promise<{ bytes: Uint8Array; sourceUrl: string } | null> {
  let pageUrl: URL;
  try {
    pageUrl = new URL(modelUrl);
  } catch (error: unknown) {
    throw new Error("MakerWorld model URL is malformed", { cause: error });
  }
  const resolvedDependencies: RemoteImageDependencies = {
    fetch: dependencies.fetch ?? globalThis.fetch,
    lookup: dependencies.lookup ?? dnsLookup,
  };

  const page = await fetchWithPolicy(pageUrl, "page", resolvedDependencies);
  requireSuccessfulStatus(page.response, "MakerWorld page");
  if (contentType(page.response) !== "text/html") {
    throw new Error("MakerWorld page did not return an HTML content type");
  }
  const htmlBytes = await readBoundedBody(page.response, HTML_BYTE_LIMIT, "MakerWorld HTML");
  const imageUrl = extractOpenGraphImage(new TextDecoder().decode(htmlBytes), page.finalUrl);
  if (!imageUrl) return null;

  const image = await fetchWithPolicy(imageUrl, "image", resolvedDependencies);
  requireSuccessfulStatus(image.response, "MakerWorld image");
  if (!IMAGE_CONTENT_TYPES.has(contentType(image.response))) {
    throw new Error("MakerWorld image did not return a supported image content type");
  }
  const bytes = await readBoundedBody(image.response, IMAGE_BYTE_LIMIT, "MakerWorld image");
  return { bytes, sourceUrl: image.finalUrl.href };
}
