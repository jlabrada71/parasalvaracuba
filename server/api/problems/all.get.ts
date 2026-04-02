import { query } from '../../utils/db'

export default defineEventHandler(async () => {
  const rows = await query<{ id: string; title: string }>(
    `SELECT id, title FROM problems ORDER BY title ASC`
  )
  return rows
})
