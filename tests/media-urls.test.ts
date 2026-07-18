import { describe, expect, it } from "vitest";
import { moonrakerFileMediaUrl, providerRemoteMediaUrl } from "../lib/media-urls.js";

describe("moonrakerFileMediaUrl", () => {
  it("keeps absolute HTTP URLs unchanged", () => {
    expect(moonrakerFileMediaUrl("printer.local", "folder/job.gcode", "https://cdn.example/a.png"))
      .toBe("https://cdn.example/a.png");
  });

  it("resolves relative thumbnail paths beside the gcode file", () => {
    expect(moonrakerFileMediaUrl("printer.local", "folder/job.gcode", "thumbs/job.png"))
      .toBe("http://printer.local/server/files/gcodes/folder/thumbs/job.png");
  });

  it("resolves absolute Moonraker paths from the gcodes root", () => {
    expect(moonrakerFileMediaUrl("printer.local", "folder/job.gcode", "/thumbs/job.png"))
      .toBe("http://printer.local/server/files/gcodes/thumbs/job.png");
  });

  it("encodes path segments without encoding slashes", () => {
    expect(moonrakerFileMediaUrl("printer.local", "folder with spaces/job.gcode", "ü thumb.png"))
      .toBe("http://printer.local/server/files/gcodes/folder%20with%20spaces/%C3%BC%20thumb.png");
  });
});

describe("providerRemoteMediaUrl", () => {
  it("returns null for Bambu because Bambu covers are served through the local cache", () => {
    expect(
      providerRemoteMediaUrl({
        provider: "bambu",
        providerPrinterId: "printer.local",
        filename: "job.gcode",
        thumbnail: null,
        cover: "https://cover",
      }),
    ).toBeNull();
  });

  it("resolves Moonraker thumbnail paths", () => {
    expect(
      providerRemoteMediaUrl({
        provider: "moonraker",
        providerPrinterId: "printer.local",
        filename: "folder/job.gcode",
        thumbnail: "thumb.png",
        cover: null,
      }),
    ).toBe("http://printer.local/server/files/gcodes/folder/thumb.png");
  });

  it("uses absolute URLs for generic providers", () => {
    expect(
      providerRemoteMediaUrl({
        provider: "other",
        providerPrinterId: null,
        filename: "job.gcode",
        thumbnail: null,
        cover: "https://example.com/cover.png",
      }),
    ).toBe("https://example.com/cover.png");
  });

  it("rejects relative URLs for generic providers", () => {
    expect(
      providerRemoteMediaUrl({
        provider: "other",
        providerPrinterId: null,
        filename: "job.gcode",
        thumbnail: "thumb.png",
        cover: null,
      }),
    ).toBeNull();
  });
});
