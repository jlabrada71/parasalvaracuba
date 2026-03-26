import { describe, it, expect } from 'vitest'
import { validateEmail } from '../../server/utils/emailValidation'

describe('validateEmail', () => {
  it('accepts a valid email', () => {
    expect(validateEmail('user@example.com').valid).toBe(true)
  })

  it('rejects empty string', () => {
    expect(validateEmail('').valid).toBe(false)
  })

  it('rejects null', () => {
    expect(validateEmail(null).valid).toBe(false)
  })

  it('rejects missing @ symbol', () => {
    expect(validateEmail('notanemail').valid).toBe(false)
  })

  it('rejects email over 254 characters', () => {
    const long = 'a'.repeat(245) + '@example.com'
    expect(validateEmail(long).valid).toBe(false)
  })

  it('trims and lowercases in the valid path', () => {
    expect(validateEmail('  USER@EXAMPLE.COM  ').valid).toBe(true)
  })
})
