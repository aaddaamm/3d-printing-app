import { Hono } from "hono";
import {
  ConcurrentConfiguredProviderSyncError,
  runConfiguredProviderSync,
} from "../lib/configured-provider-sync.js";

export const sync = new Hono();

sync.post("/", async (c) => {
  try {
    const result = await runConfiguredProviderSync();
    const { downloaded, skipped, expired, failed } = result.covers;
    return c.json({
      providers: result.providers.map(({ id, inserted, updated }) => ({ id, inserted, updated })),
      covers: { downloaded, skipped, expired, failed },
    });
  } catch (error) {
    if (error instanceof ConcurrentConfiguredProviderSyncError) {
      return c.json({ error: "A sync is already running." }, 409);
    }
    return c.json({ error: "Sync failed." }, 500);
  }
});
