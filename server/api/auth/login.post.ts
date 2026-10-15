import { defineEventHandler, readBody, createError, getRequestIP } from 'h3'
import { queryOne } from '../../utils/db'
import { hashPassword, verifyPassword, MAX_PASSWORD_LENGTH } from '../../utils/password'
import { createRateLimiter } from '../../utils/rateLimit'
import { createSession } from '../../utils/session'

const WINDOW_MS = 15 * 60 * 1000
// Limits are configurable via .env (LOGIN_EMAIL_MAX_FAILURES / LOGIN_IP_MAX_FAILURES).
const emailLimiter = createRateLimiter({ max: Number(process.env.LOGIN_EMAIL_MAX_FAILURES) || 5, windowMs: WINDOW_MS })
const ipLimiter = createRateLimiter({ max: Number(process.env.LOGIN_IP_MAX_FAILURES) || 30, windowMs: WINDOW_MS })

// Verified against when the email is unknown, so timing does not reveal account existence.
const dummyHash = hashPassword('timing-equalizer-password')

interface UserRow { id: string; email: string; role: 'admin' | 'author'; password_hash: string; is_active: boolean }

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = String(body?.email ?? '').trim().toLowerCase()
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!email || !password) throw createError({ statusCode: 400, message: 'Email and password are required' })
  if (password.length > MAX_PASSWORD_LENGTH) throw createError({ statusCode: 400, message: 'Password is too long' })

  const ip = getRequestIP(event) ?? 'unknown'
  if (emailLimiter.isLimited(`email:${email}`) || ipLimiter.isLimited(`ip:${ip}`)) {
    throw createError({ statusCode: 429, message: 'Too many attempts, try again later' })
  }

  const user = await queryOne<UserRow>(
    `SELECT id, email, role, password_hash, is_active FROM users WHERE email = $1`,
    [email]
  )
  const ok = user && user.is_active
    ? await verifyPassword(password, user.password_hash)
    : (await verifyPassword(password, await dummyHash), false)

  if (!user || !ok) {
    emailLimiter.recordFailure(`email:${email}`)
    ipLimiter.recordFailure(`ip:${ip}`)
    throw createError({ statusCode: 401, message: 'Invalid email or password' })
  }

  emailLimiter.reset(`email:${email}`)
  await createSession(event, user.id)
  return { user: { id: user.id, email: user.email, role: user.role } }
})
