import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../server/utils/db', () => ({ query: vi.fn(), queryOne: vi.fn() }))
vi.mock('h3', async (orig) => ({
  ...(await orig<typeof import('h3')>()),
  setCookie: vi.fn(),
  deleteCookie: vi.fn(),
  getCookie: vi.fn(),
}))

import { query, queryOne } from '../../server/utils/db'
import { setCookie, deleteCookie, getCookie } from 'h3'
import { createSession, getSessionUser, destroySession, SESSION_COOKIE } from '../../server/utils/session'
import { hashToken } from '../../server/utils/tokens'

const event = {} as any

describe('session', () => {
  beforeEach(() => vi.clearAllMocks())

  it('createSession stores only the token hash and sets a hardened cookie', async () => {
    await createSession(event, 'user-1')
    const [, params] = vi.mocked(query).mock.calls[0]
    const [, cookieName, cookieToken, opts] = vi.mocked(setCookie).mock.calls[0] as any
    expect(cookieName).toBe(SESSION_COOKIE)
    expect(params![0]).toBe(hashToken(cookieToken))
    expect(params![0]).not.toBe(cookieToken)
    expect(params![1]).toBe('user-1')
    expect(opts).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/' })
  })

  it('createSession purges expired sessions so the table does not grow forever', async () => {
    await createSession(event, 'user-1')
    const sqls = vi.mocked(query).mock.calls.map(c => String(c[0]))
    expect(sqls.some(sql => /DELETE FROM sessions\s+WHERE expires_at\s*<\s*NOW\(\)/i.test(sql))).toBe(true)
  })

  it('getSessionUser looks the session up by hash and returns the user', async () => {
    vi.mocked(queryOne).mockResolvedValue({ id: 'u1', email: 'a@b.co', role: 'admin' })
    expect(await getSessionUser('tok')).toEqual({ id: 'u1', email: 'a@b.co', role: 'admin' })
    const [sql, params] = vi.mocked(queryOne).mock.calls[0]
    expect(params).toEqual([hashToken('tok')])
    expect(sql).toMatch(/is_active/)
    expect(sql).toMatch(/expires_at\s*>\s*NOW\(\)/i)
  })

  it('getSessionUser returns null when nothing matches', async () => {
    vi.mocked(queryOne).mockResolvedValue(null)
    expect(await getSessionUser('tok')).toBeNull()
  })

  it('destroySession deletes the row and clears the cookie', async () => {
    vi.mocked(getCookie).mockReturnValue('tok')
    await destroySession(event)
    expect(vi.mocked(query).mock.calls[0][1]).toEqual([hashToken('tok')])
    expect(deleteCookie).toHaveBeenCalledWith(event, SESSION_COOKIE, expect.objectContaining({ path: '/' }))
  })

  it('destroySession still clears the cookie when there is none', async () => {
    vi.mocked(getCookie).mockReturnValue(undefined)
    await destroySession(event)
    expect(query).not.toHaveBeenCalled()
    expect(deleteCookie).toHaveBeenCalled()
  })
})
