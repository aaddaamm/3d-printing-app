import { db } from "../lib/db.js";
import type { PrinterRow } from "../lib/types.js";

export type PrinterInventoryRow = PrinterRow & {
  provider_display_name: string | null;
  job_count: number;
  task_count: number;
  total_time_s: number | null;
  total_weight_g: number | null;
  first_print_at: string | null;
  last_print_at: string | null;
};

export type PrinterPatch = {
  name?: string | null | undefined;
  model?: string | null | undefined;
  serial?: string | null | undefined;
  is_active?: boolean | undefined;
  notes?: string | null | undefined;
};

export function listPrinters({ includeRetired = true } = {}): PrinterInventoryRow[] {
  const where = includeRetired ? "" : "WHERE p.is_active = 1";
  return db
    .prepare<[], PrinterInventoryRow>(
      `SELECT
        p.*,
        providers.display_name AS provider_display_name,
        COALESCE(job_totals.job_count, 0) AS job_count,
        COALESCE(task_totals.task_count, 0) AS task_count,
        job_totals.total_time_s,
        job_totals.total_weight_g,
        job_totals.first_print_at,
        job_totals.last_print_at
       FROM printers p
       LEFT JOIN providers ON providers.id = p.provider
       LEFT JOIN (
         SELECT
           printer_id,
           COUNT(*) AS job_count,
           SUM(CASE WHEN status = 'finish' THEN COALESCE(total_time_s, 0) ELSE 0 END) AS total_time_s,
           SUM(CASE WHEN status = 'finish' THEN COALESCE(total_weight_g, 0) ELSE 0 END) AS total_weight_g,
           MIN(startTime) AS first_print_at,
           MAX(startTime) AS last_print_at
         FROM jobs
         WHERE printer_id IS NOT NULL
         GROUP BY printer_id
       ) job_totals ON job_totals.printer_id = p.id
       LEFT JOIN (
         SELECT printer_id, COUNT(*) AS task_count
         FROM print_tasks
         WHERE printer_id IS NOT NULL
         GROUP BY printer_id
       ) task_totals ON task_totals.printer_id = p.id
       ${where}
       ORDER BY p.is_active DESC, last_print_at DESC, p.name COLLATE NOCASE`,
    )
    .all();
}

export function getPrinterById(id: number): PrinterInventoryRow | undefined {
  return db
    .prepare<[number], PrinterInventoryRow>(
      `SELECT
        p.*,
        providers.display_name AS provider_display_name,
        COALESCE(job_totals.job_count, 0) AS job_count,
        COALESCE(task_totals.task_count, 0) AS task_count,
        job_totals.total_time_s,
        job_totals.total_weight_g,
        job_totals.first_print_at,
        job_totals.last_print_at
       FROM printers p
       LEFT JOIN providers ON providers.id = p.provider
       LEFT JOIN (
         SELECT
           printer_id,
           COUNT(*) AS job_count,
           SUM(CASE WHEN status = 'finish' THEN COALESCE(total_time_s, 0) ELSE 0 END) AS total_time_s,
           SUM(CASE WHEN status = 'finish' THEN COALESCE(total_weight_g, 0) ELSE 0 END) AS total_weight_g,
           MIN(startTime) AS first_print_at,
           MAX(startTime) AS last_print_at
         FROM jobs
         WHERE printer_id IS NOT NULL
         GROUP BY printer_id
       ) job_totals ON job_totals.printer_id = p.id
       LEFT JOIN (
         SELECT printer_id, COUNT(*) AS task_count
         FROM print_tasks
         WHERE printer_id IS NOT NULL
         GROUP BY printer_id
       ) task_totals ON task_totals.printer_id = p.id
       WHERE p.id = ?`,
    )
    .get(id);
}

function nextNullableString<T extends string>(
  next: T | null | undefined,
  current: T | null,
): T | null {
  if (next !== undefined) return next ?? null;
  return current;
}

export function patchPrinter(id: number, patch: PrinterPatch): PrinterInventoryRow | undefined {
  const existing = getPrinterById(id);
  if (!existing) return undefined;

  const isActive = patch.is_active ?? existing.is_active === 1;
  const retiredAt = isActive ? null : (existing.retired_at ?? new Date().toISOString());

  db.prepare(
    `UPDATE printers SET
      name = @name,
      model = @model,
      serial = @serial,
      is_active = @is_active,
      retired_at = @retired_at,
      notes = @notes,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = @id`,
  ).run({
    id,
    name: nextNullableString(patch.name, existing.name),
    model: nextNullableString(patch.model, existing.model),
    serial: nextNullableString(patch.serial, existing.serial),
    is_active: isActive ? 1 : 0,
    retired_at: retiredAt,
    notes: nextNullableString(patch.notes, existing.notes),
  });

  return getPrinterById(id);
}
