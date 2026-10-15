import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config({ path: '.env.test' })

export const RUN_HTTP = process.env.INTEGRATION === 'true'
export const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000'

export async function api(
  path: string,
  opts: { method?: string; body?: unknown; cookie?: string; headers?: Record<string, string> } = {}
): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    method: opts.method ?? (opts.body !== undefined ? 'POST' : 'GET'),
    headers: {
      ...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(opts.cookie ? { Cookie: opts.cookie } : {}),
      ...opts.headers,
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  })
}

/** Returns "session=<token>" from a Set-Cookie header ('' if none). */
export function cookieFrom(res: Response): string {
  const raw = res.headers.getSetCookie().find(c => c.startsWith('session=')) ?? ''
  return raw.split(';')[0]
}

export async function loginAs(email: string, password: string): Promise<string> {
  const res = await api('/api/auth/login', { body: { email, password } })
  if (res.status !== 200) throw new Error(`login failed for ${email}: ${res.status}`)
  return cookieFrom(res)
}

export const adminCookie = () => loginAs(process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!)

export async function withDb<T>(fn: (c: pg.Client) => Promise<T>): Promise<T> {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  try { return await fn(client) } finally { await client.end() }
}
