import { describe, it, expect } from 'vitest'
import { requireAdmin } from '../../server/utils/requireAdmin'

const ev = (user: unknown) => ({ context: { user } }) as any

describe('requireAdmin', () => {
  it('401 without a user', () => {
    expect(() => requireAdmin(ev(null))).toThrowError(expect.objectContaining({ statusCode: 401 }))
  })
  it('403 for a non-admin', () => {
    expect(() => requireAdmin(ev({ id: '1', email: 'a@b.co', role: 'author' }))).toThrowError(expect.objectContaining({ statusCode: 403 }))
  })
  it('returns the admin user', () => {
    const u = { id: '1', email: 'a@b.co', role: 'admin' }
    expect(requireAdmin(ev(u))).toEqual(u)
  })
})
