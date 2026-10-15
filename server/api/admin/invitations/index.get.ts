import { defineEventHandler } from 'h3'
import { query } from '../../../utils/db'
import { requireAdmin } from '../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  return query(
    `SELECT id, email, role, created_at, expires_at
       FROM invitations
      WHERE accepted_at IS NULL AND revoked_at IS NULL AND expires_at > NOW()
      ORDER BY created_at DESC`
  )
})
