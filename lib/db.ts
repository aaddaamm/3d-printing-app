import Database from "better-sqlite3";
import type {
  PrintTask,
  Job,
  JobFilament,
  MachineRate,
  MaterialRate,
  LaborConfig,
  SyncLog,
  Project,
} from "./types.js";

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
  `CREATE TABLE IF NOT EXISTS jobs (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id     TEXT UNIQUE NOT NULL,
    instanceId     INTEGER,
    print_run      INTEGER NOT NULL DEFAULT 1,
    designId       TEXT,
    designTitle    TEXT,
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
    price_override REAL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_jobs_customer  ON jobs(customer)`,
  `CREATE INDEX IF NOT EXISTS idx_jobs_startTime ON jobs(startTime)`,
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
  `CREATE TABLE IF NOT EXISTS labor_config (
    id                INTEGER PRIMARY KEY CHECK (id = 1),
    hourly_rate       REAL NOT NULL DEFAULT 25.0,
    minimum_minutes   REAL NOT NULL DEFAULT 15.0,
    profit_markup_pct REAL NOT NULL DEFAULT 0.20
  )`,
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
    created_at TEXT NOT NULL
  )`,
]) {
  db.exec(sql);
}

// ── Migrations ────────────────────────────────────────────────────────────────
//
// Rebuild jobs table when schema changes (no user data to preserve yet).
// Detected by absence of the session_id column on the jobs table.

const jobsCols = (db.prepare("PRAGMA table_info(jobs)").all() as { name: string }[]).map(
  (c) => c.name,
);
if (!jobsCols.includes("session_id")) {
  db.prepare("DROP TABLE IF EXISTS jobs").run();
  db.prepare(
    `CREATE TABLE jobs (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id     TEXT UNIQUE NOT NULL,
    instanceId     INTEGER,
    print_run      INTEGER NOT NULL DEFAULT 1,
    designId       TEXT,
    designTitle    TEXT,
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
    price_override REAL
  )`,
  ).run();
}

const hasOldTable = !!db
  .prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='tasks'")
  .get();
const hasNewTable = !!db
  .prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='print_tasks'")
  .get();
if (hasOldTable && hasNewTable) {
  db.exec("DROP TABLE tasks");
} else if (hasOldTable) {
  db.exec("ALTER TABLE tasks RENAME TO print_tasks");
}

for (const col of [
  "session_id  TEXT",
  "instanceId  INTEGER",
  "plateIndex  INTEGER",
  "deviceModel TEXT",
  "title       TEXT",
  "failedType  INTEGER",
  "bedType     TEXT",
]) {
  try {
    db.prepare(`ALTER TABLE print_tasks ADD COLUMN ${col}`).run();
  } catch {
    /* already exists */
  }
}

// Add source_design_id to projects if missing
try {
  db.prepare("ALTER TABLE projects ADD COLUMN source_design_id TEXT").run();
} catch {
  /* already exists */
}
try {
  db.prepare(
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_source_design_id ON projects(source_design_id) WHERE source_design_id IS NOT NULL",
  ).run();
} catch {
  /* already exists */
}

// Add modelId to jobs if missing
try {
  db.prepare("ALTER TABLE jobs ADD COLUMN modelId TEXT").run();
} catch {
  /* already exists */
}

// Add PLA-S (Bambu Specialty PLA) material rate if missing
try {
  db.prepare(
    `INSERT OR IGNORE INTO material_rates (filament_type, cost_per_g, waste_buffer_pct, rate_per_g)
     VALUES ('PLA-S', 0.034, 0.10, ?)`,
  ).run(Number((0.034 * 1.1).toFixed(4)));
} catch {
  /* table may not exist yet on first run — seed below handles it */
}

// Add project_id and status_override to jobs if they don't exist yet
for (const col of [
  "project_id INTEGER REFERENCES projects(id)",
  "status_override TEXT",
  "extra_labor_minutes REAL",
]) {
  try {
    db.prepare(`ALTER TABLE jobs ADD COLUMN ${col}`).run();
  } catch {
    /* already exists */
  }
}

const sqliteVersion = (db.prepare("SELECT sqlite_version() AS v").get() as { v: string }).v;
if (sqliteVersion >= "3.35.0") {
  for (const col of ["material_cost", "labor_cost", "price", "notes", "customer"]) {
    try {
      db.exec(`ALTER TABLE print_tasks DROP COLUMN ${col}`);
    } catch {
      /* already gone */
    }
  }
}

// ── Seed default rates ────────────────────────────────────────────────────────

if ((db.prepare("SELECT COUNT(*) AS n FROM machine_rates").get() as { n: number }).n === 0) {
  const insertMachine = db.prepare<MachineRate>(`
    INSERT INTO machine_rates (device_model, purchase_price, lifetime_hrs, electricity_rate, maintenance_buffer, machine_rate_per_hr)
    VALUES (@device_model, @purchase_price, @lifetime_hrs, @electricity_rate, @maintenance_buffer, @machine_rate_per_hr)
  `);
  insertMachine.run({
    device_model: "A1 mini",
    purchase_price: 213.99,
    lifetime_hrs: 3000,
    electricity_rate: 0.1,
    maintenance_buffer: 0.5,
    machine_rate_per_hr: Number((213.99 / 3000 + 0.1 + 0.5).toFixed(6)),
  });
  insertMachine.run({
    device_model: "P1S",
    purchase_price: 588.49,
    lifetime_hrs: 3000,
    electricity_rate: 0.1,
    maintenance_buffer: 0.5,
    machine_rate_per_hr: Number((588.49 / 3000 + 0.1 + 0.5).toFixed(6)),
  });
}

if ((db.prepare("SELECT COUNT(*) AS n FROM material_rates").get() as { n: number }).n === 0) {
  const insertMaterial = db.prepare<MaterialRate>(`
    INSERT INTO material_rates (filament_type, cost_per_g, waste_buffer_pct, rate_per_g)
    VALUES (@filament_type, @cost_per_g, @waste_buffer_pct, @rate_per_g)
  `);
  insertMaterial.run({
    filament_type: "PLA",
    cost_per_g: 0.028,
    waste_buffer_pct: 0.1,
    rate_per_g: Number((0.028 * 1.1).toFixed(4)),
  });
  insertMaterial.run({
    filament_type: "PETG",
    cost_per_g: 0.032,
    waste_buffer_pct: 0.15,
    rate_per_g: Number((0.032 * 1.15).toFixed(4)),
  });
}

if ((db.prepare("SELECT COUNT(*) AS n FROM labor_config").get() as { n: number }).n === 0) {
  db.prepare(
    "INSERT INTO labor_config (id, hourly_rate, minimum_minutes, profit_markup_pct) VALUES (1, 25.0, 15.0, 0.20)",
  ).run();
}

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

  getMachineRates: db.prepare<[], MachineRate>("SELECT * FROM machine_rates ORDER BY device_model"),
  getMachineRate: db.prepare<[string], MachineRate>(
    "SELECT * FROM machine_rates WHERE device_model = ?",
  ),
  getMaterialRates: db.prepare<[], MaterialRate>(
    "SELECT * FROM material_rates ORDER BY filament_type",
  ),
  getMaterialRate: db.prepare<[string], MaterialRate>(
    "SELECT * FROM material_rates WHERE filament_type = ?",
  ),
  getLaborConfig: db.prepare<[], LaborConfig>("SELECT * FROM labor_config WHERE id = 1"),

  upsertMachineRate: db.prepare<MachineRate>(`
    INSERT INTO machine_rates (device_model, purchase_price, lifetime_hrs, electricity_rate, maintenance_buffer, machine_rate_per_hr)
    VALUES (@device_model, @purchase_price, @lifetime_hrs, @electricity_rate, @maintenance_buffer, @machine_rate_per_hr)
    ON CONFLICT(device_model) DO UPDATE SET
      purchase_price=excluded.purchase_price, lifetime_hrs=excluded.lifetime_hrs,
      electricity_rate=excluded.electricity_rate, maintenance_buffer=excluded.maintenance_buffer,
      machine_rate_per_hr=excluded.machine_rate_per_hr
  `),

  upsertMaterialRate: db.prepare<MaterialRate>(`
    INSERT INTO material_rates (filament_type, cost_per_g, waste_buffer_pct, rate_per_g)
    VALUES (@filament_type, @cost_per_g, @waste_buffer_pct, @rate_per_g)
    ON CONFLICT(filament_type) DO UPDATE SET
      cost_per_g=excluded.cost_per_g, waste_buffer_pct=excluded.waste_buffer_pct,
      rate_per_g=excluded.rate_per_g
  `),

  updateLaborConfig: db.prepare<Omit<LaborConfig, "id">>(`
    UPDATE labor_config
    SET hourly_rate=@hourly_rate, minimum_minutes=@minimum_minutes, profit_markup_pct=@profit_markup_pct
    WHERE id=1
  `),

  listProjects: db.prepare<
    [],
    Project & {
      job_count: number;
      total_weight_g: number | null;
      total_time_s: number | null;
      latest_cover_task_id: string | null;
    }
  >(`
    SELECT p.*,
      COUNT(j.id)          AS job_count,
      SUM(j.total_weight_g) AS total_weight_g,
      SUM(j.total_time_s)   AS total_time_s,
      (SELECT pt.id FROM print_tasks pt
       WHERE pt.session_id = (
         SELECT j2.session_id FROM jobs j2
         WHERE j2.project_id = p.id
         ORDER BY j2.startTime DESC LIMIT 1
       )
       ORDER BY pt.plateIndex LIMIT 1) AS latest_cover_task_id
    FROM projects p
    LEFT JOIN jobs j ON j.project_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `),

  getProjectById: db.prepare<[number], Project>("SELECT * FROM projects WHERE id = ?"),

  createProject: db.prepare<Omit<Project, "id">>(`
    INSERT INTO projects (name, customer, notes, created_at)
    VALUES (@name, @customer, @notes, @created_at)
  `),

  patchProject: db.prepare<Pick<Project, "name" | "customer" | "notes" | "id">>(`
    UPDATE projects SET name=@name, customer=@customer, notes=@notes WHERE id=@id
  `),

  deleteProject: db.prepare<[number]>("DELETE FROM projects WHERE id = ?"),

  unassignProjectJobs: db.prepare<[number]>(
    "UPDATE jobs SET project_id = NULL WHERE project_id = ?",
  ),

  getProjectJobs: db.prepare<[number], Job>(
    "SELECT * FROM jobs WHERE project_id = ? ORDER BY startTime DESC",
  ),

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
