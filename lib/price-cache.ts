import { db } from "./db.js";

export function invalidateAllPriceCaches(): void {
  try {
    db.exec("DELETE FROM job_price_cache; DELETE FROM project_price_cache;");
  } catch {
    // no-op in tests or during partial bootstrap
  }
}

export function invalidateJobPriceCache(jobId: number): void {
  try {
    db.prepare("DELETE FROM job_price_cache WHERE job_id = ?").run(jobId);
  } catch {
    // no-op in tests or during partial bootstrap
  }
}

export function invalidateProjectPriceCache(): void {
  try {
    db.exec("DELETE FROM project_price_cache;");
  } catch {
    // no-op in tests or during partial bootstrap
  }
}
