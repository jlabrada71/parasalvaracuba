// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { RUN_HTTP, api, adminCookie, loginAs, cookieFrom, withDb } from './helpers'
import { hashPassword } from '../../server/utils/password'

const uniq = () => `invitee-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`
const tokenOf = (link: string) => link.split('/invite/')[1]

describe.skipIf(!RUN_HTTP)('Invitations API (HTTP)', () => {
  it('rejects unauthenticated (401) and non-admin (403) access to admin endpoints', async () => {
    expect((await api('/api/admin/invitations')).status).toBe(401)
    expect((await api('/api/admin/users')).status).toBe(401)
    expect((await api('/api/admin/invitations', { body: { email: uniq() } })).status).toBe(401)

    const email = uniq()
    await withDb(async c => c.query(`INSERT INTO users (email, password_hash, role) VALUES ($1,$2,'author')`, [email, await hashPassword('author-user-pw1')]))
    const cookie = await loginAs(email, 'author-user-pw1')
    expect((await api('/api/admin/invitations', { cookie })).status).toBe(403)
    expect((await api('/api/admin/invitations', { cookie, body: { email: uniq() } })).status).toBe(403)
    expect((await api('/api/admin/users', { cookie })).status).toBe(403)
  })

  it('full lifecycle: invite → validate → accept → login; token is single-use', async () => {
    const admin = await adminCookie()
    const email = uniq()
    const create = await api('/api/admin/invitations', { cookie: admin, body: { email: `  ${email.toUpperCase()} `, role: 'author' } })
    expect(create.status).toBe(201)
    const inv = await create.json()
    expect(inv.email).toBe(email)
    expect(inv.link).toMatch(/\/invite\/[A-Za-z0-9_-]{43}$/)
    const token = tokenOf(inv.link)

    const list = await (await api('/api/admin/invitations', { cookie: admin })).json()
    const listed = list.find((i: any) => i.id === inv.id)
    expect(listed).toBeTruthy()
    expect(JSON.stringify(listed)).not.toContain(token)

    expect(await (await api(`/api/invitations/${token}`)).json()).toEqual({ email, role: 'author' })

    const accept = await api(`/api/invitations/${token}/accept`, { body: { password: 'brand-new-password' } })
    expect(accept.status).toBe(201)
    expect(cookieFrom(accept)).toMatch(/^session=/)
    expect((await accept.json()).user).toMatchObject({ email, role: 'author' })

    expect((await api(`/api/invitations/${token}`)).status).toBe(404)
    expect((await api(`/api/invitations/${token}/accept`, { body: { password: 'another-password-1' } })).status).toBe(404)
    await loginAs(email, 'brand-new-password')

    const users = await (await api('/api/admin/users', { cookie: admin })).json()
    const row = users.find((u: any) => u.email === email)
    expect(row).toMatchObject({ role: 'author', is_active: true })
    expect(JSON.stringify(row)).not.toMatch(/password|scrypt/i)
  })

  it('re-inviting a pending email kills the old link and the new one works', async () => {
    const admin = await adminCookie()
    const email = uniq()
    const first = tokenOf((await (await api('/api/admin/invitations', { cookie: admin, body: { email } })).json()).link)
    const second = tokenOf((await (await api('/api/admin/invitations', { cookie: admin, body: { email } })).json()).link)
    expect((await api(`/api/invitations/${first}`)).status).toBe(404)
    expect((await api(`/api/invitations/${second}`)).status).toBe(200)
  })

  it('409 when the email already has an account', async () => {
    const admin = await adminCookie()
    const res = await api('/api/admin/invitations', { cookie: admin, body: { email: process.env.ADMIN_EMAIL } })
    expect(res.status).toBe(409)
  })

  it('400 for an invalid email or unknown role', async () => {
    const admin = await adminCookie()
    expect((await api('/api/admin/invitations', { cookie: admin, body: { email: 'not-an-email' } })).status).toBe(400)
    expect((await api('/api/admin/invitations', { cookie: admin, body: { email: uniq(), role: 'superuser' } })).status).toBe(400)
  })

  it('revoked and expired invitations cannot be used', async () => {
    const admin = await adminCookie()
    const a = await (await api('/api/admin/invitations', { cookie: admin, body: { email: uniq() } })).json()
    expect((await api(`/api/admin/invitations/${a.id}`, { method: 'DELETE', cookie: admin })).status).toBe(200)
    expect((await api(`/api/invitations/${tokenOf(a.link)}`)).status).toBe(404)
    expect((await api(`/api/admin/invitations/${a.id}`, { method: 'DELETE', cookie: admin })).status).toBe(404)

    const b = await (await api('/api/admin/invitations', { cookie: admin, body: { email: uniq() } })).json()
    await withDb(c => c.query(`UPDATE invitations SET expires_at = NOW() - INTERVAL '1 minute' WHERE id = $1`, [b.id]))
    expect((await api(`/api/invitations/${tokenOf(b.link)}`)).status).toBe(404)
    expect((await api(`/api/invitations/${tokenOf(b.link)}/accept`, { body: { password: 'valid-password-1' } })).status).toBe(404)
  })

  it('accept enforces password length (10–200)', async () => {
    const admin = await adminCookie()
    const inv = await (await api('/api/admin/invitations', { cookie: admin, body: { email: uniq() } })).json()
    const token = tokenOf(inv.link)
    expect((await api(`/api/invitations/${token}/accept`, { body: { password: 'short' } })).status).toBe(400)
    expect((await api(`/api/invitations/${token}/accept`, { body: { password: 'x'.repeat(10_000) } })).status).toBe(400)
    expect((await api(`/api/invitations/${token}`)).status).toBe(200) // still usable
  })

  it('garbage tokens and ids give 404, never 500', async () => {
    const admin = await adminCookie()
    expect((await api('/api/invitations/abc')).status).toBe(404)
    expect((await api(`/api/invitations/${'A'.repeat(500)}`)).status).toBe(404)
    expect((await api('/api/invitations/abc/accept', { body: { password: 'valid-password-1' } })).status).toBe(404)
    expect((await api('/api/admin/invitations/not-a-uuid', { method: 'DELETE', cookie: admin })).status).toBe(404)
  })

  it('accepting when an account was created meanwhile → 409 and the invite is not consumed', async () => {
    const admin = await adminCookie()
    const email = uniq()
    const inv = await (await api('/api/admin/invitations', { cookie: admin, body: { email } })).json()
    await withDb(async c => c.query(`INSERT INTO users (email, password_hash, role) VALUES ($1,$2,'author')`, [email, await hashPassword('someone-else-pw1')]))
    const res = await api(`/api/invitations/${tokenOf(inv.link)}/accept`, { body: { password: 'valid-password-1' } })
    expect(res.status).toBe(409)
  })
})
