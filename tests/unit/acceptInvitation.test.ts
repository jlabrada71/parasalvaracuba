import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('h3', async (orig) => ({
  ...(await orig<typeof import('h3')>()),
  readBody: vi.fn(),
  getRouterParam: vi.fn(),
  setResponseStatus: vi.fn(),
}))
vi.mock('../../server/utils/db', () => ({ queryOne: vi.fn(), query: vi.fn() }))
vi.mock('../../server/utils/password', async (orig) => ({
  ...(await orig<typeof import('../../server/utils/password')>()),
  hashPassword: vi.fn(async () => 'hashed'),
}))
vi.mock('../../server/utils/session', () => ({ createSession: vi.fn() }))

import { readBody, getRouterParam } from 'h3'
import { queryOne } from '../../server/utils/db'
import { hashPassword } from '../../server/utils/password'
import handler from '../../server/api/invitations/[token]/accept.post'

describe('accept invitation handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getRouterParam).mockReturnValue('some-token')
    vi.mocked(readBody).mockResolvedValue({ password: 'valid-password-1' })
  })

  it('does not run the expensive password hash for an invalid token (cheap DoS vector)', async () => {
    vi.mocked(queryOne).mockResolvedValue(null)
    await expect((handler as any)({})).rejects.toMatchObject({ statusCode: 404 })
    expect(hashPassword).not.toHaveBeenCalled()
  })

  it('hashes once and creates the user for a valid token', async () => {
    vi.mocked(queryOne)
      .mockResolvedValueOnce({ '?column?': 1 } as any)
      .mockResolvedValueOnce({ id: 'u1', email: 'a@b.co', role: 'author' } as any)
    const res = await (handler as any)({})
    expect(hashPassword).toHaveBeenCalledTimes(1)
    expect(res).toEqual({ user: { id: 'u1', email: 'a@b.co', role: 'author' } })
  })
})
