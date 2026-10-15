import { defineEventHandler } from 'h3'
import { query } from '../../utils/db'
import { requireAdmin } from '../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  return query(`SELECT id, email, role, is_active, created_at FROM users ORDER BY created_at ASC`)
})
