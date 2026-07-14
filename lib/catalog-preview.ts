import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

export type CatalogPreviewContentType = "image/png" | "image/jpeg";

const PREVIEW_DIR = path.resolve(process.env["CATALOG_PREVIEWS_DIR"] ?? "./catalog-previews");
const SAFE_HASH_RE = /^[a-f0-9]{64}$/i;
const CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50;
const END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054b50;
const LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
const ZIP_STORED = 0;
const ZIP_DEFLATED = 8;

interface ZipEntry {
  name: string;
  compressionMethod: number;
  compressedSize: number;
  uncompressedSize: number;
  localHeaderOffset: number;
}

interface CentralDirectory {
  offset: number;
  entries: number;
}

function ensurePreviewDir(): string {
  fs.mkdirSync(PREVIEW_DIR, { recursive: true });
  return PREVIEW_DIR;
}

function assertSafePreviewHash(contentHash: string): string {
  if (!SAFE_HASH_RE.test(contentHash)) {
    throw new Error(`Invalid preview hash: ${contentHash}`);
  }
  return contentHash.toLowerCase();
}

function previewExtension(contentType: CatalogPreviewContentType): "jpg" | "png" {
  return contentType === "image/jpeg" ? "jpg" : "png";
}

function assertInsidePreviewDir(candidate: string): string {
  const root = ensurePreviewDir();
  const resolved = path.resolve(candidate);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new Error(`Refusing path outside catalog preview dir: ${resolved}`);
  }
  return resolved;
}

export function catalogPreviewPath(
  contentHash: string,
  contentType: CatalogPreviewContentType = "image/png",
): string {
  const safeHash = assertSafePreviewHash(contentHash);
  return assertInsidePreviewDir(
    path.join(ensurePreviewDir(), `${safeHash}.${previewExtension(contentType)}`),
  );
}

export function catalogPreviewExists(
  contentHash: string,
  contentType: CatalogPreviewContentType = "image/png",
): boolean {
  try {
    return fs.existsSync(catalogPreviewPath(contentHash, contentType));
  } catch {
    return false;
  }
}

export function writeCatalogPreview(
  contentHash: string,
  image: Buffer,
  contentType: CatalogPreviewContentType = "image/png",
): string {
  const previewPath = catalogPreviewPath(contentHash, contentType);
  if (!fs.existsSync(previewPath)) fs.writeFileSync(previewPath, image);
  return previewPath;
}

function findCentralDirectory(buffer: Buffer): CentralDirectory | null {
  const maxCommentLength = 0xffff;
  const minOffset = Math.max(0, buffer.length - maxCommentLength - 22);
  for (let offset = buffer.length - 22; offset >= minOffset; offset--) {
    if (buffer.readUInt32LE(offset) !== END_OF_CENTRAL_DIRECTORY_SIGNATURE) continue;
    return {
      entries: buffer.readUInt16LE(offset + 10),
      offset: buffer.readUInt32LE(offset + 16),
    };
  }
  return null;
}

function readCentralDirectory(buffer: Buffer): ZipEntry[] {
  const directory = findCentralDirectory(buffer);
  if (!directory) return [];

  const entries: ZipEntry[] = [];
  let offset = directory.offset;
  for (let index = 0; index < directory.entries; index++) {
    if (offset + 46 > buffer.length) return entries;
    if (buffer.readUInt32LE(offset) !== CENTRAL_DIRECTORY_SIGNATURE) return entries;

    const compressionMethod = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const filenameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const nameStart = offset + 46;
    const nameEnd = nameStart + filenameLength;
    if (nameEnd > buffer.length) return entries;

    entries.push({
      name: buffer.toString("utf8", nameStart, nameEnd),
      compressionMethod,
      compressedSize,
      uncompressedSize,
      localHeaderOffset,
    });
    offset = nameEnd + extraLength + commentLength;
  }
  return entries;
}

function readEntry(buffer: Buffer, entry: ZipEntry): Buffer | null {
  const offset = entry.localHeaderOffset;
  if (offset + 30 > buffer.length) return null;
  if (buffer.readUInt32LE(offset) !== LOCAL_FILE_HEADER_SIGNATURE) return null;

  const filenameLength = buffer.readUInt16LE(offset + 26);
  const extraLength = buffer.readUInt16LE(offset + 28);
  const dataStart = offset + 30 + filenameLength + extraLength;
  const dataEnd = dataStart + entry.compressedSize;
  if (dataStart > buffer.length || dataEnd > buffer.length) return null;

  const compressed = buffer.subarray(dataStart, dataEnd);
  if (entry.compressionMethod === ZIP_STORED) return Buffer.from(compressed);
  if (entry.compressionMethod === ZIP_DEFLATED) {
    try {
      const inflated = zlib.inflateRawSync(compressed);
      return inflated.length === entry.uncompressedSize ? inflated : null;
    } catch {
      return null;
    }
  }
  return null;
}

function previewRank(name: string): number {
  const normalized = name.toLowerCase();
  if (normalized === "metadata/thumbnail.png") return 0;
  if (normalized === "metadata/thumbnail.jpg" || normalized === "metadata/thumbnail.jpeg") return 1;
  if (/^metadata\/plate_\d+\.png$/.test(normalized)) return 2;
  if (/^metadata\/plate_\d+\.jpe?g$/.test(normalized)) return 3;
  return 99;
}

export function previewContentType(image: Buffer): CatalogPreviewContentType | null {
  if (image[0] === 0x89 && image[1] === 0x50 && image[2] === 0x4e && image[3] === 0x47) {
    return "image/png";
  }
  if (image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff) return "image/jpeg";
  return null;
}

export function extract3mfPreview(filePath: string): Buffer | null {
  const buffer = fs.readFileSync(filePath);
  const previewEntries = readCentralDirectory(buffer)
    .filter((entry) => previewRank(entry.name) < 99)
    .sort((a, b) => previewRank(a.name) - previewRank(b.name));

  for (const entry of previewEntries) {
    const image = readEntry(buffer, entry);
    if (image && previewContentType(image)) return image;
  }
  return null;
}
