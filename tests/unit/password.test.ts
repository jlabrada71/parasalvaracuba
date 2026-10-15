import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '../../server/utils/password'

describe('password', () => {
  it('verifies the correct password', async () => {
    const hash = await hashPassword('correct horse battery')
    expect(await verifyPassword('correct horse battery', hash)).toBe(true)
  })

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('correct horse battery')
    expect(await verifyPassword('wrong horse battery', hash)).toBe(false)
  })

  it('uses a different salt each time', async () => {
    expect(await hashPassword('same-password-1')).not.toBe(await hashPassword('same-password-1'))
  })

  it('returns false for a malformed stored hash instead of throwing', async () => {
    expect(await verifyPassword('x', 'not-a-hash')).toBe(false)
    expect(await verifyPassword('x', '')).toBe(false)
  })
})
