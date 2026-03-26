const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_LENGTH = 5
const MAX_LENGTH = 254

export interface ValidationResult {
  valid: boolean
  reason?: string
}

export function validateEmail(raw: unknown): ValidationResult {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return { valid: false, reason: 'Email is required.' }
  }

  const email = raw.trim().toLowerCase()

  if (email.length < MIN_LENGTH) {
    return { valid: false, reason: `Email must be at least ${MIN_LENGTH} characters.` }
  }

  if (email.length > MAX_LENGTH) {
    return { valid: false, reason: `Email must be ${MAX_LENGTH} characters or fewer.` }
  }

  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, reason: 'Email format is invalid.' }
  }

  return { valid: true }
}
