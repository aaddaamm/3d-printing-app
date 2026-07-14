import Database from "better-sqlite3";
import { LABOR_CONFIG_TABLE_SQL, seedLaborConfig } from "./db/labor-config.js";
import { runDatabaseMigrations } from "./db/migrations-list.js";
import { addColumnIfMissing } from "./migrations.js";
import { seedRateTables } from "./db/rate-seeds.js";
import { createProjectStatements } from "./db/project-statements.js";
import { createRateStatements } from "./db/rate-statements.js";
import { createSyncStatements } from "./db/sync-statements.js";
import { createTaskJobStatements } from "./db/task-job-statements.js";
import { createInsertBatch } from "./db/batch.js";

const DB_PATH = process.env["BAMBU_DB"] ?? "./bambu_print_history.sqlite";

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ── Schema ────────────────────────────────────────────────────────────────────
// Each statement is executed individually so IF NOT EXISTS guards work
// independently — a pre-existing table or index never blocks the others.

for (const sql of [
  `CREATE TABLE IF NOT EXISTS providers (
    id           TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS printers (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    provider            TEXT NOT NULL REFERENCES providers(id),
    provider_printer_id TEXT NOT NULL,
    name                TEXT,
    model               TEXT,
    serial              TEXT,
    is_active           INTEGER NOT NULL DEFAULT 1,
    retired_at          TEXT,
    notes               TEXT,
    created_at          TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_printer_id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_printers_provider ON printers(provider)`,
  `CREATE TABLE IF NOT EXISTS print_tasks (
    id          TEXT PRIMARY KEY,
    provider    TEXT NOT NULL DEFAULT 'bambu',
    provider_task_id TEXT,
    provider_printer_id TEXT,
    printer_id  INTEGER REFERENCES printers(id),
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
    provider       TEXT NOT NULL DEFAULT 'bambu',
    provider_session_id TEXT,
    provider_printer_id TEXT,
    printer_id     INTEGER REFERENCES printers(id),
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
    slot_id       INTEGER,
    material_usage_confidence TEXT NOT NULL DEFAULT 'unknown'
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
    provider   TEXT NOT NULL DEFAULT 'bambu',
    provider_printer_id TEXT,
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
  `CREATE TABLE IF NOT EXISTS scan_roots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    root_path TEXT NOT NULL,
    normalized_root_path TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    last_scanned_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(normalized_root_path)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_scan_roots_active ON scan_roots(is_active)`,
  `CREATE TABLE IF NOT EXISTS managed_blobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_hash TEXT NOT NULL,
    hash_algorithm TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    normalized_storage_path TEXT NOT NULL,
    size_bytes INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_verified_at TEXT,
    UNIQUE(content_hash, hash_algorithm),
    UNIQUE(normalized_storage_path)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_managed_blobs_hash ON managed_blobs(content_hash, hash_algorithm)`,
  `CREATE TABLE IF NOT EXISTS catalog_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    root_id INTEGER REFERENCES scan_roots(id),
    path TEXT NOT NULL,
    normalized_path TEXT NOT NULL,
    filename TEXT NOT NULL,
    extension TEXT,
    size_bytes INTEGER,
    modified_at TEXT,
    created_at_fs TEXT,
    quick_hash TEXT,
    content_hash TEXT,
    hash_algorithm TEXT,
    storage_role TEXT NOT NULL DEFAULT 'source',
    managed_blob_id INTEGER REFERENCES managed_blobs(id),
    original_source_path TEXT,
    original_source_root_id INTEGER REFERENCES scan_roots(id),
    scan_status TEXT NOT NULL DEFAULT 'present',
    review_status TEXT NOT NULL DEFAULT 'indexed',
    reviewed_at TEXT,
    missing_since TEXT,
    metadata_json TEXT,
    first_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(normalized_path)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_catalog_files_root ON catalog_files(root_id)`,
  `CREATE INDEX IF NOT EXISTS idx_catalog_files_content_hash ON catalog_files(content_hash)`,
  `CREATE INDEX IF NOT EXISTS idx_catalog_files_extension ON catalog_files(extension)`,
  `CREATE INDEX IF NOT EXISTS idx_catalog_files_scan_status ON catalog_files(scan_status)`,
  `CREATE INDEX IF NOT EXISTS idx_catalog_files_storage_role ON catalog_files(storage_role)`,
  `CREATE INDEX IF NOT EXISTS idx_catalog_files_managed_blob ON catalog_files(managed_blob_id)`,
  `CREATE INDEX IF NOT EXISTS idx_catalog_files_filename ON catalog_files(filename COLLATE NOCASE)`,
  `CREATE TABLE IF NOT EXISTS product_statuses (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS product_categories (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS product_sources (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS product_licenses (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    allows_commercial_sale INTEGER NOT NULL DEFAULT 0,
    requires_attribution INTEGER NOT NULL DEFAULT 0,
    allows_stl_redistribution INTEGER NOT NULL DEFAULT 0,
    warning TEXT,
    sort_order INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS pricing_profiles (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    target_margin_pct REAL NOT NULL,
    platform_fee_pct REAL NOT NULL DEFAULT 0,
    fixed_fee_per_order REAL NOT NULL DEFAULT 0,
    failure_buffer_pct REAL NOT NULL DEFAULT 0,
    overhead_buffer_pct REAL NOT NULL DEFAULT 0,
    default_packaging_cost REAL NOT NULL DEFAULT 0,
    default_setup_minutes REAL NOT NULL DEFAULT 0,
    default_handling_minutes REAL NOT NULL DEFAULT 0,
    minimum_price REAL,
    rounding_mode TEXT NOT NULL DEFAULT 'friendly_99',
    is_active INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'needs_review',
    designer TEXT,
    marketplace TEXT,
    source_url TEXT,
    license_summary TEXT,
    category_id TEXT REFERENCES product_categories(id),
    status_id TEXT NOT NULL DEFAULT 'idea' REFERENCES product_statuses(id),
    source_id TEXT REFERENCES product_sources(id),
    license_id TEXT REFERENCES product_licenses(id),
    model_url TEXT,
    main_file_id INTEGER REFERENCES product_files(id),
    main_photo_id INTEGER REFERENCES product_photos(id),
    etsy_listing_url TEXT,
    default_material TEXT,
    primary_color TEXT,
    accent_color TEXT,
    preferred_printer_id INTEGER REFERENCES printers(id),
    estimated_print_time_s INTEGER,
    estimated_filament_g REAL,
    target_sale_price REAL,
    booth_price REAL,
    etsy_price REAL,
    packaging_cost REAL,
    handling_minutes REAL,
    target_margin_pct REAL,
    pricing_notes TEXT,
    notes TEXT,
    is_original_design INTEGER NOT NULL DEFAULT 0,
    restock_priority TEXT NOT NULL DEFAULT 'none',
    metadata_json TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_products_status ON products(status)`,
  `CREATE INDEX IF NOT EXISTS idx_products_designer ON products(designer)`,
  `CREATE INDEX IF NOT EXISTS idx_products_marketplace ON products(marketplace)`,
  `CREATE INDEX IF NOT EXISTS idx_products_name ON products(name COLLATE NOCASE)`,
  `CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    role TEXT,
    metadata_json TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_assets_product ON assets(product_id)`,
  `CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(asset_type)`,
  `CREATE TABLE IF NOT EXISTS asset_files (
    asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    file_id INTEGER NOT NULL REFERENCES catalog_files(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'primary',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (asset_id, file_id, role)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_asset_files_file ON asset_files(file_id)`,
  `CREATE TABLE IF NOT EXISTS project_products (
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    relationship TEXT NOT NULL DEFAULT 'primary',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, product_id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_project_products_product ON project_products(product_id)`,
  `CREATE TABLE IF NOT EXISTS product_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    file_id INTEGER REFERENCES catalog_files(id) ON DELETE SET NULL,
    role TEXT NOT NULL DEFAULT 'source',
    label TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_product_files_product ON product_files(product_id)`,
  `CREATE INDEX IF NOT EXISTS idx_product_files_file ON product_files(file_id)`,
  `CREATE TABLE IF NOT EXISTS product_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    file_id INTEGER REFERENCES catalog_files(id) ON DELETE SET NULL,
    path TEXT,
    role TEXT NOT NULL DEFAULT 'gallery',
    caption TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_product_photos_product ON product_photos(product_id)`,
  `CREATE INDEX IF NOT EXISTS idx_product_photos_file ON product_photos(file_id)`,
  `CREATE TABLE IF NOT EXISTS product_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    link_type TEXT NOT NULL,
    url TEXT NOT NULL,
    label TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_product_links_product ON product_links(product_id)`,
  `CREATE INDEX IF NOT EXISTS idx_product_links_type ON product_links(link_type)`,
  `CREATE TABLE IF NOT EXISTS product_jobs (
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    relationship TEXT NOT NULL DEFAULT 'produced',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id, job_id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_product_jobs_job ON product_jobs(job_id)`,
  `CREATE TABLE IF NOT EXISTS product_batches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    pricing_profile_id TEXT NOT NULL REFERENCES pricing_profiles(id),
    planned_quantity INTEGER NOT NULL DEFAULT 1,
    completed_quantity INTEGER NOT NULL DEFAULT 0,
    failed_quantity INTEGER NOT NULL DEFAULT 0,
    material_type TEXT,
    primary_color TEXT,
    printer_id INTEGER REFERENCES printers(id),
    total_filament_g REAL,
    total_print_time_s INTEGER,
    setup_minutes REAL,
    handling_minutes_per_unit REAL,
    packaging_cost_per_unit REAL,
    target_margin_pct REAL,
    platform_fee_pct REAL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS product_batch_jobs (
    batch_id INTEGER NOT NULL REFERENCES product_batches(id) ON DELETE CASCADE,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    relationship TEXT NOT NULL DEFAULT 'production',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (batch_id, job_id)
  )`,
  `CREATE TABLE IF NOT EXISTS file_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id INTEGER NOT NULL REFERENCES catalog_files(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    old_path TEXT,
    new_path TEXT,
    old_root_id INTEGER REFERENCES scan_roots(id),
    new_root_id INTEGER REFERENCES scan_roots(id),
    content_hash TEXT,
    details_json TEXT,
    detected_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_file_history_file ON file_history(file_id)`,
  `CREATE INDEX IF NOT EXISTS idx_file_history_event_type ON file_history(event_type)`,
  `CREATE INDEX IF NOT EXISTS idx_file_history_detected_at ON file_history(detected_at)`,
]) {
  db.exec(sql);
}

db.prepare("INSERT OR IGNORE INTO providers (id, display_name) VALUES (?, ?)").run(
  "bambu",
  "Bambu Lab",
);

for (const [id, label, sortOrder] of [
  ["idea", "Idea", 10],
  ["downloaded_designed", "Downloaded / Designed", 20],
  ["test_print", "Test Print", 30],
  ["needs_tuning", "Needs Tuning", 40],
  ["ready_for_photos", "Ready for Photos", 50],
  ["listed", "Listed", 60],
  ["active", "Active", 70],
  ["selling_well", "Selling Well", 80],
  ["retired", "Retired", 90],
] as const) {
  db.prepare("INSERT OR IGNORE INTO product_statuses (id, label, sort_order) VALUES (?, ?, ?)").run(
    id,
    label,
    sortOrder,
  );
}

for (const [id, label, sortOrder] of [
  ["gaming", "Gaming", 10],
  ["workshop", "Workshop", 20],
  ["home_organization", "Home Organization", 30],
  ["decor", "Decor", 40],
  ["personalized", "Personalized", 50],
  ["seasonal", "Seasonal", 60],
  ["custom_repair_parts", "Custom Repair Parts", 70],
] as const) {
  db.prepare(
    "INSERT OR IGNORE INTO product_categories (id, label, sort_order) VALUES (?, ?, ?)",
  ).run(id, label, sortOrder);
}

for (const [id, label, sortOrder] of [
  ["hive", "Hive", 10],
  ["original", "Original", 20],
  ["printables", "Printables", 30],
  ["makerworld", "MakerWorld", 40],
  ["thangs", "Thangs", 50],
  ["stlflix", "STLFlix", 60],
  ["custom_commission", "Custom Commission", 70],
] as const) {
  db.prepare("INSERT OR IGNORE INTO product_sources (id, label, sort_order) VALUES (?, ?, ?)").run(
    id,
    label,
    sortOrder,
  );
}

for (const [
  id,
  label,
  allowsCommercialSale,
  requiresAttribution,
  allowsStlRedistribution,
  warning,
  sortOrder,
] of [
  ["commercial_allowed", "Commercial Allowed", 1, 0, 0, null, 10],
  [
    "personal_use_only",
    "Personal Use Only",
    0,
    0,
    0,
    "Do not list for sale without permission.",
    20,
  ],
  [
    "attribution_required",
    "Attribution Required",
    1,
    1,
    0,
    "Include designer attribution in listings.",
    30,
  ],
  ["hive_community", "Hive Community", 1, 0, 0, "Do not redistribute STL files.", 40],
  ["hive_plus", "Hive Plus", 1, 0, 0, "Verify current subscription terms before listing.", 50],
  ["original_owned", "Original / Owned by Robinson PrintWorks", 1, 0, 1, null, 60],
  ["unknown_verify", "Unknown / Verify", 0, 0, 0, "Verify license before listing.", 70],
] as const) {
  db.prepare(
    `INSERT OR IGNORE INTO product_licenses
      (id, label, allows_commercial_sale, requires_attribution, allows_stl_redistribution, warning, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    label,
    allowsCommercialSale,
    requiresAttribution,
    allowsStlRedistribution,
    warning,
    sortOrder,
  );
}

addColumnIfMissing(db, "pricing_profiles", "fixed_fee_per_order", "REAL NOT NULL DEFAULT 0");

for (const [
  id,
  label,
  targetMarginPct,
  platformFeePct,
  fixedFeePerOrder,
  failureBufferPct,
  overheadBufferPct,
  defaultPackagingCost,
  defaultSetupMinutes,
  defaultHandlingMinutes,
  minimumPrice,
  sortOrder,
] of [
  ["personal", "Personal", 0, 0, 0, 0, 0, 0, 0, 0, null, 10],
  ["booth", "Booth", 0.5, 0.035, 0, 0.08, 0.05, 0.75, 10, 3, 5, 20],
  ["etsy", "Etsy", 0.55, 0.13, 0.45, 0.08, 0.05, 1, 10, 4, 9.99, 30],
  ["custom", "Custom", 0.55, 0, 0, 0.12, 0.05, 1, 15, 5, 20, 40],
] as const) {
  db.prepare(
    `INSERT OR IGNORE INTO pricing_profiles
      (id, label, target_margin_pct, platform_fee_pct, fixed_fee_per_order,
       failure_buffer_pct, overhead_buffer_pct, default_packaging_cost, default_setup_minutes,
       default_handling_minutes, minimum_price, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    label,
    targetMarginPct,
    platformFeePct,
    fixedFeePerOrder,
    failureBufferPct,
    overheadBufferPct,
    defaultPackagingCost,
    defaultSetupMinutes,
    defaultHandlingMinutes,
    minimumPrice,
    sortOrder,
  );
}

// ── Migrations ────────────────────────────────────────────────────────────────

runDatabaseMigrations(db);

// ── Seed default rates ────────────────────────────────────────────────────────

seedRateTables(db);
seedLaborConfig(db);

// ── Prepared statements ───────────────────────────────────────────────────────

export const stmts = {
  ...createTaskJobStatements(db),
  ...createRateStatements(db),
  ...createProjectStatements(db),
  ...createSyncStatements(db),
};

// ── insertBatch ───────────────────────────────────────────────────────────────

export const insertBatch = createInsertBatch(db, stmts.upsertTask);
