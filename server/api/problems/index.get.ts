import { defineEventHandler, getQuery, createError } from 'h3'
import { query } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const qs = getQuery(event)
    const page = Math.max(1, parseInt(String(qs.page ?? '1'), 10))
    const limit = 20
    const offset = (page - 1) * limit
    const search = String(qs.search ?? '').trim()
    const sort = String(qs.sort ?? 'top')

    const whereClause = search
      ? `WHERE p.title ILIKE $3 OR p.description ILIKE $3`
      : ''

    const orderBy = sort === 'recent'
      ? 'p.created_at DESC'
      : 'net_votes DESC, p.created_at DESC'

    const searchParam = search ? `%${search}%` : null

    const rows = await query(`
      SELECT
        p.id,
        p.title,
        p.description,
        p.email,
        p.created_at,
        p.updated_at,
        COALESCE(SUM(v.vote_value), 0)::int AS net_votes
      FROM problems p
      LEFT JOIN problem_votes v ON v.problem_id = p.id
      ${whereClause}
      GROUP BY p.id
      ORDER BY ${orderBy}
      LIMIT $1 OFFSET $2
    `, searchParam ? [limit, offset, searchParam] : [limit, offset])

    return { problems: rows, page, limit }
  } catch (err) {
    console.error('GET /api/problems error:', err)
    throw createError({
      statusCode: 500,
      message: `Database error: ${err instanceof Error ? err.message : String(err)}`
    })
  }
})
