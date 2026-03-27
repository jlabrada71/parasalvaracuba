import pg from 'pg'
import { useRuntimeConfig } from '#app'

const { Pool } = pg

let _pool: pg.Pool | null = null

function getPool(): pg.Pool {
  if (!_pool) {
    const config = useRuntimeConfig()
    _pool = new Pool({ connectionString: config.databaseUrl })
  }
  return _pool
}

/**
 * Execute a parameterised query and return all rows.
 * Usage: await query('SELECT * FROM ideas WHERE id = $1', [id])
 */
export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const pool = getPool()
  const result = await pool.query<T>(sql, params)
  return result.rows
}

/**
 * Execute a query and return the first row only (or null).
 */
export async function queryOne<T extends pg.QueryResultRow = pg.QueryResultRow>(
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] ?? null
}
