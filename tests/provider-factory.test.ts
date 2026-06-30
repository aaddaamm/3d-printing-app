import { describe, expect, it } from "vitest";
import { createConfiguredProvider } from "../lib/providers/factory.js";

function providerConfig() {
  return {
    id: "moonraker-shop-u1",
    type: "moonraker" as const,
    baseUrl: "http://snapmaker-u1.local",
    printerId: "snapmaker-u1",
    name: "Shop U1",
    model: "Snapmaker U1",
    limit: 25,
  };
}

describe("provider factory", () => {
  it("creates configured Moonraker provider instances", async () => {
    const { config, provider } = createConfiguredProvider(providerConfig());

    expect(config.id).toBe("moonraker-shop-u1");
    expect(provider).toMatchObject({
      id: "moonraker",
      display_name: "Moonraker",
    });
    await expect(provider.listPrinters()).resolves.toEqual([
      {
        provider_id: "moonraker",
        provider_printer_id: "snapmaker-u1",
        name: "Shop U1",
        model: "Snapmaker U1",
      },
    ]);
  });

  it("creates configured Bambu provider instances from env token", () => {
    const { provider } = createConfiguredProvider(
      {
        id: "bambu-cloud",
        type: "bambu",
        baseUrl: "https://api.bambulab.com",
        tokenEnv: "SHOP_BAMBU_TOKEN",
        deviceId: "p1s-001",
        limit: 10,
      },
      { SHOP_BAMBU_TOKEN: "secret" },
    );

    expect(provider).toMatchObject({
      id: "bambu",
      display_name: "Bambu Lab",
    });
  });
});
