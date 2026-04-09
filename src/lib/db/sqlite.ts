import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "mgeo.sqlite");

let sqliteDb: Database.Database | null = null;

function isReadonlySqliteError(error: unknown) {
  return error instanceof Error && /readonly|attempt to write a readonly database/i.test(error.message);
}

function safeExec(db: Database.Database, sql: string) {
  try {
    db.exec(sql);
  } catch (error) {
    if (isReadonlySqliteError(error)) {
      return;
    }
    throw error;
  }
}

function hasColumn(db: Database.Database, table: string, column: string) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  return columns.some((item) => item.name === column);
}

function ensureColumn(db: Database.Database, table: string, column: string, sql: string) {
  if (!hasColumn(db, table, column)) {
    safeExec(db, sql);
  }
}

function initializeSqlite(db: Database.Database, allowWrites: boolean) {
  if (allowWrites) {
    safeExec(db, `
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
      city TEXT NOT NULL DEFAULT '全国',
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
      city TEXT NOT NULL DEFAULT '全国',
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

    CREATE TABLE IF NOT EXISTS supported_cities (
      city_code TEXT PRIMARY KEY,
      city_name TEXT NOT NULL,
      region TEXT NOT NULL,
      brand_count INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ranking_queries (
      id TEXT PRIMARY KEY,
      industry TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT '全国',
      query_text TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_ranking_queries_city_industry_text
    ON ranking_queries(city, industry, query_text);

    CREATE TABLE IF NOT EXISTS ranking_brands (
      id TEXT PRIMARY KEY,
      brand_name TEXT NOT NULL,
      industry TEXT NOT NULL,
      city_scope TEXT NOT NULL DEFAULT '全国',
      brand_type TEXT NOT NULL DEFAULT 'national',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_ranking_brands_name_industry_scope
    ON ranking_brands(brand_name, industry, city_scope);

    CREATE TABLE IF NOT EXISTS ranking_observations (
      id TEXT PRIMARY KEY,
      snapshot_date TEXT NOT NULL,
      query_id TEXT NOT NULL REFERENCES ranking_queries(id),
      brand_id TEXT NOT NULL REFERENCES ranking_brands(id),
      model TEXT NOT NULL,
      mentioned INTEGER NOT NULL DEFAULT 0,
      mention_position INTEGER,
      sentiment TEXT,
      source_names_json TEXT,
      answer_text TEXT,
      city TEXT NOT NULL DEFAULT '全国',
      industry TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_ranking_observations_unique
    ON ranking_observations(snapshot_date, city, industry, model, query_id, brand_id);

    CREATE INDEX IF NOT EXISTS idx_ranking_observations_city_date
    ON ranking_observations(city, industry, snapshot_date);

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

    CREATE TABLE IF NOT EXISTS lead_requests (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      source TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      owner TEXT,
      name TEXT,
      company TEXT,
      brand TEXT,
      phone TEXT,
      contact TEXT,
      industry TEXT,
      region TEXT,
      message TEXT,
      note TEXT,
      user_id TEXT REFERENCES users(id),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_lead_requests_status_created
    ON lead_requests(status, created_at);

    CREATE INDEX IF NOT EXISTS idx_lead_requests_type_created
    ON lead_requests(type, created_at);

    CREATE TABLE IF NOT EXISTS detect_request_events (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      ip_hash TEXT NOT NULL,
      detect_signature TEXT NOT NULL,
      status TEXT NOT NULL,
      task_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_detect_request_events_ip_created
    ON detect_request_events(ip_hash, created_at);

    CREATE INDEX IF NOT EXISTS idx_detect_request_events_user_created
    ON detect_request_events(user_id, created_at);

    CREATE TABLE IF NOT EXISTS system_alert_events (
      id TEXT PRIMARY KEY,
      alert_key TEXT NOT NULL,
      severity TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      detail TEXT,
      occurrence_count INTEGER NOT NULL DEFAULT 1,
      first_seen_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      last_notified_at TEXT,
      resolved_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_system_alert_events_status_seen
    ON system_alert_events(status, last_seen_at);

    CREATE INDEX IF NOT EXISTS idx_system_alert_events_key_status
    ON system_alert_events(alert_key, status);
  `);
  }

  ensureColumn(
    db,
    "ranking_snapshots",
    "city",
    "ALTER TABLE ranking_snapshots ADD COLUMN city TEXT NOT NULL DEFAULT '全国'"
  );
  ensureColumn(
    db,
    "scan_tasks",
    "city",
    "ALTER TABLE scan_tasks ADD COLUMN city TEXT NOT NULL DEFAULT '全国'"
  );
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

  safeExec(db, `
    CREATE INDEX IF NOT EXISTS idx_ranking_city_industry_date
    ON ranking_snapshots(city, industry, snapshot_date);
  `);

  safeExec(db, `
    INSERT OR IGNORE INTO supported_cities (city_code, city_name, region, brand_count, is_active)
    VALUES
      ('national', '全国', '全国', 60, 1),
      ('beijing', '北京', '华北', 0, 1),
      ('shanghai', '上海', '华东', 0, 1),
      ('guangzhou', '广州', '华南', 0, 1),
      ('shenzhen', '深圳', '华南', 35, 1),
      ('hangzhou', '杭州', '华东', 32, 1),
      ('chengdu', '成都', '西南', 30, 1);
  `);
}

function canWriteDbStorage() {
  try {
    if (fs.existsSync(dbPath)) {
      fs.accessSync(dbPath, fs.constants.W_OK);
      return true;
    }

    fs.accessSync(dataDir, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

function getSqliteDb() {
  if (sqliteDb) {
    return sqliteDb;
  }

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  sqliteDb = new Database(dbPath);
  initializeSqlite(sqliteDb, canWriteDbStorage());
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

function sqliteHasColumn(table: string, column: string) {
  return hasColumn(getSqliteDb(), table, column);
}

export { dbPath, getSqliteDb, pingSqlite, sqliteHasColumn };
