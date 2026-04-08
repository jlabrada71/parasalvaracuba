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
  console.log(rows.map(r => r.filename));

  await client.end();
}

run().catch(async err => {
  console.error(err.message);
  await client.end().catch(() => {});
  process.exit(1);
});
