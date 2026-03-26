import { defineEventHandler, getHeader } from 'h3'
import { validateEmail } from '../utils/emailValidation'

export default defineEventHandler((event) => {
  const raw = getHeader(event, 'x-user-email')
  const headerValue = Array.isArray(raw) ? raw[0] : raw

  const result = validateEmail(headerValue)
  event.context.userEmail = result.valid ? (headerValue as string).trim().toLowerCase() : null
})
