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
        COUNT(DISTINCT j.id) AS job_count,
        COUNT(DISTINCT pt.id) AS task_count,
        SUM(CASE WHEN j.status = 'finish' THEN COALESCE(j.total_time_s, 0) ELSE 0 END) AS total_time_s,
        SUM(CASE WHEN j.status = 'finish' THEN COALESCE(j.total_weight_g, 0) ELSE 0 END) AS total_weight_g,
        MIN(j.startTime) AS first_print_at,
        MAX(j.startTime) AS last_print_at
       FROM printers p
       LEFT JOIN providers ON providers.id = p.provider
       LEFT JOIN jobs j ON j.printer_id = p.id
       LEFT JOIN print_tasks pt ON pt.printer_id = p.id
       ${where}
       GROUP BY p.id
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
        COUNT(DISTINCT j.id) AS job_count,
        COUNT(DISTINCT pt.id) AS task_count,
        SUM(CASE WHEN j.status = 'finish' THEN COALESCE(j.total_time_s, 0) ELSE 0 END) AS total_time_s,
        SUM(CASE WHEN j.status = 'finish' THEN COALESCE(j.total_weight_g, 0) ELSE 0 END) AS total_weight_g,
        MIN(j.startTime) AS first_print_at,
        MAX(j.startTime) AS last_print_at
       FROM printers p
       LEFT JOIN providers ON providers.id = p.provider
       LEFT JOIN jobs j ON j.printer_id = p.id
       LEFT JOIN print_tasks pt ON pt.printer_id = p.id
       WHERE p.id = ?
       GROUP BY p.id`,
    )
    .get(id);
}

function nextNullableString<T extends string>(next: T | null | undefined, current: T | null): T | null {
  if (next !== undefined) return next ?? null;
  return current;
}

export function patchPrinter(id: number, patch: PrinterPatch): PrinterInventoryRow | undefined {
  const existing = getPrinterById(id);
  if (!existing) return undefined;

  const isActive = patch.is_active ?? existing.is_active === 1;
  const retiredAt = isActive
    ? null
    : existing.retired_at ?? new Date().toISOString();

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
