import { defineEventHandler, getRouterParam, createError } from 'h3'
import { queryOne } from '../../../utils/db'
import { hashToken } from '../../../utils/tokens'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token') ?? ''
  const row = await queryOne<{ email: string; role: string }>(
    `SELECT email, role FROM invitations
      WHERE token_hash = $1 AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at > NOW()`,
    [hashToken(token)]
  )
  if (!row) throw createError({ statusCode: 404, message: 'Invitation not found or expired' })
  return row
})
