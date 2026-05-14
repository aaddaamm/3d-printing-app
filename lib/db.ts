import Database from "better-sqlite3";
import { LABOR_CONFIG_TABLE_SQL, seedLaborConfig } from "./db/labor-config.js";
import { runDatabaseMigrations } from "./db/migrations-list.js";
import { seedRateTables } from "./db/rate-seeds.js";
import { createProjectStatements } from "./db/project-statements.js";
import { createRateStatements } from "./db/rate-statements.js";
import type { PrintTask, Job, JobFilament, SyncLog } from "./types.js";

const DB_PATH = process.env["BAMBU_DB"] ?? "./bambu_print_history.sqlite";

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ── Schema ────────────────────────────────────────────────────────────────────
// Each statement is executed individually so IF NOT EXISTS guards work
// independently — a pre-existing table or index never blocks the others.

for (const sql of [
  `CREATE TABLE IF NOT EXISTS print_tasks (
    id          TEXT PRIMARY KEY,
    session_id  TEXT,
    instanceId  INTEGER,
    plateIndex  INTEGER,
    deviceId    TEXT,
    deviceName  TEXT,
    deviceModel TEXT,
    designId    TEXT,
    designTitle TEXT,
    modelId     TEXT,
    profileId   TEXT,
    title       TEXT,
    status      TEXT,
    failedType  INTEGER,
    bedType     TEXT,
    weight      REAL,
    length      REAL,
    costTime    INTEGER,
    startTime   TEXT,
    endTime     TEXT,
    cover       TEXT,
    thumbnail   TEXT,
    raw_json    TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_print_tasks_instanceId ON print_tasks(instanceId)`,
  `CREATE INDEX IF NOT EXISTS idx_print_tasks_deviceId   ON print_tasks(deviceId)`,
  `CREATE INDEX IF NOT EXISTS idx_print_tasks_startTime  ON print_tasks(startTime)`,
  `CREATE INDEX IF NOT EXISTS idx_print_tasks_session_plate ON print_tasks(session_id, plateIndex)`,
  `CREATE TABLE IF NOT EXISTS jobs (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id     TEXT UNIQUE NOT NULL,
    instanceId     INTEGER,
    print_run      INTEGER NOT NULL DEFAULT 1,
    designId       TEXT,
    designTitle    TEXT,
    modelId        TEXT,
    deviceId       TEXT,
    deviceModel    TEXT,
    startTime      TEXT,
    endTime        TEXT,
    total_weight_g REAL,
    total_time_s   INTEGER,
    plate_count    INTEGER,
    status         TEXT,
    customer       TEXT,
    notes          TEXT,
    price_override REAL,
    project_id     INTEGER REFERENCES projects(id),
    status_override TEXT,
    extra_labor_minutes REAL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_jobs_customer  ON jobs(customer)`,
  `CREATE INDEX IF NOT EXISTS idx_jobs_startTime ON jobs(startTime)`,
  `CREATE INDEX IF NOT EXISTS idx_jobs_project_start ON jobs(project_id, startTime DESC)`,
  `CREATE TABLE IF NOT EXISTS job_filaments (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id       TEXT NOT NULL REFERENCES print_tasks(id),
    instanceId    INTEGER,
    filament_type TEXT,
    filament_id   TEXT,
    color         TEXT,
    weight_g      REAL,
    ams_id        INTEGER,
    slot_id       INTEGER
  )`,
  `CREATE INDEX IF NOT EXISTS idx_job_filaments_task_id    ON job_filaments(task_id)`,
  `CREATE INDEX IF NOT EXISTS idx_job_filaments_instanceId ON job_filaments(instanceId)`,
  `CREATE TABLE IF NOT EXISTS machine_rates (
    device_model        TEXT PRIMARY KEY,
    purchase_price      REAL NOT NULL,
    lifetime_hrs        REAL NOT NULL DEFAULT 3000,
    electricity_rate    REAL NOT NULL DEFAULT 0.10,
    maintenance_buffer  REAL NOT NULL DEFAULT 0.50,
    machine_rate_per_hr REAL NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS material_rates (
    filament_type    TEXT PRIMARY KEY,
    cost_per_g       REAL NOT NULL,
    waste_buffer_pct REAL NOT NULL DEFAULT 0.10,
    rate_per_g       REAL NOT NULL
  )`,
  LABOR_CONFIG_TABLE_SQL,
  `CREATE TABLE IF NOT EXISTS sync_log (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at TEXT NOT NULL,
    ended_at   TEXT,
    inserted   INTEGER,
    updated    INTEGER,
    error      TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS projects (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    customer   TEXT,
    notes      TEXT,
    created_at TEXT NOT NULL,
    source_design_id TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS job_price_cache (
    job_id      INTEGER PRIMARY KEY REFERENCES jobs(id) ON DELETE CASCADE,
    final_price REAL NOT NULL,
    computed_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS project_price_cache (
    project_id  INTEGER PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
    final_price REAL NOT NULL,
    computed_at TEXT NOT NULL
  )`,
]) {
  db.exec(sql);
}

// ── Migrations ────────────────────────────────────────────────────────────────

runDatabaseMigrations(db);

// ── Seed default rates ────────────────────────────────────────────────────────

seedRateTables(db);
seedLaborConfig(db);

// ── Prepared statements ───────────────────────────────────────────────────────

export const stmts = {
  upsertTask: db.prepare<PrintTask>(`
    INSERT INTO print_tasks (
      id, session_id, instanceId, plateIndex,
      deviceId, deviceName, deviceModel,
      designId, designTitle, modelId, profileId, title,
      status, failedType, bedType,
      weight, length, costTime, startTime, endTime,
      cover, thumbnail, raw_json
    ) VALUES (
      @id, @session_id, @instanceId, @plateIndex,
      @deviceId, @deviceName, @deviceModel,
      @designId, @designTitle, @modelId, @profileId, @title,
      @status, @failedType, @bedType,
      @weight, @length, @costTime, @startTime, @endTime,
      @cover, @thumbnail, @raw_json
    )
    ON CONFLICT(id) DO UPDATE SET
      session_id=excluded.session_id,
      instanceId=excluded.instanceId,   plateIndex=excluded.plateIndex,
      deviceId=excluded.deviceId,       deviceName=excluded.deviceName,     deviceModel=excluded.deviceModel,
      designId=excluded.designId,       designTitle=excluded.designTitle,
      modelId=excluded.modelId,         profileId=excluded.profileId,       title=excluded.title,
      status=excluded.status,           failedType=excluded.failedType,     bedType=excluded.bedType,
      weight=excluded.weight,           length=excluded.length,             costTime=excluded.costTime,
      startTime=excluded.startTime,     endTime=excluded.endTime,
      cover=excluded.cover,             thumbnail=excluded.thumbnail,
      raw_json=excluded.raw_json
  `),

  getTaskById: db.prepare<[string], PrintTask>("SELECT * FROM print_tasks WHERE id = ?"),

  upsertJob: db.prepare<
    Omit<
      Job,
      | "id"
      | "customer"
      | "notes"
      | "price_override"
      | "status_override"
      | "project_id"
      | "extra_labor_minutes"
    >
  >(`
    INSERT INTO jobs (
      session_id, instanceId, print_run, designId, designTitle, modelId, deviceId, deviceModel,
      startTime, endTime, total_weight_g, total_time_s, plate_count, status
    ) VALUES (
      @session_id, @instanceId, @print_run, @designId, @designTitle, @modelId, @deviceId, @deviceModel,
      @startTime, @endTime, @total_weight_g, @total_time_s, @plate_count, @status
    )
    ON CONFLICT(session_id) DO UPDATE SET
      instanceId=excluded.instanceId,     print_run=excluded.print_run,
      designId=excluded.designId,         designTitle=excluded.designTitle,
      modelId=excluded.modelId,
      deviceId=excluded.deviceId,         deviceModel=excluded.deviceModel,
      startTime=excluded.startTime,       endTime=excluded.endTime,
      total_weight_g=excluded.total_weight_g, total_time_s=excluded.total_time_s,
      plate_count=excluded.plate_count,   status=excluded.status
  `),

  getJobById: db.prepare<[number], Job>("SELECT * FROM jobs WHERE id = ?"),

  patchJob: db.prepare<
    Pick<
      Job,
      | "customer"
      | "notes"
      | "price_override"
      | "status_override"
      | "project_id"
      | "extra_labor_minutes"
      | "id"
    >
  >(`
    UPDATE jobs SET customer=@customer, notes=@notes, price_override=@price_override,
      status_override=@status_override, project_id=@project_id, extra_labor_minutes=@extra_labor_minutes
    WHERE id=@id
  `),

  deleteJobFilaments: db.prepare<[string]>("DELETE FROM job_filaments WHERE task_id = ?"),

  insertFilament: db.prepare<Omit<JobFilament, "id">>(`
    INSERT INTO job_filaments (task_id, instanceId, filament_type, filament_id, color, weight_g, ams_id, slot_id)
    VALUES (@task_id, @instanceId, @filament_type, @filament_id, @color, @weight_g, @ams_id, @slot_id)
  `),

  getFilamentsBySession: db.prepare<[string], JobFilament>(`
    SELECT jf.* FROM job_filaments jf
    JOIN print_tasks pt ON jf.task_id = pt.id
    WHERE pt.session_id = ?
    ORDER BY jf.task_id, jf.ams_id, jf.slot_id
  `),

  ...createRateStatements(db),

  ...createProjectStatements(db),

  getLastSync: db.prepare<[], SyncLog>("SELECT * FROM sync_log ORDER BY id DESC LIMIT 1"),
  insertSyncLog: db.prepare<{ started_at: string }>(
    "INSERT INTO sync_log (started_at) VALUES (@started_at)",
  ),
  updateSyncLog: db.prepare<{
    id: number;
    ended_at: string;
    inserted: number;
    updated: number;
    error: string | null;
  }>(`
    UPDATE sync_log SET ended_at=@ended_at, inserted=@inserted, updated=@updated, error=@error
    WHERE id=@id
  `),
};

// ── insertBatch ───────────────────────────────────────────────────────────────

const countTasks = db.prepare<[], { n: number }>("SELECT COUNT(*) AS n FROM print_tasks");

export const insertBatch = db.transaction(
  (rows: PrintTask[]): { inserted: number; updated: number } => {
    const before = countTasks.get()!.n;
    for (const row of rows) stmts.upsertTask.run(row);
    const inserted = countTasks.get()!.n - before;
    return { inserted, updated: rows.length - inserted };
  },
);
