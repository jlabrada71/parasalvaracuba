import { defineEventHandler, createError, getRouterParam } from 'h3'
import { query } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const ideaId = getRouterParam(event, 'id')
    if (!ideaId) {
      throw createError({ statusCode: 400, message: 'Idea ID is required' })
    }

    const [idea] = await query(`
      SELECT
        i.id,
        i.title,
        i.description,
        i.email,
        i.created_at,
        i.updated_at,
        i.problem_id,
        p.title AS problem_title,
        COALESCE(SUM(v.vote_value), 0)::int AS net_votes
      FROM ideas i
      LEFT JOIN votes v ON v.idea_id = i.id
      LEFT JOIN problems p ON p.id = i.problem_id
      WHERE i.id = $1
      GROUP BY i.id, p.title
    `, [ideaId])

    if (!idea) {
      throw createError({ statusCode: 404, message: 'Idea not found' })
    }

    return idea
  } catch (err) {
    console.error('GET /api/ideas/:id error:', err)
    if (err instanceof Error && 'statusCode' in err) {
      throw err
    }
    throw createError({
      statusCode: 500,
      message: `Database error: ${err instanceof Error ? err.message : String(err)}`
    })
  }
})
