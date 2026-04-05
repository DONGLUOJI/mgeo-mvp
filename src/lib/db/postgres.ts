import { Pool, type QueryResultRow } from "pg";

let pool: Pool | null = null;
let initialized = false;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL 未配置");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.PGSSL === "disable"
          ? false
          : {
              rejectUnauthorized: false,
            },
    });
  }

  return pool;
}

export async function ensurePostgresSchema() {
  if (initialized) return;

  const client = await getPool().connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT,
        plan TEXT NOT NULL DEFAULT 'free',
        monthly_detect_count INTEGER NOT NULL DEFAULT 0,
        monthly_detect_reset_at TIMESTAMPTZ,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        session_token TEXT NOT NULL UNIQUE,
        user_id TEXT NOT NULL REFERENCES users(id),
        expires TIMESTAMPTZ NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires TIMESTAMPTZ NOT NULL,
        PRIMARY KEY (identifier, token)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        customer_id TEXT PRIMARY KEY,
        brand_name TEXT NOT NULL UNIQUE,
        industry TEXT NOT NULL,
        business_summary TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS scan_tasks (
        task_id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL REFERENCES customers(customer_id),
        brand_name TEXT NOT NULL,
        industry TEXT NOT NULL,
        query TEXT NOT NULL,
        selected_models_json TEXT NOT NULL,
        execution_mode TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS scan_reports (
        task_id TEXT PRIMARY KEY,
        brand_name TEXT NOT NULL,
        report_json TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL
      );
    `);

    await client.query(`
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
        snapshot_date DATE NOT NULL,
        created_at TIMESTAMPTZ NOT NULL
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ranking_industry_date
      ON ranking_snapshots(industry, snapshot_date);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS monitored_keywords (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        brand_name TEXT NOT NULL,
        keyword TEXT NOT NULL,
        industry TEXT,
        business_summary TEXT,
        selected_models_json TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL
      );
    `);

    await client.query(`
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
        checked_at TIMESTAMPTZ NOT NULL
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_keywords_user_created
      ON monitored_keywords(user_id, created_at);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_monitor_results_keyword_checked
      ON monitor_results(keyword_id, checked_at);
    `);

    await client.query(`
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id);
      ALTER TABLE scan_tasks ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id);
      ALTER TABLE scan_reports ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
    `);
    initialized = true;
  } finally {
    client.release();
  }
}

export async function queryPostgres<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = []
) {
  await ensurePostgresSchema();
  return getPool().query<T>(text, values);
}

export async function pingPostgres() {
  const result = await queryPostgres<{ now: string }>("SELECT NOW()::text AS now");
  return {
    ok: true,
    mode: "postgres" as const,
    now: result.rows[0]?.now || null,
  };
}
