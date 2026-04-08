import path from "node:path";
import process from "node:process";

import Database from "better-sqlite3";
import pg from "pg";

const { Pool } = pg;

function printBlock(title, rows, keyLabel = "name", valueLabel = "count") {
  console.log(`\n${title}:`);
  if (!rows.length) {
    console.log("- 暂无数据");
    return;
  }

  for (const row of rows) {
    console.log(`- ${row[keyLabel]}: ${row[valueLabel]}`);
  }
}

async function readPostgresStatus() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.PGSSL === "disable"
        ? false
        : {
            rejectUnauthorized: false,
          },
  });

  try {
    const summary = await pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(DISTINCT snapshot_date)::int AS snapshots,
        COUNT(DISTINCT city)::int AS cities,
        COUNT(DISTINCT industry)::int AS industries,
        COUNT(DISTINCT model)::int AS models,
        MAX(snapshot_date)::text AS latest
      FROM ranking_observations
    `);
    const byCity = await pool.query(
      `SELECT city AS name, COUNT(*)::int AS count FROM ranking_observations GROUP BY city ORDER BY count DESC, city ASC LIMIT 10`
    );
    const byIndustry = await pool.query(
      `SELECT industry AS name, COUNT(*)::int AS count FROM ranking_observations GROUP BY industry ORDER BY count DESC, industry ASC LIMIT 10`
    );
    const byModel = await pool.query(
      `SELECT model AS name, COUNT(*)::int AS count FROM ranking_observations GROUP BY model ORDER BY count DESC, model ASC LIMIT 10`
    );

    return {
      summary: summary.rows[0],
      byCity: byCity.rows,
      byIndustry: byIndustry.rows,
      byModel: byModel.rows,
      storage: "postgres",
    };
  } finally {
    await pool.end();
  }
}

function readSqliteStatus() {
  const dbPath = path.join(process.cwd(), "data", "mgeo.sqlite");
  const db = new Database(dbPath, { readonly: true });

  try {
    const table = db
      .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'ranking_observations'`)
      .get();

    if (!table) {
      return {
        summary: {
          total: 0,
          snapshots: 0,
          cities: 0,
          industries: 0,
          models: 0,
          latest: null,
        },
        byCity: [],
        byIndustry: [],
        byModel: [],
        storage: "sqlite",
      };
    }

    const summary = db
      .prepare(`
        SELECT
          COUNT(*) AS total,
          COUNT(DISTINCT snapshot_date) AS snapshots,
          COUNT(DISTINCT city) AS cities,
          COUNT(DISTINCT industry) AS industries,
          COUNT(DISTINCT model) AS models,
          MAX(snapshot_date) AS latest
        FROM ranking_observations
      `)
      .get();
    const byCity = db
      .prepare(`SELECT city AS name, COUNT(*) AS count FROM ranking_observations GROUP BY city ORDER BY count DESC, city ASC LIMIT 10`)
      .all();
    const byIndustry = db
      .prepare(`SELECT industry AS name, COUNT(*) AS count FROM ranking_observations GROUP BY industry ORDER BY count DESC, industry ASC LIMIT 10`)
      .all();
    const byModel = db
      .prepare(`SELECT model AS name, COUNT(*) AS count FROM ranking_observations GROUP BY model ORDER BY count DESC, model ASC LIMIT 10`)
      .all();

    return {
      summary,
      byCity,
      byIndustry,
      byModel,
      storage: "sqlite",
    };
  } finally {
    db.close();
  }
}

async function main() {
  const data = process.env.DATABASE_URL ? await readPostgresStatus() : readSqliteStatus();
  const summary = data.summary || {};

  console.log(`真实排名数据状态（${data.storage}）`);
  console.log(`- observation 总数: ${summary.total || 0}`);
  console.log(`- 快照数: ${summary.snapshots || 0}`);
  console.log(`- 城市数: ${summary.cities || 0}`);
  console.log(`- 行业数: ${summary.industries || 0}`);
  console.log(`- 模型数: ${summary.models || 0}`);
  console.log(`- 最新快照: ${summary.latest || "暂无"}`);

  printBlock("按城市统计", data.byCity);
  printBlock("按行业统计", data.byIndustry);
  printBlock("按模型统计", data.byModel);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
