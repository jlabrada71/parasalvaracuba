import { describe, it, expect } from 'vitest'
import { generateToken, hashToken } from '../../server/utils/tokens'

describe('tokens', () => {
  it('generates url-safe tokens of 43 chars (32 bytes) that are unique', () => {
    const a = generateToken()
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(generateToken()).not.toBe(a)
  })

  it('hashes deterministically to 64 hex chars and never returns the token', () => {
    const t = generateToken()
    expect(hashToken(t)).toBe(hashToken(t))
    expect(hashToken(t)).toMatch(/^[0-9a-f]{64}$/)
    expect(hashToken(t)).not.toContain(t)
  })
})
