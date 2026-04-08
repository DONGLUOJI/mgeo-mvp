import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import Database from "better-sqlite3";
import pg from "pg";

const { Pool } = pg;

function buildSlugId(prefix, ...parts) {
  const normalized = parts
    .filter(Boolean)
    .map((part) => String(part).trim().toLowerCase().replace(/\s+/g, "-"))
    .join("|");

  const digest = createHash("sha1").update(normalized || prefix, "utf8").digest("hex").slice(0, 24);
  return `${prefix}_${digest}`;
}

function readPayload(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(content);
  const observations = Array.isArray(parsed) ? parsed : parsed.observations;

  if (!Array.isArray(observations) || !observations.length) {
    throw new Error("导入文件里没有 observations 数组");
  }

  return observations;
}

async function importPostgres(observations) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.PGSSL === "disable"
        ? false
        : {
            rejectUnauthorized: false,
          },
  });

  const client = await pool.connect();
  try {
    for (const observation of observations) {
      const nextQueryId = buildSlugId("rq", observation.city, observation.industry, observation.queryText);
      const existingQuery = await client.query(
        `SELECT id FROM ranking_queries WHERE city = $1 AND industry = $2 AND query_text = $3 LIMIT 1`,
        [observation.city, observation.industry, observation.queryText]
      );
      const queryId = existingQuery.rows[0]?.id || nextQueryId;

      const nextBrandId = buildSlugId("rb", observation.cityScope || observation.city, observation.industry, observation.brandName);
      const existingBrand = await client.query(
        `SELECT id FROM ranking_brands WHERE brand_name = $1 AND industry = $2 AND city_scope = $3 LIMIT 1`,
        [observation.brandName, observation.industry, observation.cityScope || observation.city]
      );
      const brandId = existingBrand.rows[0]?.id || nextBrandId;

      const nextObservationId = buildSlugId(
        "ro",
        observation.snapshotDate,
        observation.city,
        observation.industry,
        observation.model,
        observation.queryText,
        observation.brandName
      );
      const existingObservation = await client.query(
        `
          SELECT id
          FROM ranking_observations
          WHERE snapshot_date = $1
            AND city = $2
            AND industry = $3
            AND model = $4
            AND query_id = $5
            AND brand_id = $6
          LIMIT 1
        `,
        [observation.snapshotDate, observation.city, observation.industry, observation.model, queryId, brandId]
      );
      const observationId = existingObservation.rows[0]?.id || nextObservationId;

      await client.query(
        `
          INSERT INTO ranking_queries (id, industry, city, query_text, is_active, updated_at)
          VALUES ($1, $2, $3, $4, TRUE, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE
          SET industry = EXCLUDED.industry,
              city = EXCLUDED.city,
              query_text = EXCLUDED.query_text,
              is_active = TRUE,
              updated_at = CURRENT_TIMESTAMP
        `,
        [queryId, observation.industry, observation.city, observation.queryText]
      );

      await client.query(
        `
          INSERT INTO ranking_brands (id, brand_name, industry, city_scope, brand_type, is_active, updated_at)
          VALUES ($1, $2, $3, $4, $5, TRUE, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE
          SET brand_name = EXCLUDED.brand_name,
              industry = EXCLUDED.industry,
              city_scope = EXCLUDED.city_scope,
              brand_type = EXCLUDED.brand_type,
              is_active = TRUE,
              updated_at = CURRENT_TIMESTAMP
        `,
        [brandId, observation.brandName, observation.industry, observation.cityScope || observation.city, observation.brandType || "national"]
      );

      await client.query(
        `
          INSERT INTO ranking_observations (
            id, snapshot_date, query_id, brand_id, model, mentioned, mention_position,
            sentiment, source_names_json, answer_text, city, industry
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO UPDATE
          SET mentioned = EXCLUDED.mentioned,
              mention_position = EXCLUDED.mention_position,
              sentiment = EXCLUDED.sentiment,
              source_names_json = EXCLUDED.source_names_json,
              answer_text = EXCLUDED.answer_text,
              city = EXCLUDED.city,
              industry = EXCLUDED.industry
        `,
        [
          observationId,
          observation.snapshotDate,
          queryId,
          brandId,
          observation.model,
          Boolean(observation.mentioned),
          observation.mentionPosition ?? null,
          observation.sentiment ?? null,
          JSON.stringify(observation.sourceNames || []),
          observation.answerText || "",
          observation.city,
          observation.industry,
        ]
      );
    }
  } finally {
    client.release();
    await pool.end();
  }
}

function importSqlite(observations) {
  const dbPath = path.join(process.cwd(), "data", "mgeo.sqlite");
  const db = new Database(dbPath);

  db.exec(`
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
  `);

  const upsertQuery = db.prepare(`
    INSERT INTO ranking_queries (id, industry, city, query_text, is_active, created_at, updated_at)
    VALUES (@id, @industry, @city, @queryText, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      industry = excluded.industry,
      city = excluded.city,
      query_text = excluded.query_text,
      is_active = 1,
      updated_at = CURRENT_TIMESTAMP
  `);

  const upsertBrand = db.prepare(`
    INSERT INTO ranking_brands (id, brand_name, industry, city_scope, brand_type, is_active, created_at, updated_at)
    VALUES (@id, @brandName, @industry, @cityScope, @brandType, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      brand_name = excluded.brand_name,
      industry = excluded.industry,
      city_scope = excluded.city_scope,
      brand_type = excluded.brand_type,
      is_active = 1,
      updated_at = CURRENT_TIMESTAMP
  `);

  const upsertObservation = db.prepare(`
    INSERT INTO ranking_observations (
      id, snapshot_date, query_id, brand_id, model, mentioned, mention_position,
      sentiment, source_names_json, answer_text, city, industry, created_at
    )
    VALUES (
      @id, @snapshotDate, @queryId, @brandId, @model, @mentioned, @mentionPosition,
      @sentiment, @sourceNamesJson, @answerText, @city, @industry, CURRENT_TIMESTAMP
    )
    ON CONFLICT(id) DO UPDATE SET
      mentioned = excluded.mentioned,
      mention_position = excluded.mention_position,
      sentiment = excluded.sentiment,
      source_names_json = excluded.source_names_json,
      answer_text = excluded.answer_text,
      city = excluded.city,
      industry = excluded.industry
  `);

  const selectQueryId = db.prepare(`
    SELECT id FROM ranking_queries
    WHERE city = @city AND industry = @industry AND query_text = @queryText
    LIMIT 1
  `);

  const selectBrandId = db.prepare(`
    SELECT id FROM ranking_brands
    WHERE brand_name = @brandName AND industry = @industry AND city_scope = @cityScope
    LIMIT 1
  `);

  const selectObservationId = db.prepare(`
    SELECT id FROM ranking_observations
    WHERE snapshot_date = @snapshotDate
      AND city = @city
      AND industry = @industry
      AND model = @model
      AND query_id = @queryId
      AND brand_id = @brandId
    LIMIT 1
  `);

  const tx = db.transaction((items) => {
    for (const observation of items) {
      const nextQueryId = buildSlugId("rq", observation.city, observation.industry, observation.queryText);
      const queryId =
        selectQueryId.get({
          city: observation.city,
          industry: observation.industry,
          queryText: observation.queryText,
        })?.id || nextQueryId;

      const nextBrandId = buildSlugId("rb", observation.cityScope || observation.city, observation.industry, observation.brandName);
      const cityScope = observation.cityScope || observation.city;
      const brandId =
        selectBrandId.get({
          brandName: observation.brandName,
          industry: observation.industry,
          cityScope,
        })?.id || nextBrandId;

      const nextObservationId = buildSlugId(
        "ro",
        observation.snapshotDate,
        observation.city,
        observation.industry,
        observation.model,
        observation.queryText,
        observation.brandName
      );
      const observationId =
        selectObservationId.get({
          snapshotDate: observation.snapshotDate,
          city: observation.city,
          industry: observation.industry,
          model: observation.model,
          queryId,
          brandId,
        })?.id || nextObservationId;

      upsertQuery.run({
        id: queryId,
        industry: observation.industry,
        city: observation.city,
        queryText: observation.queryText,
      });

      upsertBrand.run({
        id: brandId,
        brandName: observation.brandName,
        industry: observation.industry,
        cityScope,
        brandType: observation.brandType || "national",
      });

      upsertObservation.run({
        id: observationId,
        snapshotDate: observation.snapshotDate,
        queryId,
        brandId,
        model: observation.model,
        mentioned: observation.mentioned ? 1 : 0,
        mentionPosition: observation.mentionPosition ?? null,
        sentiment: observation.sentiment ?? null,
        sourceNamesJson: JSON.stringify(observation.sourceNames || []),
        answerText: observation.answerText || "",
        city: observation.city,
        industry: observation.industry,
      });
    }
  });

  tx(observations);
  db.close();
}

async function main() {
  const target = process.argv[2] || path.join(process.cwd(), "data", "ranking-observations.template.json");
  const filePath = path.isAbsolute(target) ? target : path.join(process.cwd(), target);
  const observations = readPayload(filePath);

  if (process.env.DATABASE_URL) {
    await importPostgres(observations);
  } else {
    importSqlite(observations);
  }

  console.log(`Imported ${observations.length} ranking observations from ${filePath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
