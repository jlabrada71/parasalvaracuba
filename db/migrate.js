#!/usr/bin/env node
import { readFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';
import dotenv from 'dotenv';

// USAGE: node migrate.js [database]
// If database is provided, it will load .env.[database], otherwise it will load .env
// Example: node migrate.js test will load .env.test
//          node migrate.js prod will load .env.prod

const __dirname = dirname(fileURLToPath(import.meta.url));

const file = '../.env';
const database = process.argv[2] || '';

const envFile = database ? `${file}.${database}` : file;
dotenv.config({ path: resolve(__dirname, envFile) });


const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set in .env');
  process.exit(1);
}

const MIGRATIONS_DIR = resolve(__dirname, 'migrations');

const client = new Client({ connectionString: DATABASE_URL });

async function run() {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS migration_runs (
      id       SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      ran_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const { rows } = await client.query('SELECT filename FROM migration_runs');
  const ran = new Set(rows.map(r => r.filename));

  const files = readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort((a, b) => a.slice(0, 3).localeCompare(b.slice(0, 3)));

  const pending = files.filter(f => !ran.has(f));

  if (pending.length === 0) {
    console.log('No pending migrations.');
    await client.end();
    return;
  }

  for (const file of pending) {
    const sql = readFileSync(resolve(MIGRATIONS_DIR, file), 'utf8');
    console.log(`Running migration: ${file}`);
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('INSERT INTO migration_runs (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`  ✓ ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`  ✗ ${file}: ${err.message}`);
      await client.end();
      process.exit(1);
    }
  }

  await client.end();
}

run().catch(async err => {
  console.error(err.message);
  await client.end().catch(() => {});
  process.exit(1);
});
