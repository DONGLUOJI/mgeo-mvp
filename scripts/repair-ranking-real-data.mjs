import { createHash } from "node:crypto";
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

function canonicalizeJoinedRows(rows) {
  const queries = new Map();
  const brands = new Map();
  const observations = new Map();

  for (const row of rows) {
    if (row.query_industry !== row.industry || row.brand_industry !== row.industry || row.query_city !== row.city) {
      continue;
    }

    const queryKey = `${row.city}|${row.industry}|${row.query_text}`;
    const queryId = buildSlugId("rq", row.city, row.industry, row.query_text);
    if (!queries.has(queryKey)) {
      queries.set(queryKey, {
        id: queryId,
        industry: row.industry,
        city: row.city,
        query_text: row.query_text,
      });
    }

    const cityScope = row.city_scope || row.city;
    const brandKey = `${cityScope}|${row.industry}|${row.brand_name}`;
    const brandId = buildSlugId("rb", cityScope, row.industry, row.brand_name);
    if (!brands.has(brandKey)) {
      brands.set(brandKey, {
        id: brandId,
        brand_name: row.brand_name,
        industry: row.industry,
        city_scope: cityScope,
        brand_type: row.brand_type || "national",
      });
    }

    const observationId = buildSlugId(
      "ro",
      row.snapshot_date,
      row.city,
      row.industry,
      row.model,
      row.query_text,
      row.brand_name
    );
    observations.set(observationId, {
      id: observationId,
      snapshot_date: row.snapshot_date,
      query_id: queryId,
      brand_id: brandId,
      model: row.model,
      mentioned: row.mentioned,
      mention_position: row.mention_position,
      sentiment: row.sentiment,
      source_names_json: row.source_names_json || "[]",
      answer_text: row.answer_text || "",
      city: row.city,
      industry: row.industry,
    });
  }

  return {
    queries: Array.from(queries.values()),
    brands: Array.from(brands.values()),
    observations: Array.from(observations.values()),
  };
}

async function repairPostgres() {
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
    const { rows } = await client.query(`
      SELECT
        o.snapshot_date,
        o.model,
        o.mentioned,
        o.mention_position,
        o.sentiment,
        o.source_names_json,
        o.answer_text,
        o.city,
        o.industry,
        q.query_text,
        q.industry AS query_industry,
        q.city AS query_city,
        b.brand_name,
        b.city_scope,
        b.brand_type,
        b.industry AS brand_industry
      FROM ranking_observations o
      JOIN ranking_queries q ON q.id = o.query_id
      JOIN ranking_brands b ON b.id = o.brand_id
      ORDER BY o.snapshot_date, o.city, o.industry, o.model, q.query_text, b.brand_name
    `);

    const canonical = canonicalizeJoinedRows(rows);

    await client.query("BEGIN");
    await client.query("DELETE FROM ranking_observations");
    await client.query("DELETE FROM ranking_queries");
    await client.query("DELETE FROM ranking_brands");

    for (const query of canonical.queries) {
      await client.query(
        `INSERT INTO ranking_queries (id, industry, city, query_text, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [query.id, query.industry, query.city, query.query_text]
      );
    }

    for (const brand of canonical.brands) {
      await client.query(
        `INSERT INTO ranking_brands (id, brand_name, industry, city_scope, brand_type, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [brand.id, brand.brand_name, brand.industry, brand.city_scope, brand.brand_type]
      );
    }

    for (const observation of canonical.observations) {
      await client.query(
        `INSERT INTO ranking_observations (
           id, snapshot_date, query_id, brand_id, model, mentioned, mention_position,
           sentiment, source_names_json, answer_text, city, industry, created_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)`,
        [
          observation.id,
          observation.snapshot_date,
          observation.query_id,
          observation.brand_id,
          observation.model,
          observation.mentioned,
          observation.mention_position,
          observation.sentiment,
          observation.source_names_json,
          observation.answer_text,
          observation.city,
          observation.industry,
        ]
      );
    }

    await client.query("COMMIT");
    console.log(
      `Repaired postgres ranking data: ${canonical.observations.length} observations, ${canonical.queries.length} queries, ${canonical.brands.length} brands`
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

function repairSqlite() {
  const dbPath = path.join(process.cwd(), "data", "mgeo.sqlite");
  const db = new Database(dbPath);

  const rows = db
    .prepare(`
      SELECT
        o.snapshot_date,
        o.model,
        o.mentioned,
        o.mention_position,
        o.sentiment,
        o.source_names_json,
        o.answer_text,
        o.city,
        o.industry,
        q.query_text,
        q.industry AS query_industry,
        q.city AS query_city,
        b.brand_name,
        b.city_scope,
        b.brand_type,
        b.industry AS brand_industry
      FROM ranking_observations o
      JOIN ranking_queries q ON q.id = o.query_id
      JOIN ranking_brands b ON b.id = o.brand_id
      ORDER BY o.snapshot_date, o.city, o.industry, o.model, q.query_text, b.brand_name
    `)
    .all();

  const canonical = canonicalizeJoinedRows(rows);

  const tx = db.transaction(() => {
    db.prepare("DELETE FROM ranking_observations").run();
    db.prepare("DELETE FROM ranking_queries").run();
    db.prepare("DELETE FROM ranking_brands").run();

    const insertQuery = db.prepare(`
      INSERT INTO ranking_queries (id, industry, city, query_text, is_active, created_at, updated_at)
      VALUES (@id, @industry, @city, @query_text, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    const insertBrand = db.prepare(`
      INSERT INTO ranking_brands (id, brand_name, industry, city_scope, brand_type, is_active, created_at, updated_at)
      VALUES (@id, @brand_name, @industry, @city_scope, @brand_type, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    const insertObservation = db.prepare(`
      INSERT INTO ranking_observations (
        id, snapshot_date, query_id, brand_id, model, mentioned, mention_position,
        sentiment, source_names_json, answer_text, city, industry, created_at
      )
      VALUES (
        @id, @snapshot_date, @query_id, @brand_id, @model, @mentioned, @mention_position,
        @sentiment, @source_names_json, @answer_text, @city, @industry, CURRENT_TIMESTAMP
      )
    `);

    canonical.queries.forEach((query) => insertQuery.run(query));
    canonical.brands.forEach((brand) => insertBrand.run(brand));
    canonical.observations.forEach((observation) =>
      insertObservation.run({
        ...observation,
        mentioned: observation.mentioned ? 1 : 0,
      })
    );
  });

  tx();
  db.close();

  console.log(
    `Repaired sqlite ranking data: ${canonical.observations.length} observations, ${canonical.queries.length} queries, ${canonical.brands.length} brands`
  );
}

async function main() {
  if (process.env.DATABASE_URL) {
    await repairPostgres();
    return;
  }

  repairSqlite();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
