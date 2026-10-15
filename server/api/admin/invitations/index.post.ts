import { defineEventHandler, readBody, createError, setResponseStatus, getRequestURL } from 'h3'
import { query, queryOne } from '../../../utils/db'
import { requireAdmin } from '../../../utils/requireAdmin'
import { generateToken, hashToken } from '../../../utils/tokens'
import { validateEmail } from '../../../utils/emailValidation'

const ROLES = ['author', 'admin']
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000

export default defineEventHandler(async (event) => {
  const admin = requireAdmin(event)
  const body = await readBody(event)

  const check = validateEmail(body?.email)
  if (!check.valid) throw createError({ statusCode: 400, message: check.reason ?? 'Invalid email' })
  const email = String(body.email).trim().toLowerCase()

  const role = body?.role ?? 'author'
  if (!ROLES.includes(role)) throw createError({ statusCode: 400, message: 'Invalid role' })

  if (await queryOne(`SELECT 1 FROM users WHERE email = $1`, [email])) {
    throw createError({ statusCode: 409, message: 'A user with this email already exists' })
  }

  // A new invitation supersedes any pending one for the same email.
  await query(
    `UPDATE invitations SET revoked_at = NOW() WHERE email = $1 AND accepted_at IS NULL AND revoked_at IS NULL`,
    [email]
  )

  const token = generateToken()
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS)
  const [row] = await query<{ id: string }>(
    `INSERT INTO invitations (token_hash, email, role, invited_by, expires_at)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [hashToken(token), email, role, admin.id, expiresAt]
  )

  setResponseStatus(event, 201)
  return {
    id: row.id,
    email,
    role,
    link: `${getRequestURL(event).origin}/invite/${token}`,
    expiresAt: expiresAt.toISOString(),
  }
})
