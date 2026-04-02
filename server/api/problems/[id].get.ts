import { defineEventHandler, createError, getRouterParam } from 'h3'
import { query } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const problemId = getRouterParam(event, 'id')
    if (!problemId) {
      throw createError({ statusCode: 400, message: 'Problem ID is required' })
    }

    const [problem] = await query(`
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
      WHERE p.id = $1
      GROUP BY p.id
    `, [problemId])

    if (!problem) {
      throw createError({ statusCode: 404, message: 'Problem not found' })
    }

    return problem
  } catch (err) {
    console.error('GET /api/problems/:id error:', err)
    if (err instanceof Error && 'statusCode' in err) {
      throw err
    }
    throw createError({
      statusCode: 500,
      message: `Database error: ${err instanceof Error ? err.message : String(err)}`
    })
  }
})
