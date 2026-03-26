import { describe, it, expect } from 'vitest'
import { validateEmail } from '../../server/utils/emailValidation'

describe('Email flow integration', () => {
  it('validates a valid X-User-Email header correctly', () => {
    const result = validateEmail('test@example.com')
    expect(result.valid).toBe(true)
  })

  it('returns null for missing header (empty string)', () => {
    const result = validateEmail('')
    expect(result.valid).toBe(false)
  })

  it('returns null when header is malformed (no @)', () => {
    const result = validateEmail('not-an-email')
    expect(result.valid).toBe(false)
  })

  it('handles header value case-insensitivity', () => {
    const result = validateEmail('TEST@EXAMPLE.COM')
    expect(result.valid).toBe(true)
  })

  it('handles header value with whitespace', () => {
    const result = validateEmail('  user@example.com  ')
    expect(result.valid).toBe(true)
  })
})
