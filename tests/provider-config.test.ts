import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  loadPrintworksConfig,
  parsePrintworksConfig,
  resolveBambuToken,
  resolveBambuTokenWithSource,
} from "../lib/providers/config.js";

describe("printworks provider config", () => {
  it("parses and validates a mixed provider registry", () => {
    const config = parsePrintworksConfig({
      providers: [
        {
          id: "moonraker-shop-u1",
          type: "moonraker",
          baseUrl: "http://192.168.68.84:7125",
          printerId: "snapmaker-u1",
          name: "Snapmaker U1",
          model: "Snapmaker U1",
          syncIntervalHours: 1,
        },
        {
          id: "bambu-cloud",
          type: "bambu",
          deviceId: "p1s-001",
          syncIntervalHours: "6",
        },
      ],
    });

    expect(config.providers).toEqual([
      expect.objectContaining({
        id: "moonraker-shop-u1",
        type: "moonraker",
        baseUrl: "http://192.168.68.84:7125",
        printerId: "snapmaker-u1",
        printerName: "Snapmaker U1",
        printerModel: "Snapmaker U1",
        syncIntervalHours: 1,
      }),
      expect.objectContaining({
        id: "bambu-cloud",
        type: "bambu",
        baseUrl: "https://api.bambulab.com",
        deviceId: "p1s-001",
        syncIntervalHours: 6,
      }),
    ]);
  });

  it("reports duplicate provider ids", () => {
    expect(() =>
      parsePrintworksConfig({
        providers: [
          { id: "shop", type: "moonraker", baseUrl: "http://one.local" },
          { id: "shop", type: "moonraker", baseUrl: "http://two.local" },
        ],
      }),
    ).toThrow("Duplicate provider id: shop");
  });

  it("loads the config path from PRINTWORKS_CONFIG", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "printworks-config-"));
    const configPath = path.join(dir, "providers.json");
    fs.writeFileSync(
      configPath,
      JSON.stringify({ providers: [{ id: "u1", type: "moonraker", baseUrl: "http://u1.local" }] }),
    );

    expect(loadPrintworksConfig(undefined, { PRINTWORKS_CONFIG: configPath })).toEqual({
      providers: [
        expect.objectContaining({ id: "u1", type: "moonraker", baseUrl: "http://u1.local" }),
      ],
    });
  });

  it("keeps Bambu secrets in env-compatible sources", () => {
    const config = parsePrintworksConfig({
      providers: [{ id: "bambu", type: "bambu", tokenEnv: "SHOP_BAMBU_TOKEN" }],
    });
    const [entry] = config.providers;
    if (!entry || entry.type !== "bambu") throw new Error("expected bambu entry");

    expect(
      resolveBambuToken(entry, { SHOP_BAMBU_TOKEN: JSON.stringify({ token: "secret" }) }),
    ).toBe("secret");
  });

  it("reports the Bambu token source without exposing the token", () => {
    const config = parsePrintworksConfig({
      providers: [{ id: "bambu", type: "bambu", tokenEnv: "SHOP_BAMBU_TOKEN" }],
    });
    const [entry] = config.providers;
    if (!entry || entry.type !== "bambu") throw new Error("expected bambu entry");

    expect(resolveBambuTokenWithSource(entry, { SHOP_BAMBU_TOKEN: "secret" })).toEqual({
      token: "secret",
      source: "SHOP_BAMBU_TOKEN env",
    });
  });

  it("reads raw and JSON-wrapped tokens from regular files", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "printworks-token-"));
    const rawPath = path.join(dir, "raw-token");
    const jsonPath = path.join(dir, "json-token");
    fs.writeFileSync(rawPath, "  raw-secret\n");
    fs.writeFileSync(jsonPath, JSON.stringify({ token: " json-secret " }));

    expect(
      resolveBambuTokenWithSource({ id: "raw", type: "bambu", tokenPath: rawPath }, {}),
    ).toEqual({ token: "raw-secret", source: rawPath });
    expect(
      resolveBambuTokenWithSource({ id: "json", type: "bambu", tokenPath: jsonPath }, {}),
    ).toEqual({ token: "json-secret", source: jsonPath });
  });

  it("reports a missing token file without throwing", () => {
    const tokenPath = path.join(os.tmpdir(), "missing-printworks-token");

    expect(resolveBambuTokenWithSource({ id: "missing", type: "bambu", tokenPath }, {})).toEqual({
      token: "",
      source: tokenPath,
    });
  });

  it("rejects directories and symbolic links as token sources", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "printworks-token-safety-"));
    const tokenPath = path.join(dir, "token");
    const symlinkPath = path.join(dir, "token-link");
    fs.writeFileSync(tokenPath, "secret");
    fs.symlinkSync(tokenPath, symlinkPath);

    expect(() =>
      resolveBambuTokenWithSource({ id: "directory", type: "bambu", tokenPath: dir }, {}),
    ).toThrow("Bambu token path must point to a regular file");
    expect(() =>
      resolveBambuTokenWithSource({ id: "symlink", type: "bambu", tokenPath: symlinkPath }, {}),
    ).toThrow("Bambu token path must point to a regular file");
  });
});
