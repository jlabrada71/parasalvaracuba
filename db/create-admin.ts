import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import dotenv from 'dotenv'
import { ensureAdmin } from './ensureAdmin.ts'

// USAGE: node db/create-admin.ts [database]   (same convention as migrate.js)
// Example: pnpm create-admin test  → loads .env.test
const __dirname = dirname(fileURLToPath(import.meta.url))
const database = process.argv[2] || ''
dotenv.config({ path: resolve(__dirname, database ? `../.env.${database}` : '../.env') })

const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const client = new pg.Client({ connectionString: DATABASE_URL })
try {
  await client.connect()
  const result = await ensureAdmin(client, { email: ADMIN_EMAIL ?? '', password: ADMIN_PASSWORD ?? '' })
  console.log(result === 'created' ? `Admin created: ${ADMIN_EMAIL}` : 'An admin already exists; nothing to do.')
} catch (err) {
  console.error(err instanceof Error ? err.message : err)
  process.exitCode = 1
} finally {
  await client.end()
}
