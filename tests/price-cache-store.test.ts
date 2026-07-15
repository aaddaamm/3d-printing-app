import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../lib/db.js";
import { readPriceCache, writePriceCache } from "../lib/price-cache-store.js";

vi.mock("../lib/db.js", () => ({
  db: {
    exec: vi.fn(),
    prepare: vi.fn(),
    transaction: vi.fn(),
  },
}));

const jobCacheOptions = {
  cacheTable: "job_price_cache" as const,
  idColumn: "job_id" as const,
  targetCountSql: "SELECT COUNT(*) AS n FROM jobs",
};

describe("price cache store", () => {
  beforeEach(() => {
    vi.mocked(db.exec).mockReset();
    vi.mocked(db.prepare).mockReset();
    vi.mocked(db.transaction).mockReset();
  });

  it("returns a complete cache as an id-to-price record", () => {
    vi.mocked(db.prepare).mockImplementation((sql: string) => {
      if (sql === jobCacheOptions.targetCountSql) return { get: () => ({ n: 2 }) } as never;
      if (sql.includes("COUNT(*)")) return { get: () => ({ n: 2 }) } as never;
      return {
        all: () => [
          { id: 1, final_price: 12.5 },
          { id: 2, final_price: 8.75 },
        ],
      } as never;
    });

    expect(readPriceCache(jobCacheOptions)).toEqual({ 1: 12.5, 2: 8.75 });
  });

  it("rejects stale, empty, or actively changing cache targets", () => {
    vi.mocked(db.prepare)
      .mockReturnValueOnce({ get: () => ({ exists: 1 }) } as never)
      .mockReturnValueOnce({ get: () => ({ n: 0 }) } as never)
      .mockReturnValueOnce({ get: () => ({ n: 1 }) } as never)
      .mockReturnValueOnce({ get: () => ({ n: 2 }) } as never);

    expect(
      readPriceCache({ ...jobCacheOptions, hasActiveSql: "SELECT 1 AS exists FROM active_jobs" }),
    ).toBeNull();
    expect(readPriceCache(jobCacheOptions)).toBeNull();
    expect(readPriceCache(jobCacheOptions)).toBeNull();
  });

  it("treats unavailable cache tables as a miss", () => {
    vi.mocked(db.prepare).mockImplementation(() => {
      throw new Error("no such table");
    });

    expect(readPriceCache(jobCacheOptions)).toBeNull();
  });

  it("replaces cached rows in one transaction", () => {
    const insertRun = vi.fn();
    vi.mocked(db.prepare).mockReturnValue({ run: insertRun } as never);
    vi.mocked(db.transaction).mockImplementation(
      (callback: (items: readonly (readonly [number, number])[]) => void) =>
        ((items: readonly (readonly [number, number])[]) => callback(items)) as never,
    );

    writePriceCache(jobCacheOptions, { 1: 12.5, 7: 4.25 });

    expect(db.exec).toHaveBeenCalledWith("DELETE FROM job_price_cache");
    expect(db.prepare).toHaveBeenCalledWith(
      "INSERT INTO job_price_cache (job_id, final_price, computed_at) VALUES (?, ?, ?)",
    );
    expect(insertRun).toHaveBeenCalledWith(1, 12.5, expect.any(String));
    expect(insertRun).toHaveBeenCalledWith(7, 4.25, expect.any(String));
  });

  it("silently tolerates unavailable cache tables while writing", () => {
    vi.mocked(db.transaction).mockImplementation(() => {
      throw new Error("no such table");
    });

    expect(() => writePriceCache(jobCacheOptions, { 1: 10 })).not.toThrow();
  });
});
