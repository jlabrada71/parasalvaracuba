import { defineEventHandler, getRouterParam, readBody, createError, setResponseStatus } from 'h3'
import { queryOne } from '../../../utils/db'
import { hashToken } from '../../../utils/tokens'
import { hashPassword, MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from '../../../utils/password'
import { createSession } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token') ?? ''
  const body = await readBody(event)
  const password = typeof body?.password === 'string' ? body.password : ''
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    throw createError({ statusCode: 400, message: `Password must be ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} characters` })
  }

  // Cheap check first: an unauthenticated caller must not be able to trigger scrypt with a bogus token.
  const valid = await queryOne(
    `SELECT 1 FROM invitations
      WHERE token_hash = $1 AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at > NOW()`,
    [hashToken(token)]
  )
  if (!valid) throw createError({ statusCode: 404, message: 'Invitation not found or expired' })

  const hash = await hashPassword(password)

  // One statement = atomic: the invitation is consumed only if the user row is created.
  let user: { id: string; email: string; role: 'admin' | 'author' } | null
  try {
    user = await queryOne(
      `WITH inv AS (
         UPDATE invitations SET accepted_at = NOW()
          WHERE token_hash = $1 AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at > NOW()
          RETURNING email, role
       )
       INSERT INTO users (email, password_hash, role)
       SELECT email, $2, role FROM inv
       RETURNING id, email, role`,
      [hashToken(token), hash]
    )
  } catch (err: any) {
    if (err?.code === '23505') throw createError({ statusCode: 409, message: 'An account with this email already exists' })
    throw err
  }
  if (!user) throw createError({ statusCode: 404, message: 'Invitation not found or expired' })

  await createSession(event, user.id)
  setResponseStatus(event, 201)
  return { user }
})
