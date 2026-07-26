import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ProductImageFileSizeError,
  ProductImageFileValidationError,
  createProductContactSheetSnapshot,
  generateProductContactSheet,
  removeAppOwnedProductImage,
  storeRemoteProductImage,
  storeUploadedProductImage,
} from "../lib/product-image-files.js";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

let tempDir = "";
let imagesDir = "";

async function png(width: number, height: number, color: string): Promise<Buffer> {
  return sharp({
    create: { width, height, channels: 4, background: color },
  })
    .png()
    .toBuffer();
}

describe.sequential("product image files", () => {
  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "product-image-files-"));
    imagesDir = path.join(tempDir, "owned");
    process.env.PRODUCT_IMAGES_DIR = imagesDir;
  });

  afterEach(() => {
    delete process.env.PRODUCT_IMAGES_DIR;
    if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("normalizes uploads to bounded metadata-free WebP under the owned root", async () => {
    const input = await sharp(await png(2000, 1000, "#ff0000"))
      .withMetadata({ orientation: 6 })
      .png()
      .toBuffer();

    const stored = await storeUploadedProductImage(7, input);
    const metadata = await sharp(stored.path).metadata();

    expect(path.isAbsolute(stored.path)).toBe(true);
    expect(path.relative(imagesDir, stored.path)).not.toMatch(/^\.\.(?:\/|\\|$)/);
    expect(fs.lstatSync(stored.path).isFile()).toBe(true);
    expect(stored).toMatchObject({
      contentType: "image/webp",
      width: expect.any(Number),
      height: expect.any(Number),
      contentHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      createdOrRepaired: true,
    });
    expect(metadata).toMatchObject({
      format: "webp",
      width: stored.width,
      height: stored.height,
    });
    expect(metadata).not.toHaveProperty("orientation");
    expect(metadata).not.toHaveProperty("comments");
    expect(Math.max(stored.width, stored.height)).toBeLessThanOrEqual(1600);
    expect(fs.readdirSync(path.dirname(stored.path))).toEqual([path.basename(stored.path)]);
  });

  it("rejects invalid, byte-oversize, and decoded-pixel-oversize uploads without output", async () => {
    await expect(
      storeUploadedProductImage(1, new TextEncoder().encode("not an image")),
    ).rejects.toBeInstanceOf(ProductImageFileValidationError);
    await expect(
      storeUploadedProductImage(1, new Uint8Array(MAX_UPLOAD_BYTES + 1)),
    ).rejects.toBeInstanceOf(ProductImageFileSizeError);
    const pixelBomb = await png(6400, 6400, "#ffffff");
    await expect(storeUploadedProductImage(1, pixelBomb)).rejects.toThrow(/pixel|limit/i);

    expect(fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir, { recursive: true }) : []).toEqual(
      [],
    );
  });

  it("atomically repairs an invalid pre-existing content-addressed output", async () => {
    const bytes = await png(30, 20, "#abcdef");
    const first = await storeUploadedProductImage(9, bytes);
    fs.writeFileSync(first.path, "corrupt");

    const repaired = await storeUploadedProductImage(9, bytes);

    expect(repaired).toMatchObject({
      path: first.path,
      contentHash: first.contentHash,
      createdOrRepaired: true,
    });
    expect((await sharp(repaired.path).metadata()).format).toBe("webp");
    expect(fs.readdirSync(path.dirname(repaired.path))).toEqual([path.basename(repaired.path)]);
  });

  it("stores remote bytes as normalized content-addressed WebP without fetching", async () => {
    const bytes = await png(120, 80, "#224466");
    const first = await storeRemoteProductImage(2, "https://example.test/photo.png", bytes);
    const second = await storeRemoteProductImage(2, "https://example.test/photo.png", bytes);

    expect(first).toMatchObject({ createdOrRepaired: true });
    expect(second).toMatchObject({
      path: first.path,
      contentHash: first.contentHash,
      createdOrRepaired: false,
    });
    expect((await sharp(first.path).metadata()).format).toBe("webp");
    expect(first.path).toContain(`${path.sep}2${path.sep}remote${path.sep}`);
  });

  it("generates deterministic deduplicated content-addressed contact sheets", async () => {
    const plateAPath = path.join(tempDir, "plate-a.png");
    const plateBPath = path.join(tempDir, "plate-b.png");
    await sharp(await png(800, 600, "#cc0000")).toFile(plateAPath);
    await sharp(await png(600, 800, "#0000cc")).toFile(plateBPath);
    const plateA = { key: "plate:a", label: 'A <plate> & "one"', path: plateAPath };
    const plateB = { key: "plate:b", label: "B's plate", path: plateBPath };

    const firstSnapshot = createProductContactSheetSnapshot([plateA, plateB, plateA]);
    const secondSnapshot = createProductContactSheetSnapshot([plateB, plateA]);
    const first = await generateProductContactSheet(3, 8, firstSnapshot);
    const second = await generateProductContactSheet(3, 8, secondSnapshot);

    expect(first).not.toBeNull();
    expect(firstSnapshot.fingerprint).toBe(secondSnapshot.fingerprint);
    expect(first).toMatchObject({
      createdOrRepaired: true,
      sourceFingerprint: firstSnapshot.fingerprint,
    });
    expect(second).toMatchObject({
      path: first!.path,
      contentHash: first!.contentHash,
      sourceFingerprint: secondSnapshot.fingerprint,
      createdOrRepaired: false,
    });
    expect(first!.path).toContain(`${path.sep}3${path.sep}contact-sheets${path.sep}`);
    expect(await sharp(first!.path).metadata()).toMatchObject({ format: "webp" });
    expect(Math.max(first!.width, first!.height)).toBeLessThanOrEqual(1600);
  });

  it("renders only from immutable snapshot bytes after source paths disappear", async () => {
    const plateAPath = path.join(tempDir, "snapshot-a.png");
    const plateBPath = path.join(tempDir, "snapshot-b.png");
    await sharp(await png(100, 80, "#117799")).toFile(plateAPath);
    await sharp(await png(80, 100, "#991177")).toFile(plateBPath);
    const snapshot = createProductContactSheetSnapshot([
      { key: "snapshot:a", label: "Snapshot A", path: plateAPath },
      { key: "snapshot:b", label: "Snapshot B", path: plateBPath },
    ]);
    fs.rmSync(plateAPath);
    fs.rmSync(plateBPath);

    const stored = await generateProductContactSheet(5, 9, snapshot);

    expect(stored).toMatchObject({
      sourceFingerprint: snapshot.fingerprint,
      contentType: "image/webp",
    });
    expect((await sharp(stored!.path).metadata()).format).toBe("webp");
  });

  it("rejects byte-oversize and symlink contact-sheet inputs", async () => {
    const validPath = path.join(tempDir, "valid.png");
    const oversizedPath = path.join(tempDir, "oversized.png");
    const symlinkPath = path.join(tempDir, "linked.png");
    await sharp(await png(40, 40, "#999999")).toFile(validPath);
    fs.writeFileSync(oversizedPath, new Uint8Array(MAX_UPLOAD_BYTES + 1));
    fs.symlinkSync(validPath, symlinkPath);

    expect(() =>
      createProductContactSheetSnapshot([
        { key: "oversized", label: "oversized", path: oversizedPath },
        { key: "valid", label: "valid", path: validPath },
      ]),
    ).toThrow(/10 MiB/i);
    expect(() =>
      createProductContactSheetSnapshot([
        { key: "linked", label: "linked", path: symlinkPath },
        { key: "valid", label: "valid", path: validPath },
      ]),
    ).toThrow(/regular|symlink/i);
  });

  it("skips sheets with fewer than two unique inputs and bounds the cell count", async () => {
    const filePath = path.join(tempDir, "plate.png");
    await sharp(await png(40, 40, "#999999")).toFile(filePath);
    const single = { key: "same", label: "same", path: filePath };

    const singleSnapshot = createProductContactSheetSnapshot([single, single]);
    await expect(generateProductContactSheet(1, 1, singleSnapshot)).resolves.toBeNull();
    expect(() =>
      createProductContactSheetSnapshot(
        Array.from({ length: 13 }, (_, index) => ({
          key: String(index),
          label: String(index),
          path: filePath,
        })),
      ),
    ).toThrow(/12/);
  });

  it("removes only regular files contained by the app-owned root", async () => {
    const stored = await storeUploadedProductImage(4, await png(20, 20, "#123456"));
    const outside = path.join(tempDir, "outside.webp");
    fs.writeFileSync(outside, "outside");
    const symlink = path.join(path.dirname(stored.path), "link.webp");
    fs.symlinkSync(outside, symlink);

    expect(() => removeAppOwnedProductImage(outside)).toThrow(/outside/i);
    expect(() => removeAppOwnedProductImage(symlink)).toThrow(/regular|symlink/i);
    expect(fs.existsSync(outside)).toBe(true);
    removeAppOwnedProductImage(stored.path);
    expect(fs.existsSync(stored.path)).toBe(false);
  });
});
