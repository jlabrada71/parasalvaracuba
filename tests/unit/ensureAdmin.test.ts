import { describe, it, expect, vi } from 'vitest'
import { ensureAdmin } from '../../db/ensureAdmin'
import { verifyPassword } from '../../server/utils/password'

function fakeClient(existingAdmins: number) {
  const calls: { sql: string; params?: unknown[] }[] = []
  return {
    calls,
    query: vi.fn(async (sql: string, params?: unknown[]) => {
      calls.push({ sql, params })
      if (/SELECT 1 FROM users/i.test(sql)) return { rows: existingAdmins ? [{ '?column?': 1 }] : [] }
      return { rows: [] }
    }),
  }
}

describe('ensureAdmin', () => {
  it('does nothing when an admin already exists', async () => {
    const client = fakeClient(1)
    expect(await ensureAdmin(client, { email: 'a@example.com', password: 'longenough-pw' })).toBe('exists')
    expect(client.calls.some(c => /INSERT/i.test(c.sql))).toBe(false)
  })

  it('creates an admin with lowercase email and a hashed password', async () => {
    const client = fakeClient(0)
    expect(await ensureAdmin(client, { email: ' Admin@Example.COM ', password: 'longenough-pw' })).toBe('created')
    const insert = client.calls.find(c => /INSERT INTO users/i.test(c.sql))!
    expect(insert.params![0]).toBe('admin@example.com')
    expect(insert.params![1]).not.toBe('longenough-pw')
    expect(await verifyPassword('longenough-pw', insert.params![1] as string)).toBe(true)
  })

  it('rejects a password shorter than 10 characters', async () => {
    await expect(ensureAdmin(fakeClient(0), { email: 'a@example.com', password: 'short' })).rejects.toThrow(/password/i)
  })

  it('rejects an invalid email', async () => {
    await expect(ensureAdmin(fakeClient(0), { email: 'nope', password: 'longenough-pw' })).rejects.toThrow(/email/i)
  })
})
