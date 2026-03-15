import { db } from "../lib/db.js";

export interface DeviceSummary {
  deviceModel: string | null;
  total_jobs: number;
  total_plates: number | null;
  total_weight_g: number | null;
  total_time_s: number | null;
}

export function getSummary(): {
  totals: {
    total_jobs: number;
    total_plates: number;
    total_weight_g: number;
    total_time_s: number;
  };
  by_device: DeviceSummary[];
} {
  const by_device = db
    .prepare<[], DeviceSummary>(
      `SELECT
        deviceModel,
        COUNT(*)                       AS total_jobs,
        SUM(plate_count)               AS total_plates,
        ROUND(SUM(total_weight_g), 2)  AS total_weight_g,
        SUM(total_time_s)              AS total_time_s
      FROM jobs
      GROUP BY deviceModel
      ORDER BY total_jobs DESC`,
    )
    .all();

  const totals = by_device.reduce(
    (acc, row) => {
      acc.total_jobs += row.total_jobs;
      acc.total_plates += row.total_plates ?? 0;
      acc.total_weight_g += row.total_weight_g ?? 0;
      acc.total_time_s += row.total_time_s ?? 0;
      return acc;
    },
    { total_jobs: 0, total_plates: 0, total_weight_g: 0, total_time_s: 0 },
  );

  totals.total_weight_g = Math.round(totals.total_weight_g * 100) / 100;

  return { totals, by_device };
}
