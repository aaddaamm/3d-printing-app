import "dotenv/config";
import { db } from "../lib/db.js";
import { getAllJobPrices } from "../models/jobs.js";
import { getAllProjectPrices } from "../models/projects.js";

type CountRow = { n: number };
type StatusRow = {
  status: string | null;
  jobs: number;
  total_weight_g: number | null;
  total_time_s: number | null;
};
type DeviceRow = {
  deviceModel: string | null;
  jobs: number;
  plates: number | null;
  total_weight_g: number | null;
  total_time_s: number | null;
};
type FilamentRow = {
  filament_type: string | null;
  rows: number;
  total_weight_g: number | null;
};
type MissingMachineRateRow = { deviceModel: string | null; jobs: number };
type MissingMaterialRateRow = {
  filament_type: string | null;
  rows: number;
  total_weight_g: number | null;
};
type ProjectAssignmentRow = { projects: number; assigned_jobs: number };
type PriceSample = { id: number; price: number };

type BaselineReport = {
  generated_at: string;
  database_path: string;
  counts: Record<string, number>;
  status_distribution: StatusRow[];
  jobs_by_device_model: DeviceRow[];
  filament_usage: FilamentRow[];
  project_assignments: ProjectAssignmentRow;
  missing_machine_rates: MissingMachineRateRow[];
  missing_material_rates: MissingMaterialRateRow[];
  price_samples: {
    jobs: PriceSample[];
    projects: PriceSample[];
  };
};

const DB_PATH = process.env["BAMBU_DB"] ?? "./bambu_print_history.sqlite";

function requiredRow<T>(row: T | undefined, label: string): T {
  if (!row) throw new Error(`Missing baseline row: ${label}`);
  return row;
}

function count(tableName: string): number {
  const row = requiredRow(
    db.prepare<[], CountRow>(`SELECT COUNT(*) AS n FROM ${tableName}`).get(),
    `count ${tableName}`,
  );
  return row.n;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function firstPriceSamples(prices: Record<number, number>, limit = 20): PriceSample[] {
  return Object.entries(prices)
    .map(([id, price]) => ({ id: Number(id), price: roundMoney(price) }))
    .sort((a, b) => a.id - b.id)
    .slice(0, limit);
}

function buildReport(): BaselineReport {
  const projectAssignments = requiredRow(
    db
      .prepare<[], ProjectAssignmentRow>(
        `SELECT
          (SELECT COUNT(*) FROM projects) AS projects,
          (SELECT COUNT(*) FROM jobs WHERE project_id IS NOT NULL) AS assigned_jobs`,
      )
      .get(),
    "project assignments",
  );

  return {
    generated_at: new Date().toISOString(),
    database_path: DB_PATH,
    counts: {
      print_tasks: count("print_tasks"),
      jobs: count("jobs"),
      projects: count("projects"),
      job_filaments: count("job_filaments"),
      providers: count("providers"),
      printers: count("printers"),
      machine_rates: count("machine_rates"),
      material_rates: count("material_rates"),
    },
    status_distribution: db
      .prepare<[], StatusRow>(
        `SELECT
          status,
          COUNT(*) AS jobs,
          SUM(COALESCE(total_weight_g, 0)) AS total_weight_g,
          SUM(COALESCE(total_time_s, 0)) AS total_time_s
        FROM jobs
        GROUP BY status
        ORDER BY jobs DESC, status`,
      )
      .all(),
    jobs_by_device_model: db
      .prepare<[], DeviceRow>(
        `SELECT
          deviceModel,
          COUNT(*) AS jobs,
          SUM(COALESCE(plate_count, 0)) AS plates,
          SUM(COALESCE(total_weight_g, 0)) AS total_weight_g,
          SUM(COALESCE(total_time_s, 0)) AS total_time_s
        FROM jobs
        GROUP BY deviceModel
        ORDER BY jobs DESC, deviceModel`,
      )
      .all(),
    filament_usage: db
      .prepare<[], FilamentRow>(
        `SELECT
          filament_type,
          COUNT(*) AS rows,
          SUM(COALESCE(weight_g, 0)) AS total_weight_g
        FROM job_filaments
        GROUP BY filament_type
        ORDER BY total_weight_g DESC, filament_type`,
      )
      .all(),
    project_assignments: projectAssignments,
    missing_machine_rates: db
      .prepare<[], MissingMachineRateRow>(
        `SELECT j.deviceModel, COUNT(*) AS jobs
        FROM jobs j
        LEFT JOIN machine_rates mr ON mr.device_model = j.deviceModel
        WHERE j.deviceModel IS NOT NULL AND mr.device_model IS NULL
        GROUP BY j.deviceModel
        ORDER BY jobs DESC, j.deviceModel`,
      )
      .all(),
    missing_material_rates: db
      .prepare<[], MissingMaterialRateRow>(
        `SELECT jf.filament_type, COUNT(*) AS rows, SUM(COALESCE(jf.weight_g, 0)) AS total_weight_g
        FROM job_filaments jf
        LEFT JOIN material_rates mr ON mr.filament_type = jf.filament_type
        WHERE jf.filament_type IS NOT NULL AND mr.filament_type IS NULL
        GROUP BY jf.filament_type
        ORDER BY total_weight_g DESC, jf.filament_type`,
      )
      .all(),
    price_samples: {
      jobs: firstPriceSamples(getAllJobPrices()),
      projects: firstPriceSamples(getAllProjectPrices()),
    },
  };
}

function printMarkdown(report: BaselineReport): void {
  console.log(`# Multi-provider migration baseline\n`);
  console.log(`Generated: ${report.generated_at}`);
  console.log(`Database: ${report.database_path}\n`);

  console.log("## Counts");
  for (const [name, value] of Object.entries(report.counts)) console.log(`- ${name}: ${value}`);

  console.log("\n## Job status distribution");
  for (const row of report.status_distribution) {
    console.log(
      `- ${row.status ?? "null"}: ${row.jobs} jobs, ${row.total_weight_g ?? 0}g, ${row.total_time_s ?? 0}s`,
    );
  }

  console.log("\n## Jobs by device model");
  for (const row of report.jobs_by_device_model) {
    console.log(
      `- ${row.deviceModel ?? "null"}: ${row.jobs} jobs, ${row.plates ?? 0} plates, ${row.total_weight_g ?? 0}g, ${row.total_time_s ?? 0}s`,
    );
  }

  console.log("\n## Filament usage");
  for (const row of report.filament_usage) {
    console.log(`- ${row.filament_type ?? "null"}: ${row.rows} rows, ${row.total_weight_g ?? 0}g`);
  }

  console.log("\n## Project assignments");
  console.log(`- projects: ${report.project_assignments.projects}`);
  console.log(`- assigned jobs: ${report.project_assignments.assigned_jobs}`);

  console.log("\n## Missing rate coverage");
  console.log(`- machine rates missing: ${report.missing_machine_rates.length}`);
  for (const row of report.missing_machine_rates)
    console.log(`  - ${row.deviceModel}: ${row.jobs} jobs`);
  console.log(`- material rates missing: ${report.missing_material_rates.length}`);
  for (const row of report.missing_material_rates) {
    console.log(`  - ${row.filament_type}: ${row.rows} rows, ${row.total_weight_g ?? 0}g`);
  }

  console.log("\n## Price samples");
  console.log(
    `- jobs: ${report.price_samples.jobs.map((row) => `${row.id}=$${row.price}`).join(", ")}`,
  );
  console.log(
    `- projects: ${report.price_samples.projects.map((row) => `${row.id}=$${row.price}`).join(", ")}`,
  );
}

try {
  const report = buildReport();
  if (process.argv.includes("--json")) console.log(JSON.stringify(report, null, 2));
  else printMarkdown(report);
} finally {
  db.close();
}
