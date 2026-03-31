import { defineEventHandler, getQuery, createError } from 'h3'
import { query } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const qs = getQuery(event)
    const page = Math.max(1, parseInt(String(qs.page ?? '1'), 10))
    const limit = 20
    const offset = (page - 1) * limit
    const search = String(qs.search ?? '').trim()
    const sort = String(qs.sort ?? 'top') // 'top' (default) or 'recent'

    // Build WHERE clause for search
    const whereClause = search
      ? `WHERE i.title ILIKE $3 OR i.description ILIKE $3`
      : ''

    // Build ORDER BY based on sort param
    const orderBy = sort === 'recent'
      ? 'i.created_at DESC'
      : 'net_votes DESC, i.created_at DESC'

    const searchParam = search ? `%${search}%` : null

    const rows = await query(`
      SELECT
        i.id,
        i.title,
        i.description,
        i.email,
        i.created_at,
        i.updated_at,
        COALESCE(SUM(v.vote_value), 0)::int AS net_votes
      FROM ideas i
      LEFT JOIN votes v ON v.idea_id = i.id
      ${whereClause}
      GROUP BY i.id
      ORDER BY ${orderBy}
      LIMIT $1 OFFSET $2
    `, searchParam ? [limit, offset, searchParam] : [limit, offset])

    return { ideas: rows, page, limit }
  } catch (err) {
    console.error('GET /api/ideas error:', err)
    throw createError({
      statusCode: 500,
      message: `Database error: ${err instanceof Error ? err.message : String(err)}`
    })
  }
})
