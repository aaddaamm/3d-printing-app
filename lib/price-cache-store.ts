import { db } from "./db.js";

interface ReadPriceCacheOptions {
  cacheTable: "job_price_cache" | "project_price_cache";
  idColumn: "job_id" | "project_id";
  targetCountSql: string;
  hasActiveSql?: string;
}

export function readPriceCache(options: ReadPriceCacheOptions): Record<number, number> | null {
  const { cacheTable, idColumn, targetCountSql, hasActiveSql } = options;

  try {
    if (hasActiveSql) {
      const active = db.prepare<[], { exists: number }>(hasActiveSql).get();
      if (active?.exists) return null;
    }

    const targetCount = (db.prepare(targetCountSql).get() as { n: number }).n;
    const cachedCount = (
      db.prepare(`SELECT COUNT(*) AS n FROM ${cacheTable}`).get() as { n: number }
    ).n;
    if (targetCount <= 0 || cachedCount !== targetCount) return null;

    const rows = db
      .prepare<
        [],
        { id: number; final_price: number }
      >(`SELECT ${idColumn} AS id, final_price FROM ${cacheTable}`)
      .all();
    return Object.fromEntries(rows.map((row) => [row.id, row.final_price]));
  } catch {
    // cache table unavailable (tests/older DB)
    return null;
  }
}

interface WritePriceCacheOptions {
  cacheTable: "job_price_cache" | "project_price_cache";
  idColumn: "job_id" | "project_id";
}

export function writePriceCache(
  options: WritePriceCacheOptions,
  prices: Record<number, number>,
): void {
  const { cacheTable, idColumn } = options;

  try {
    const now = new Date().toISOString();
    const entries = Object.entries(prices).map(
      ([id, finalPrice]) => [Number(id), finalPrice] as const,
    );

    const tx = db.transaction((items: readonly (readonly [number, number])[]) => {
      db.exec(`DELETE FROM ${cacheTable}`);
      const insert = db.prepare(
        `INSERT INTO ${cacheTable} (${idColumn}, final_price, computed_at) VALUES (?, ?, ?)`,
      );
      for (const [id, finalPrice] of items) insert.run(id, finalPrice, now);
    });

    tx(entries);
  } catch {
    // cache table unavailable (tests/older DB)
  }
}
