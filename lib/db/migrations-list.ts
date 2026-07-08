import type Database from "better-sqlite3";
import {
  addColumnIfMissing,
  columnExists,
  dropColumnIfExists,
  runMigrations,
  sqliteVersionAtLeast,
  tableExists,
  type Migration,
} from "../migrations.js";
import { LABOR_BUFFER_MIGRATION } from "./labor-config.js";

const DB_MIGRATIONS: Migration[] = [
  {
    id: 1,
    description: "rename legacy tasks table to print_tasks",
    up(database) {
      const hasOldTable = tableExists(database, "tasks");
      const hasNewTable = tableExists(database, "print_tasks");
      if (hasOldTable && hasNewTable) database.exec("DROP TABLE tasks");
      else if (hasOldTable) database.exec("ALTER TABLE tasks RENAME TO print_tasks");
    },
  },
  {
    id: 2,
    description: "rebuild very old jobs table without session_id",
    up(database) {
      if (!tableExists(database, "jobs") || columnExists(database, "jobs", "session_id")) return;
      database.exec("DROP TABLE jobs");
      database.exec(`CREATE TABLE jobs (
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
      )`);
    },
  },
  {
    id: 3,
    description: "add normalized print_tasks columns",
    up(database) {
      for (const [columnName, columnDefinition] of [
        ["session_id", "TEXT"],
        ["instanceId", "INTEGER"],
        ["plateIndex", "INTEGER"],
        ["deviceModel", "TEXT"],
        ["title", "TEXT"],
        ["failedType", "INTEGER"],
        ["bedType", "TEXT"],
      ] as const) {
        addColumnIfMissing(database, "print_tasks", columnName, columnDefinition);
      }
    },
  },
  {
    id: 4,
    description: "add auto-project source design id",
    up(database) {
      addColumnIfMissing(database, "projects", "source_design_id", "TEXT");
      database.exec(
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_source_design_id ON projects(source_design_id) WHERE source_design_id IS NOT NULL",
      );
    },
  },
  {
    id: 5,
    description: "add model id to jobs",
    up(database) {
      addColumnIfMissing(database, "jobs", "modelId", "TEXT");
    },
  },
  {
    id: 6,
    description: "add job project and override fields",
    up(database) {
      addColumnIfMissing(database, "jobs", "project_id", "INTEGER REFERENCES projects(id)");
      addColumnIfMissing(database, "jobs", "status_override", "TEXT");
      addColumnIfMissing(database, "jobs", "extra_labor_minutes", "REAL");
    },
  },
  {
    id: 7,
    description: "drop legacy print_tasks pricing columns",
    up(database) {
      const sqliteVersion = (
        database.prepare("SELECT sqlite_version() AS v").get() as { v: string }
      ).v;
      if (!sqliteVersionAtLeast(sqliteVersion, "3.35.0")) return;
      for (const columnName of ["material_cost", "labor_cost", "price", "notes", "customer"]) {
        dropColumnIfExists(database, "print_tasks", columnName);
      }
    },
  },
  {
    id: 8,
    description: "add precomputed price cache tables",
    up(database) {
      database.exec(`CREATE TABLE IF NOT EXISTS job_price_cache (
        job_id      INTEGER PRIMARY KEY REFERENCES jobs(id) ON DELETE CASCADE,
        final_price REAL NOT NULL,
        computed_at TEXT NOT NULL
      )`);
      database.exec(`CREATE TABLE IF NOT EXISTS project_price_cache (
        project_id  INTEGER PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
        final_price REAL NOT NULL,
        computed_at TEXT NOT NULL
      )`);
    },
  },
  LABOR_BUFFER_MIGRATION,
  {
    id: 10,
    description: "add provider-aware print history schema",
    up(database) {
      database.exec(`CREATE TABLE IF NOT EXISTS providers (
        id           TEXT PRIMARY KEY,
        display_name TEXT NOT NULL,
        created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);
      database.exec(`CREATE TABLE IF NOT EXISTS printers (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        provider            TEXT NOT NULL REFERENCES providers(id),
        provider_printer_id TEXT NOT NULL,
        name                TEXT,
        model               TEXT,
        serial              TEXT,
        created_at          TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at          TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(provider, provider_printer_id)
      )`);
      database.exec("CREATE INDEX IF NOT EXISTS idx_printers_provider ON printers(provider)");
      database
        .prepare("INSERT OR IGNORE INTO providers (id, display_name) VALUES (?, ?)")
        .run("bambu", "Bambu Lab");

      for (const [tableName, columns] of [
        [
          "print_tasks",
          [
            ["provider", "TEXT NOT NULL DEFAULT 'bambu'"],
            ["provider_task_id", "TEXT"],
            ["provider_printer_id", "TEXT"],
            ["printer_id", "INTEGER REFERENCES printers(id)"],
          ],
        ],
        [
          "jobs",
          [
            ["provider", "TEXT NOT NULL DEFAULT 'bambu'"],
            ["provider_session_id", "TEXT"],
            ["provider_printer_id", "TEXT"],
            ["printer_id", "INTEGER REFERENCES printers(id)"],
          ],
        ],
        [
          "sync_log",
          [
            ["provider", "TEXT NOT NULL DEFAULT 'bambu'"],
            ["provider_printer_id", "TEXT"],
          ],
        ],
      ] as const) {
        for (const [columnName, columnDefinition] of columns) {
          addColumnIfMissing(database, tableName, columnName, columnDefinition);
        }
      }

      database.exec("UPDATE print_tasks SET provider_task_id = id WHERE provider_task_id IS NULL");
      database.exec(
        "UPDATE print_tasks SET provider_printer_id = deviceId WHERE provider_printer_id IS NULL AND deviceId IS NOT NULL",
      );
      database.exec(
        "INSERT OR IGNORE INTO printers (provider, provider_printer_id, name, model) SELECT 'bambu', deviceId, MAX(deviceName), MAX(deviceModel) FROM print_tasks WHERE deviceId IS NOT NULL AND deviceId != '' GROUP BY deviceId",
      );
      database.exec(
        "UPDATE print_tasks SET printer_id = (SELECT p.id FROM printers p WHERE p.provider = print_tasks.provider AND p.provider_printer_id = print_tasks.provider_printer_id) WHERE printer_id IS NULL AND provider_printer_id IS NOT NULL",
      );
      database.exec(
        "UPDATE jobs SET provider_session_id = session_id WHERE provider_session_id IS NULL",
      );
      database.exec(
        "UPDATE jobs SET provider_printer_id = deviceId WHERE provider_printer_id IS NULL AND deviceId IS NOT NULL",
      );
      database.exec(
        "UPDATE jobs SET printer_id = (SELECT p.id FROM printers p WHERE p.provider = jobs.provider AND p.provider_printer_id = jobs.provider_printer_id) WHERE printer_id IS NULL AND provider_printer_id IS NOT NULL",
      );

      database.exec(
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_print_tasks_provider_task ON print_tasks(provider, provider_task_id) WHERE provider_task_id IS NOT NULL",
      );
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_print_tasks_provider_printer ON print_tasks(provider, provider_printer_id)",
      );
      database.exec(
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_provider_session ON jobs(provider, provider_session_id) WHERE provider_session_id IS NOT NULL",
      );
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_jobs_provider_printer ON jobs(provider, provider_printer_id)",
      );
    },
  },
  {
    id: 11,
    description: "add printer inventory lifecycle fields",
    up(database) {
      addColumnIfMissing(database, "printers", "is_active", "INTEGER NOT NULL DEFAULT 1");
      addColumnIfMissing(database, "printers", "retired_at", "TEXT");
      addColumnIfMissing(database, "printers", "notes", "TEXT");
      database.exec("CREATE INDEX IF NOT EXISTS idx_printers_active ON printers(is_active)");
    },
  },
  {
    id: 12,
    description: "add material usage confidence to filament rows",
    up(database) {
      if (!tableExists(database, "job_filaments")) return;
      addColumnIfMissing(
        database,
        "job_filaments",
        "material_usage_confidence",
        "TEXT NOT NULL DEFAULT 'unknown'",
      );
    },
  },
  {
    id: 13,
    description: "add catalog foundation tables",
    up(database) {
      database.exec(`CREATE TABLE IF NOT EXISTS scan_roots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        root_path TEXT NOT NULL,
        normalized_root_path TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        last_scanned_at TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(normalized_root_path)
      )`);
      database.exec("CREATE INDEX IF NOT EXISTS idx_scan_roots_active ON scan_roots(is_active)");

      database.exec(`CREATE TABLE IF NOT EXISTS managed_blobs (
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
      )`);
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_managed_blobs_hash ON managed_blobs(content_hash, hash_algorithm)",
      );

      database.exec(`CREATE TABLE IF NOT EXISTS catalog_files (
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
        missing_since TEXT,
        metadata_json TEXT,
        first_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(normalized_path)
      )`);
      database.exec("CREATE INDEX IF NOT EXISTS idx_catalog_files_root ON catalog_files(root_id)");
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_catalog_files_content_hash ON catalog_files(content_hash)",
      );
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_catalog_files_extension ON catalog_files(extension)",
      );
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_catalog_files_scan_status ON catalog_files(scan_status)",
      );
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_catalog_files_storage_role ON catalog_files(storage_role)",
      );
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_catalog_files_managed_blob ON catalog_files(managed_blob_id)",
      );
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_catalog_files_filename ON catalog_files(filename COLLATE NOCASE)",
      );

      database.exec(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'needs_review',
        designer TEXT,
        marketplace TEXT,
        source_url TEXT,
        license_summary TEXT,
        metadata_json TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);
      database.exec("CREATE INDEX IF NOT EXISTS idx_products_status ON products(status)");
      database.exec("CREATE INDEX IF NOT EXISTS idx_products_designer ON products(designer)");
      database.exec("CREATE INDEX IF NOT EXISTS idx_products_marketplace ON products(marketplace)");
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_products_name ON products(name COLLATE NOCASE)",
      );

      database.exec(`CREATE TABLE IF NOT EXISTS assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        asset_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        role TEXT,
        metadata_json TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);
      database.exec("CREATE INDEX IF NOT EXISTS idx_assets_product ON assets(product_id)");
      database.exec("CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(asset_type)");

      database.exec(`CREATE TABLE IF NOT EXISTS asset_files (
        asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
        file_id INTEGER NOT NULL REFERENCES catalog_files(id) ON DELETE CASCADE,
        role TEXT NOT NULL DEFAULT 'primary',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (asset_id, file_id, role)
      )`);
      database.exec("CREATE INDEX IF NOT EXISTS idx_asset_files_file ON asset_files(file_id)");

      database.exec(`CREATE TABLE IF NOT EXISTS project_products (
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        relationship TEXT NOT NULL DEFAULT 'primary',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (project_id, product_id)
      )`);
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_project_products_product ON project_products(product_id)",
      );

      database.exec(`CREATE TABLE IF NOT EXISTS file_history (
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
      )`);
      database.exec("CREATE INDEX IF NOT EXISTS idx_file_history_file ON file_history(file_id)");
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_file_history_event_type ON file_history(event_type)",
      );
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_file_history_detected_at ON file_history(detected_at)",
      );
    },
  },
  {
    id: 14,
    description: "add product pipeline catalog schema",
    up(database) {
      database.exec(`CREATE TABLE IF NOT EXISTS product_statuses (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        sort_order INTEGER NOT NULL
      )`);
      database.exec(`CREATE TABLE IF NOT EXISTS product_categories (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        sort_order INTEGER NOT NULL
      )`);
      database.exec(`CREATE TABLE IF NOT EXISTS product_sources (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        sort_order INTEGER NOT NULL
      )`);
      database.exec(`CREATE TABLE IF NOT EXISTS product_licenses (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        allows_commercial_sale INTEGER NOT NULL DEFAULT 0,
        requires_attribution INTEGER NOT NULL DEFAULT 0,
        allows_stl_redistribution INTEGER NOT NULL DEFAULT 0,
        warning TEXT,
        sort_order INTEGER NOT NULL
      )`);

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
        database
          .prepare(
            "INSERT OR IGNORE INTO product_statuses (id, label, sort_order) VALUES (?, ?, ?)",
          )
          .run(id, label, sortOrder);
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
        database
          .prepare(
            "INSERT OR IGNORE INTO product_categories (id, label, sort_order) VALUES (?, ?, ?)",
          )
          .run(id, label, sortOrder);
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
        database
          .prepare("INSERT OR IGNORE INTO product_sources (id, label, sort_order) VALUES (?, ?, ?)")
          .run(id, label, sortOrder);
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
        [
          "hive_plus",
          "Hive Plus",
          1,
          0,
          0,
          "Verify current subscription terms before listing.",
          50,
        ],
        ["original_owned", "Original / Owned by Robinson PrintWorks", 1, 0, 1, null, 60],
        ["unknown_verify", "Unknown / Verify", 0, 0, 0, "Verify license before listing.", 70],
      ] as const) {
        database
          .prepare(
            `INSERT OR IGNORE INTO product_licenses
              (id, label, allows_commercial_sale, requires_attribution, allows_stl_redistribution, warning, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
          )
          .run(
            id,
            label,
            allowsCommercialSale,
            requiresAttribution,
            allowsStlRedistribution,
            warning,
            sortOrder,
          );
      }

      database.exec(`CREATE TABLE IF NOT EXISTS product_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        file_id INTEGER REFERENCES catalog_files(id) ON DELETE SET NULL,
        role TEXT NOT NULL DEFAULT 'source',
        label TEXT,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_product_files_product ON product_files(product_id)",
      );
      database.exec("CREATE INDEX IF NOT EXISTS idx_product_files_file ON product_files(file_id)");

      database.exec(`CREATE TABLE IF NOT EXISTS product_photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        file_id INTEGER REFERENCES catalog_files(id) ON DELETE SET NULL,
        path TEXT,
        role TEXT NOT NULL DEFAULT 'gallery',
        caption TEXT,
        display_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_product_photos_product ON product_photos(product_id)",
      );
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_product_photos_file ON product_photos(file_id)",
      );

      database.exec(`CREATE TABLE IF NOT EXISTS product_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        link_type TEXT NOT NULL,
        url TEXT NOT NULL,
        label TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_product_links_product ON product_links(product_id)",
      );
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_product_links_type ON product_links(link_type)",
      );

      database.exec(`CREATE TABLE IF NOT EXISTS product_jobs (
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
        relationship TEXT NOT NULL DEFAULT 'produced',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (product_id, job_id)
      )`);
      database.exec("CREATE INDEX IF NOT EXISTS idx_product_jobs_job ON product_jobs(job_id)");

      for (const [columnName, columnDefinition] of [
        ["category_id", "TEXT REFERENCES product_categories(id)"],
        ["status_id", "TEXT REFERENCES product_statuses(id)"],
        ["source_id", "TEXT REFERENCES product_sources(id)"],
        ["license_id", "TEXT REFERENCES product_licenses(id)"],
        ["model_url", "TEXT"],
        ["main_file_id", "INTEGER REFERENCES product_files(id)"],
        ["main_photo_id", "INTEGER REFERENCES product_photos(id)"],
        ["etsy_listing_url", "TEXT"],
        ["default_material", "TEXT"],
        ["primary_color", "TEXT"],
        ["accent_color", "TEXT"],
        ["preferred_printer_id", "INTEGER REFERENCES printers(id)"],
        ["estimated_print_time_s", "INTEGER"],
        ["estimated_filament_g", "REAL"],
        ["target_sale_price", "REAL"],
        ["notes", "TEXT"],
        ["is_original_design", "INTEGER NOT NULL DEFAULT 0"],
        ["restock_priority", "TEXT NOT NULL DEFAULT 'none'"],
      ] as const) {
        addColumnIfMissing(database, "products", columnName, columnDefinition);
      }

      database.exec("UPDATE products SET status_id = 'idea' WHERE status_id IS NULL");
    },
  },
];

export function runDatabaseMigrations(database: Database.Database): void {
  runMigrations(database, DB_MIGRATIONS);
}
