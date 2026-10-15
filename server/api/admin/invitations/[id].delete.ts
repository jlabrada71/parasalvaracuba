import { defineEventHandler, getRouterParam, createError } from 'h3'
import { queryOne } from '../../../utils/db'
import { requireAdmin } from '../../../utils/requireAdmin'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id') ?? ''
  if (!UUID.test(id)) throw createError({ statusCode: 404, message: 'Invitation not found' })

  const row = await queryOne(
    `UPDATE invitations SET revoked_at = NOW()
      WHERE id = $1 AND accepted_at IS NULL AND revoked_at IS NULL RETURNING id`,
    [id]
  )
  if (!row) throw createError({ statusCode: 404, message: 'Invitation not found' })
  return { ok: true }
})
