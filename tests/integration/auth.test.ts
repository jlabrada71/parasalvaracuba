// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { RUN_HTTP, api, cookieFrom, loginAs, adminCookie, withDb } from './helpers'
import { hashPassword } from '../../server/utils/password'

describe.skipIf(!RUN_HTTP)('Auth API (HTTP)', () => {
  const ADMIN = () => process.env.ADMIN_EMAIL!
  const PW = () => process.env.ADMIN_PASSWORD!

  it('logs in with valid credentials, sets an httpOnly cookie, never returns the hash', async () => {
    const res = await api('/api/auth/login', { body: { email: ADMIN(), password: PW() } })
    expect(res.status).toBe(200)
    const setCookie = res.headers.getSetCookie().find(c => c.startsWith('session='))!
    expect(setCookie).toMatch(/HttpOnly/i)
    expect(setCookie).toMatch(/SameSite=Lax/i)
    const body = await res.json()
    expect(body.user).toMatchObject({ email: ADMIN().toLowerCase(), role: 'admin' })
    expect(JSON.stringify(body)).not.toMatch(/scrypt|password/i)
  })

  it('normalizes email case and whitespace on login', async () => {
    const res = await api('/api/auth/login', { body: { email: `  ${ADMIN().toUpperCase()} `, password: PW() } })
    expect(res.status).toBe(200)
  })

  it('returns the same generic 401 for wrong password and unknown email', async () => {
    const a = await api('/api/auth/login', { body: { email: ADMIN(), password: 'definitely-wrong-pw' } })
    const b = await api('/api/auth/login', { body: { email: 'nobody-here@example.com', password: 'definitely-wrong-pw' } })
    expect(a.status).toBe(401)
    expect(b.status).toBe(401)
    expect((await a.json()).message).toBe((await b.json()).message)
  })

  it('rejects an overlong password with 400', async () => {
    const res = await api('/api/auth/login', { body: { email: ADMIN(), password: 'x'.repeat(10_000) } })
    expect(res.status).toBe(400)
  })

  it('rejects a missing body with 400', async () => {
    const res = await api('/api/auth/login', { body: {} })
    expect(res.status).toBe(400)
  })

  it('rate-limits repeated failures for one email (429 on the 6th)', async () => {
    const email = `ratelimit-${Date.now()}@example.com`
    const statuses: number[] = []
    for (let i = 0; i < 6; i++) {
      statuses.push((await api('/api/auth/login', { body: { email, password: 'wrong-password-1' } })).status)
    }
    expect(statuses.slice(0, 5).every(s => s === 401)).toBe(true)
    expect(statuses[5]).toBe(429)
  })

  it('/api/auth/me returns the user for a session and null without', async () => {
    const cookie = await adminCookie()
    const me = await (await api('/api/auth/me', { cookie })).json()
    expect(me.user).toMatchObject({ role: 'admin' })
    const anon = await (await api('/api/auth/me')).json()
    expect(anon.user).toBeNull()
  })

  it('/api/auth/me still returns the legacy email identity', async () => {
    const me = await (await api('/api/auth/me', { headers: { 'X-User-Email': 'Legacy@Example.com' } })).json()
    expect(me.email).toBe('legacy@example.com')
  })

  it('logout invalidates the session', async () => {
    const cookie = await adminCookie()
    const out = await api('/api/auth/logout', { method: 'POST', cookie })
    expect(out.status).toBe(200)
    const me = await (await api('/api/auth/me', { cookie })).json()
    expect(me.user).toBeNull()
  })

  it('a deactivated user cannot log in and an existing session stops working', async () => {
    const email = `inactive-${Date.now()}@example.com`
    const hash = await hashPassword('inactive-user-pw')
    await withDb(c => c.query(`INSERT INTO users (email, password_hash, role) VALUES ($1,$2,'author')`, [email, hash]))
    const cookie = await loginAs(email, 'inactive-user-pw')
    expect((await (await api('/api/auth/me', { cookie })).json()).user).not.toBeNull()
    await withDb(c => c.query(`UPDATE users SET is_active = FALSE WHERE email = $1`, [email]))
    expect((await (await api('/api/auth/me', { cookie })).json()).user).toBeNull()
    const res = await api('/api/auth/login', { body: { email, password: 'inactive-user-pw' } })
    expect(res.status).toBe(401)
    expect(cookieFrom(res)).toBe('')
  })
})
