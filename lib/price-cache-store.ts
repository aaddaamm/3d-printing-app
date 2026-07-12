import { db } from "./db.js";

type PriceCacheTable = "job_price_cache" | "project_price_cache";
type PriceCacheIdColumn = "job_id" | "project_id";

const PRICE_CACHE_TABLES: Record<PriceCacheTable, PriceCacheTable> = {
  job_price_cache: "job_price_cache",
  project_price_cache: "project_price_cache",
};

const PRICE_CACHE_ID_COLUMNS: Record<PriceCacheIdColumn, PriceCacheIdColumn> = {
  job_id: "job_id",
  project_id: "project_id",
};

function safePriceCacheTable(table: PriceCacheTable): PriceCacheTable {
  return PRICE_CACHE_TABLES[table];
}

function safePriceCacheIdColumn(column: PriceCacheIdColumn): PriceCacheIdColumn {
  return PRICE_CACHE_ID_COLUMNS[column];
}

interface ReadPriceCacheOptions {
  cacheTable: PriceCacheTable;
  idColumn: PriceCacheIdColumn;
  targetCountSql: string;
  hasActiveSql?: string;
}

export function readPriceCache(options: ReadPriceCacheOptions): Record<number, number> | null {
  const { targetCountSql, hasActiveSql } = options;
  const cacheTable = safePriceCacheTable(options.cacheTable);
  const idColumn = safePriceCacheIdColumn(options.idColumn);

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
  const cacheTable = safePriceCacheTable(options.cacheTable);
  const idColumn = safePriceCacheIdColumn(options.idColumn);

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
