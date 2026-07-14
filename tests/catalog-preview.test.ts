import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  catalogPreviewExists,
  catalogPreviewPath,
  extract3mfPreview,
  writeCatalogPreview,
} from "../lib/catalog-preview.js";

let tempDir = "";

const PNG_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);
const JPG_BYTES = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 0xff, 0xd9]);

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function zip(entries: { name: string; content: Buffer; deflate?: boolean }[]): Buffer {
  const chunks: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const name = Buffer.from(entry.name);
    const compressed = entry.deflate ? zlib.deflateRawSync(entry.content) : entry.content;
    const method = entry.deflate ? 8 : 0;
    const crc = crc32(entry.content);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(method, 8);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(entry.content.length, 22);
    local.writeUInt16LE(name.length, 26);
    chunks.push(local, name, compressed);

    const header = Buffer.alloc(46);
    header.writeUInt32LE(0x02014b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(20, 6);
    header.writeUInt16LE(method, 10);
    header.writeUInt32LE(crc, 16);
    header.writeUInt32LE(compressed.length, 20);
    header.writeUInt32LE(entry.content.length, 24);
    header.writeUInt16LE(name.length, 28);
    header.writeUInt32LE(offset, 42);
    central.push(header, name);

    offset += local.length + name.length + compressed.length;
  }

  const centralOffset = offset;
  const centralBuffer = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBuffer.length, 12);
  end.writeUInt32LE(centralOffset, 16);

  return Buffer.concat([...chunks, centralBuffer, end]);
}

function write3mf(entries: { name: string; content: Buffer; deflate?: boolean }[]): string {
  const filePath = path.join(tempDir, "model.3mf");
  fs.writeFileSync(filePath, zip(entries));
  return filePath;
}

describe("catalog preview extraction", () => {
  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "catalog-preview-"));
  });

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("extracts a standard 3MF thumbnail image", () => {
    const filePath = write3mf([{ name: "Metadata/thumbnail.png", content: PNG_BYTES }]);

    expect(extract3mfPreview(filePath)).toEqual(PNG_BYTES);
  });

  it("falls back to Bambu plate preview images", () => {
    const filePath = write3mf([
      { name: "3D/3dmodel.model", content: Buffer.from("model") },
      { name: "Metadata/plate_1.png", content: PNG_BYTES, deflate: true },
    ]);

    expect(extract3mfPreview(filePath)).toEqual(PNG_BYTES);
  });

  it("returns null when no embedded preview exists", () => {
    const filePath = write3mf([{ name: "3D/3dmodel.model", content: Buffer.from("model") }]);

    expect(extract3mfPreview(filePath)).toBeNull();
  });

  it("treats corrupt embedded previews as unavailable", () => {
    const filePath = write3mf([
      { name: "Metadata/thumbnail.png", content: PNG_BYTES, deflate: true },
    ]);
    const bytes = fs.readFileSync(filePath);
    const dataStart = 30 + Buffer.byteLength("Metadata/thumbnail.png");
    bytes[dataStart] = (bytes[dataStart] ?? 0) ^ 0xff;
    fs.writeFileSync(filePath, bytes);

    expect(extract3mfPreview(filePath)).toBeNull();
  });

  it("writes previews to a safe cache path keyed by content hash", () => {
    const contentHash = "a".repeat(64);

    const previewPath = writeCatalogPreview(contentHash, JPG_BYTES, "image/jpeg");

    expect(previewPath).toBe(catalogPreviewPath(contentHash, "image/jpeg"));
    expect(fs.readFileSync(previewPath)).toEqual(JPG_BYTES);
    expect(catalogPreviewExists(contentHash, "image/jpeg")).toBe(true);
    expect(() => catalogPreviewPath("../bad", "image/png")).toThrow(/invalid preview hash/i);
  });
});
