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
  printer_id: number | null;
  cover_url: string | null;
  filament_colors: string[];
  material_usage_confidence: string | null;
}

function dirname(filename: string): string {
  const lastSlash = filename.lastIndexOf("/");
  return lastSlash === -1 ? "" : filename.slice(0, lastSlash);
}

function joinPosixPath(...parts: string[]): string {
  return parts
    .flatMap((part) => part.split("/"))
    .filter((part) => part.length > 0 && part !== ".")
    .join("/");
}

function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

function moonrakerMediaUrl(
  providerPrinterId: string | null,
  filename: string | null,
  mediaPath: string,
): string | null {
  if (/^https?:\/\//i.test(mediaPath)) return mediaPath;
  if (!providerPrinterId) return null;
  const thumbnailPath = mediaPath.startsWith("/")
    ? mediaPath.slice(1)
    : joinPosixPath(dirname(filename ?? ""), mediaPath);
  return `http://${providerPrinterId}/server/files/gcodes/${encodePath(thumbnailPath)}`;
}

function remoteCoverUrl(
  provider: string,
  providerPrinterId: string | null,
  title: string | null,
  thumbnail: string | null,
  cover: string | null,
): string | null {
  if (provider === "bambu") return null;
  const mediaUrl = thumbnail ?? cover;
  if (!mediaUrl) return null;
  if (provider === "moonraker") return moonrakerMediaUrl(providerPrinterId, title, mediaUrl);
  return /^https?:\/\//i.test(mediaUrl) ? mediaUrl : null;
}

function parseFilamentColors(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function listUiJobs(): UiJobRow[] {
  const rows = db
    .prepare<
      [],
      Omit<UiJobRow, "cover_url" | "filament_colors"> & {
        first_task_id: string;
        first_task_provider: string;
        first_task_provider_printer_id: string | null;
        first_task_title: string | null;
        first_task_cover: string | null;
        first_task_thumbnail: string | null;
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
        j.printer_id,
        pt_first.id AS first_task_id,
        pt_first.provider AS first_task_provider,
        pt_first.provider_printer_id AS first_task_provider_printer_id,
        pt_first.title AS first_task_title,
        pt_first.cover AS first_task_cover,
        pt_first.thumbnail AS first_task_thumbnail,
        (SELECT json_group_array(color) FROM (
          SELECT DISTINCT jf.color
          FROM job_filaments jf
          JOIN print_tasks pt ON jf.task_id = pt.id
          WHERE pt.session_id = j.session_id AND jf.color IS NOT NULL
          ORDER BY jf.ams_id, jf.slot_id
        )) AS filament_colors_json,
        (SELECT jf.material_usage_confidence
          FROM job_filaments jf
          JOIN print_tasks pt ON jf.task_id = pt.id
          WHERE pt.session_id = j.session_id
          ORDER BY CASE jf.material_usage_confidence
            WHEN 'unknown' THEN 4
            WHEN 'slicer_estimate' THEN 3
            WHEN 'manual' THEN 2
            WHEN 'actual' THEN 1
            ELSE 4
          END DESC
          LIMIT 1
        ) AS material_usage_confidence
      FROM jobs j
      LEFT JOIN (
        SELECT id, provider, provider_printer_id, session_id, title, cover, thumbnail,
          ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY plateIndex) AS rn
        FROM print_tasks
      ) pt_first ON pt_first.session_id = j.session_id AND pt_first.rn = 1
      ORDER BY j.startTime DESC`,
    )
    .all();

  return rows.map(
    ({
      first_task_id,
      first_task_provider,
      first_task_provider_printer_id,
      first_task_title,
      first_task_cover,
      first_task_thumbnail,
      filament_colors_json,
      ...row
    }) => {
      const canServeLocalCover =
        first_task_id &&
        /^\d+$/.test(first_task_id) &&
        (localCoverExists(first_task_id) ||
          (first_task_provider === "bambu" && Boolean(first_task_cover ?? first_task_thumbnail)));
      const localCoverUrl = canServeLocalCover ? `/ui/covers/${first_task_id}` : null;
      const fallbackCoverUrl = remoteCoverUrl(
        first_task_provider,
        first_task_provider_printer_id,
        first_task_title,
        first_task_thumbnail,
        first_task_cover,
      );
      return {
        ...row,
        cover_url: localCoverUrl ?? fallbackCoverUrl,
        filament_colors: parseFilamentColors(filament_colors_json),
      };
    },
  );
}
