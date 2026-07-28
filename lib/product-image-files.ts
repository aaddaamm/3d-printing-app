import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp, { type OverlayOptions } from "sharp";

export type ContactSheetInput = { key: string; label: string; path: string };
declare const productContactSheetSnapshotBrand: unique symbol;
export type ProductContactSheetSnapshot = {
  readonly fingerprint: string;
  readonly inputCount: number;
  readonly [productContactSheetSnapshotBrand]: true;
};
export type StoredProductImage = {
  path: string;
  contentType: "image/webp";
  width: number;
  height: number;
  contentHash: string;
  createdOrRepaired: boolean;
};

export type StoredProductContactSheet = StoredProductImage & {
  sourceFingerprint: string;
};

export class ProductImageFileValidationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ProductImageFileValidationError";
  }
}

export class ProductImageFileSizeError extends ProductImageFileValidationError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ProductImageFileSizeError";
  }
}

const MAX_INPUT_BYTES = 10 * 1024 * 1024;
const MAX_INPUT_PIXELS = 40_000_000;
const MAX_OUTPUT_EDGE = 1600;
const MAX_CONTACT_SHEET_CELLS = 12;
const CONTACT_SHEET_COLUMNS = 3;
const CELL_WIDTH = 480;
const CELL_HEIGHT = 360;
const CELL_IMAGE_HEIGHT = 320;
const CELL_PADDING = 16;
const OWNED_FILE_RE = /^\d+\/(?:uploads|remote|contact-sheets)\/[a-f0-9]{64}\.webp$/;

type OwnedImageKind = "uploads" | "remote" | "contact-sheets";
type ContactSheetSnapshotInput = {
  key: string;
  label: string;
  bytes: Buffer;
  contentHash: string;
};

const contactSheetSnapshotData = new WeakMap<
  ProductContactSheetSnapshot,
  readonly ContactSheetSnapshotInput[]
>();

function productImagesRoot(): string {
  return path.resolve(process.env.PRODUCT_IMAGES_DIR ?? "./product-images");
}

function assertPositiveId(value: number, label: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new ProductImageFileValidationError(`${label} must be a positive integer`);
  }
}

function assertContained(root: string, candidate: string): string {
  const resolvedRoot = path.resolve(root);
  const resolvedCandidate = path.resolve(candidate);
  const relative = path.relative(resolvedRoot, resolvedCandidate);
  if (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative))
  ) {
    return resolvedCandidate;
  }
  throw new Error(
    `Refusing app-owned image operation outside ${resolvedRoot}: ${resolvedCandidate}`,
  );
}

function ensureRegularDirectory(directory: string): void {
  const root = productImagesRoot();
  assertContained(root, directory);
  fs.mkdirSync(root, { recursive: true });
  const rootStat = fs.lstatSync(root);
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) {
    throw new Error(`Product images root is not a regular directory: ${root}`);
  }
  const canonicalRoot = fs.realpathSync(root);

  const relative = path.relative(root, directory);
  let current = root;
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    current = assertContained(root, path.join(current, segment));
    try {
      const stat = fs.lstatSync(current);
      if (!stat.isDirectory() || stat.isSymbolicLink()) {
        throw new Error(`App-owned image directory is not a regular directory: ${current}`);
      }
    } catch (error: unknown) {
      if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") throw error;
      fs.mkdirSync(current);
    }
    assertContained(canonicalRoot, fs.realpathSync(current));
  }
}

function ownedImagePath(productId: number, kind: OwnedImageKind, contentHash: string): string {
  assertPositiveId(productId, "productId");
  if (!/^[a-f0-9]{64}$/.test(contentHash)) throw new Error("Invalid product image content hash");
  const root = productImagesRoot();
  const directory = assertContained(root, path.join(root, String(productId), kind));
  ensureRegularDirectory(directory);
  return assertContained(root, path.join(directory, `${contentHash}.webp`));
}

function atomicWriteOwnedFile(filePath: string, bytes: Uint8Array): boolean {
  const root = productImagesRoot();
  const target = assertContained(root, filePath);
  const directory = path.dirname(target);
  ensureRegularDirectory(directory);

  let existingDescriptor: number | null = null;
  try {
    existingDescriptor = fs.openSync(
      target,
      fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK,
    );
    const existing = fs.fstatSync(existingDescriptor);
    if (!existing.isFile()) {
      throw new Error(`App-owned image target is not a regular file: ${target}`);
    }
    if (
      existing.size === bytes.byteLength &&
      sha256(fs.readFileSync(existingDescriptor)) === sha256(bytes)
    ) {
      return false;
    }
  } catch (error: unknown) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") throw error;
  } finally {
    if (existingDescriptor !== null) fs.closeSync(existingDescriptor);
  }

  const temporary = assertContained(
    root,
    path.join(directory, `.${path.basename(target)}.${process.pid}.${randomUUID()}.tmp`),
  );
  try {
    fs.writeFileSync(temporary, bytes, { flag: "wx", mode: 0o600 });
    ensureRegularDirectory(directory);
    const temporaryStat = fs.lstatSync(temporary);
    if (!temporaryStat.isFile() || temporaryStat.isSymbolicLink()) {
      throw new Error(`App-owned temporary image is not a regular file: ${temporary}`);
    }
    try {
      const targetStat = fs.lstatSync(target);
      if (!targetStat.isFile() || targetStat.isSymbolicLink()) {
        throw new Error(`App-owned image target is not a regular file: ${target}`);
      }
    } catch (error: unknown) {
      if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") throw error;
    }
    fs.renameSync(temporary, target);
    return true;
  } catch (error) {
    try {
      const stat = fs.lstatSync(temporary);
      if (stat.isFile() && !stat.isSymbolicLink()) fs.rmSync(temporary);
    } catch {
      // Nothing to clean up.
    }
    throw error;
  }
}

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

async function normalizeImage(bytes: Uint8Array): Promise<{
  bytes: Buffer;
  width: number;
  height: number;
  contentHash: string;
}> {
  if (bytes.byteLength === 0) throw new ProductImageFileValidationError("Image bytes are required");
  if (bytes.byteLength > MAX_INPUT_BYTES) {
    throw new ProductImageFileSizeError("Image exceeds the 10 MiB byte limit");
  }

  try {
    const result = await sharp(Buffer.from(bytes), {
      failOn: "error",
      limitInputPixels: MAX_INPUT_PIXELS,
    })
      .rotate()
      .resize(MAX_OUTPUT_EDGE, MAX_OUTPUT_EDGE, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85, effort: 4 })
      .toBuffer({ resolveWithObject: true });
    if (!result.info.width || !result.info.height)
      throw new Error("Image dimensions are unavailable");
    return {
      bytes: result.data,
      width: result.info.width,
      height: result.info.height,
      contentHash: sha256(result.data),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (/pixel limit|exceeds? pixel/i.test(message)) {
      throw new ProductImageFileSizeError(
        `Invalid image or decoded pixel limit exceeded: ${message}`,
        { cause: error },
      );
    }
    throw new ProductImageFileValidationError(
      `Invalid image or decoded pixel limit exceeded: ${message}`,
      { cause: error },
    );
  }
}

async function storeNormalizedProductImage(
  productId: number,
  kind: "uploads" | "remote",
  bytes: Uint8Array,
): Promise<StoredProductImage> {
  const normalized = await normalizeImage(bytes);
  const filePath = ownedImagePath(productId, kind, normalized.contentHash);
  const createdOrRepaired = atomicWriteOwnedFile(filePath, normalized.bytes);
  return {
    path: filePath,
    contentType: "image/webp",
    width: normalized.width,
    height: normalized.height,
    contentHash: normalized.contentHash,
    createdOrRepaired,
  };
}

export async function storeUploadedProductImage(
  productId: number,
  bytes: Uint8Array,
): Promise<StoredProductImage> {
  return storeNormalizedProductImage(productId, "uploads", bytes);
}

export async function storeRemoteProductImage(
  productId: number,
  sourceUrl: string,
  bytes: Uint8Array,
): Promise<StoredProductImage> {
  let url: URL;
  try {
    url = new URL(sourceUrl);
  } catch {
    throw new ProductImageFileValidationError("Remote product image source must be an HTTP(S) URL");
  }
  if ((url.protocol !== "http:" && url.protocol !== "https:") || !url.hostname) {
    throw new ProductImageFileValidationError("Remote product image source must be an HTTP(S) URL");
  }
  return storeNormalizedProductImage(productId, "remote", bytes);
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function normalizedContactSheetInputs(inputs: ContactSheetInput[]): ContactSheetInput[] {
  const unique = new Map<string, ContactSheetInput>();
  for (const input of inputs) {
    const normalized = {
      key: input.key.trim(),
      label: input.label.trim().slice(0, 120),
      path: path.resolve(input.path),
    };
    if (normalized.key !== "" && !unique.has(normalized.key)) {
      unique.set(normalized.key, normalized);
    }
  }
  if (unique.size > MAX_CONTACT_SHEET_CELLS) {
    throw new Error(`Contact sheets support at most ${MAX_CONTACT_SHEET_CELLS} unique images`);
  }
  return [...unique.values()];
}

function readRegularInput(filePath: string): Buffer {
  let descriptor: number;
  try {
    descriptor = fs.openSync(filePath, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  } catch (error) {
    throw new Error(`Contact-sheet image is unavailable, non-regular, or a symlink: ${filePath}`, {
      cause: error,
    });
  }

  try {
    const stat = fs.fstatSync(descriptor);
    if (!stat.isFile()) {
      throw new Error(`Contact-sheet image is not a regular file: ${filePath}`);
    }
    if (stat.size > MAX_INPUT_BYTES) {
      throw new Error(`Contact-sheet image exceeds the 10 MiB byte limit: ${filePath}`);
    }
    const bytes = fs.readFileSync(descriptor);
    if (bytes.byteLength > MAX_INPUT_BYTES) {
      throw new Error(`Contact-sheet image exceeds the 10 MiB byte limit: ${filePath}`);
    }
    return bytes;
  } finally {
    fs.closeSync(descriptor);
  }
}

function fingerprintContactSheetSnapshotInputs(
  inputs: readonly ContactSheetSnapshotInput[],
): string {
  const fingerprint = createHash("sha256");
  for (const input of inputs) {
    const key = Buffer.from(input.key);
    const label = Buffer.from(input.label);
    fingerprint.update(String(key.byteLength)).update(":").update(key);
    fingerprint.update(String(label.byteLength)).update(":").update(label);
    fingerprint.update(input.contentHash);
  }
  return fingerprint.digest("hex");
}

export function createProductContactSheetSnapshot(
  inputs: ContactSheetInput[],
): ProductContactSheetSnapshot {
  const snapshotInputs: ContactSheetSnapshotInput[] = [];
  const seenContent = new Set<string>();
  for (const input of normalizedContactSheetInputs(inputs)) {
    const bytes = Buffer.from(readRegularInput(input.path));
    const contentHash = sha256(bytes);
    if (seenContent.has(contentHash)) continue;
    seenContent.add(contentHash);
    snapshotInputs.push({
      key: input.key,
      label: input.label,
      bytes,
      contentHash,
    });
  }
  const snapshot = Object.freeze({
    fingerprint: fingerprintContactSheetSnapshotInputs(snapshotInputs),
    inputCount: snapshotInputs.length,
  }) as ProductContactSheetSnapshot;
  contactSheetSnapshotData.set(snapshot, snapshotInputs);
  return snapshot;
}

export function fingerprintProductContactSheetInputs(inputs: ContactSheetInput[]): string {
  return createProductContactSheetSnapshot(inputs).fingerprint;
}

export function appOwnedProductImageContentHash(
  filePath: string,
  expectedKind?: OwnedImageKind,
): string {
  const root = productImagesRoot();
  const target = assertContained(root, filePath);
  const relative = path.relative(root, target).split(path.sep).join("/");
  if (!OWNED_FILE_RE.test(relative)) {
    throw new Error(`Refusing to hash a non-owned product image path: ${target}`);
  }
  const [, actualKind] = relative.split("/");
  if (expectedKind && actualKind !== expectedKind) {
    throw new Error(`App-owned product image has the wrong storage kind: ${target}`);
  }
  return sha256(readRegularInput(target));
}

export async function generateProductContactSheet(
  productId: number,
  batchId: number,
  snapshot: ProductContactSheetSnapshot,
): Promise<StoredProductContactSheet | null> {
  assertPositiveId(productId, "productId");
  assertPositiveId(batchId, "batchId");
  const snapshotInputs = contactSheetSnapshotData.get(snapshot);
  if (!snapshotInputs) {
    throw new ProductImageFileValidationError("Invalid Product contact-sheet snapshot");
  }
  if (snapshotInputs.length < 2) return null;

  const columns = Math.min(CONTACT_SHEET_COLUMNS, snapshotInputs.length);
  const rows = Math.ceil(snapshotInputs.length / columns);
  const width = columns * CELL_WIDTH;
  const height = rows * CELL_HEIGHT;
  if (Math.max(width, height) > MAX_OUTPUT_EDGE) {
    throw new Error(`Contact sheet output exceeds ${MAX_OUTPUT_EDGE} pixels`);
  }

  const composites: OverlayOptions[] = [];
  for (const [index, input] of snapshotInputs.entries()) {
    const image = await sharp(input.bytes, {
      failOn: "error",
      limitInputPixels: MAX_INPUT_PIXELS,
    })
      .rotate()
      .resize(CELL_WIDTH - CELL_PADDING * 2, CELL_IMAGE_HEIGHT - CELL_PADDING * 2, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 4 })
      .toBuffer({ resolveWithObject: true });
    const column = index % columns;
    const row = Math.floor(index / columns);
    composites.push({
      input: image.data,
      left: column * CELL_WIDTH + Math.floor((CELL_WIDTH - image.info.width) / 2),
      top: row * CELL_HEIGHT + Math.floor((CELL_IMAGE_HEIGHT - image.info.height) / 2),
    });
    const label = escapeXml(input.label || input.key);
    composites.push({
      input: Buffer.from(
        `<svg width="${CELL_WIDTH - CELL_PADDING * 2}" height="32" xmlns="http://www.w3.org/2000/svg"><text x="0" y="22" fill="#20242a" font-family="sans-serif" font-size="18">${label}</text></svg>`,
      ),
      left: column * CELL_WIDTH + CELL_PADDING,
      top: row * CELL_HEIGHT + CELL_IMAGE_HEIGHT + 4,
    });
  }

  const result = await sharp({
    create: { width, height, channels: 3, background: "#eceff1" },
  })
    .composite(composites)
    .webp({ quality: 85, effort: 4 })
    .toBuffer({ resolveWithObject: true });
  const contentHash = sha256(result.data);
  const filePath = ownedImagePath(productId, "contact-sheets", contentHash);
  const createdOrRepaired = atomicWriteOwnedFile(filePath, result.data);
  return {
    path: filePath,
    contentType: "image/webp",
    width: result.info.width,
    height: result.info.height,
    contentHash,
    createdOrRepaired,
    sourceFingerprint: snapshot.fingerprint,
  };
}

export function removeAppOwnedProductImage(filePath: string): void {
  const root = productImagesRoot();
  const target = assertContained(root, filePath);

  try {
    const stat = fs.lstatSync(target);
    if (!stat.isFile() || stat.isSymbolicLink()) {
      throw new Error(`Refusing to remove a non-regular or symlink product image: ${target}`);
    }
    const relative = path.relative(root, target).split(path.sep).join("/");
    if (!OWNED_FILE_RE.test(relative)) {
      throw new Error(`Refusing to remove a non-owned product image path: ${target}`);
    }
    fs.rmSync(target);
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return;
    throw error;
  }
}
