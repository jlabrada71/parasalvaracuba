import { hashPassword, MIN_PASSWORD_LENGTH } from '../server/utils/password.ts'

interface Queryable {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: any[] }>
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function ensureAdmin(
  client: Queryable,
  opts: { email: string; password: string }
): Promise<'created' | 'exists'> {
  const existing = await client.query(`SELECT 1 FROM users WHERE role = 'admin' LIMIT 1`)
  if (existing.rows.length > 0) return 'exists'

  const email = (opts.email ?? '').trim().toLowerCase()
  if (!EMAIL_REGEX.test(email)) throw new Error('ADMIN_EMAIL is missing or not a valid email')
  if (typeof opts.password !== 'string' || opts.password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters`)
  }

  const hash = await hashPassword(opts.password)
  await client.query(
    `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'admin')`,
    [email, hash]
  )
  return 'created'
}
