import { db } from "../lib/db.js";
import { localCoverExists } from "../lib/covers.js";

export interface UiJobRow {
  id: number;
  session_id: string;
  instanceId: number | null;
  print_run: number;
  designTitle: string | null;
  deviceModel: string | null;
  startTime: string | null;
  endTime: string | null;
  total_weight_g: number | null;
  total_time_s: number | null;
  plate_count: number;
  status: string | null;
  status_override: string | null;
  customer: string | null;
  notes: string | null;
  price_override: number | null;
  extra_labor_minutes: number | null;
  project_id: number | null;
  cover_url: string | null;
  filament_colors: string[];
}

export function listUiJobs(): UiJobRow[] {
  const rows = db
    .prepare<
      [],
      Omit<UiJobRow, "cover_url" | "filament_colors"> & {
        first_task_id: string;
        filament_colors_json: string | null;
      }
    >(
      `SELECT
        j.id, j.session_id, j.instanceId, j.print_run,
        j.designTitle, j.deviceModel,
        j.startTime, j.endTime,
        j.total_weight_g, j.total_time_s, j.plate_count,
        COALESCE(j.status_override, j.status) AS status, j.status_override,
        j.customer, j.notes, j.price_override, j.extra_labor_minutes, j.project_id,
        pt_first.id AS first_task_id,
        (SELECT json_group_array(color) FROM (
          SELECT DISTINCT jf.color
          FROM job_filaments jf
          JOIN print_tasks pt ON jf.task_id = pt.id
          WHERE pt.session_id = j.session_id AND jf.color IS NOT NULL
          ORDER BY jf.ams_id, jf.slot_id
        )) AS filament_colors_json
      FROM jobs j
      LEFT JOIN (
        SELECT id, session_id,
          ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY plateIndex) AS rn
        FROM print_tasks
      ) pt_first ON pt_first.session_id = j.session_id AND pt_first.rn = 1
      ORDER BY j.startTime DESC`,
    )
    .all();

  return rows.map(({ first_task_id, filament_colors_json, ...row }) => ({
    ...row,
    cover_url:
      first_task_id && localCoverExists(first_task_id) ? `/ui/covers/${first_task_id}` : null,
    filament_colors: filament_colors_json ? (JSON.parse(filament_colors_json) as string[]) : [],
  }));
}
