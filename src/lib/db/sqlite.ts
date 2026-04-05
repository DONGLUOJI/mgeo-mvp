import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "mgeo.sqlite");

let sqliteDb: Database.Database | null = null;

function ensureColumn(db: Database.Database, table: string, column: string, sql: string) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  if (!columns.some((item) => item.name === column)) {
    db.exec(sql);
  }
}

function initializeSqlite(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      plan TEXT NOT NULL DEFAULT 'free',
      monthly_detect_count INTEGER NOT NULL DEFAULT 0,
      monthly_detect_reset_at TEXT,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      session_token TEXT NOT NULL UNIQUE,
      user_id TEXT NOT NULL,
      expires TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS verification_tokens (
      identifier TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires TEXT NOT NULL,
      PRIMARY KEY (identifier, token)
    );

    CREATE TABLE IF NOT EXISTS customers (
      customer_id TEXT PRIMARY KEY,
      brand_name TEXT NOT NULL UNIQUE,
      industry TEXT NOT NULL,
      business_summary TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scan_tasks (
      task_id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      brand_name TEXT NOT NULL,
      industry TEXT NOT NULL,
      query TEXT NOT NULL,
      selected_models_json TEXT NOT NULL,
      execution_mode TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    );

    CREATE TABLE IF NOT EXISTS scan_reports (
      task_id TEXT PRIMARY KEY,
      brand_name TEXT NOT NULL,
      report_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ranking_snapshots (
      id TEXT PRIMARY KEY,
      industry TEXT NOT NULL,
      brand_name TEXT NOT NULL,
      tca_total REAL NOT NULL,
      tca_consistency REAL NOT NULL,
      tca_coverage REAL NOT NULL,
      tca_authority REAL NOT NULL,
      platform_coverage INTEGER NOT NULL,
      delta_7d REAL NOT NULL DEFAULT 0,
      snapshot_date TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_ranking_industry_date
    ON ranking_snapshots(industry, snapshot_date);

    CREATE TABLE IF NOT EXISTS trending_queries (
      id TEXT PRIMARY KEY,
      industry TEXT NOT NULL,
      query_text TEXT NOT NULL,
      heat_score INTEGER NOT NULL DEFAULT 0,
      brand_count INTEGER NOT NULL DEFAULT 0,
      trend_direction TEXT NOT NULL DEFAULT 'stable',
      brands_mentioned_json TEXT,
      snapshot_date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_trending_industry_date
    ON trending_queries(industry, snapshot_date);

    CREATE TABLE IF NOT EXISTS monitored_keywords (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      brand_name TEXT NOT NULL,
      keyword TEXT NOT NULL,
      industry TEXT,
      business_summary TEXT,
      selected_models_json TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS monitor_results (
      id TEXT PRIMARY KEY,
      keyword_id TEXT NOT NULL REFERENCES monitored_keywords(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      tca_total REAL,
      tca_consistency REAL,
      tca_coverage REAL,
      tca_authority REAL,
      tca_level TEXT,
      result_json TEXT NOT NULL,
      checked_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_keywords_user_created
    ON monitored_keywords(user_id, created_at);

    CREATE INDEX IF NOT EXISTS idx_monitor_results_keyword_checked
    ON monitor_results(keyword_id, checked_at);
  `);

  ensureColumn(
    db,
    "ranking_snapshots",
    "brand_logo_url",
    "ALTER TABLE ranking_snapshots ADD COLUMN brand_logo_url TEXT"
  );
  ensureColumn(
    db,
    "ranking_snapshots",
    "rank_position",
    "ALTER TABLE ranking_snapshots ADD COLUMN rank_position INTEGER"
  );
  ensureColumn(
    db,
    "ranking_snapshots",
    "prev_tca_total",
    "ALTER TABLE ranking_snapshots ADD COLUMN prev_tca_total REAL"
  );
  ensureColumn(
    db,
    "ranking_snapshots",
    "platform_detail_json",
    "ALTER TABLE ranking_snapshots ADD COLUMN platform_detail_json TEXT"
  );

  ensureColumn(
    db,
    "users",
    "stripe_customer_id",
    "ALTER TABLE users ADD COLUMN stripe_customer_id TEXT"
  );
  ensureColumn(
    db,
    "users",
    "stripe_subscription_id",
    "ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT"
  );

  ensureColumn(
    db,
    "customers",
    "user_id",
    "ALTER TABLE customers ADD COLUMN user_id TEXT REFERENCES users(id)"
  );
  ensureColumn(
    db,
    "scan_tasks",
    "user_id",
    "ALTER TABLE scan_tasks ADD COLUMN user_id TEXT REFERENCES users(id)"
  );
  ensureColumn(
    db,
    "scan_reports",
    "user_id",
    "ALTER TABLE scan_reports ADD COLUMN user_id TEXT REFERENCES users(id)"
  );
}

function getSqliteDb() {
  if (sqliteDb) {
    return sqliteDb;
  }

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  sqliteDb = new Database(dbPath);
  initializeSqlite(sqliteDb);
  return sqliteDb;
}

function pingSqlite() {
  const db = getSqliteDb();
  db.prepare("SELECT 1").get();
  return {
    ok: true,
    mode: "sqlite" as const,
    path: dbPath,
  };
}

export { dbPath, getSqliteDb, pingSqlite };
