import { defineEventHandler, getRouterParam, createError } from 'h3'
import { query } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const problemId = getRouterParam(event, 'id')
    if (!problemId) {
      throw createError({ statusCode: 400, message: 'Problem ID is required' })
    }

    const comments = await query(`
      SELECT
        c.id,
        c.problem_id,
        c.parent_comment_id,
        c.email,
        c.content,
        c.created_at,
        c.updated_at,
        COALESCE(SUM(CASE WHEN v.vote_value = 1 THEN 1 ELSE 0 END), 0)::int AS upvotes,
        COALESCE(SUM(CASE WHEN v.vote_value = -1 THEN 1 ELSE 0 END), 0)::int AS downvotes,
        COALESCE(SUM(v.vote_value), 0)::int AS net_votes
      FROM problem_comments c
      LEFT JOIN problem_comment_votes v ON c.id = v.comment_id AND v.vote_value != 0
      WHERE c.problem_id = $1
      GROUP BY c.id
      ORDER BY c.created_at ASC
    `, [problemId])

    return comments
  } catch (err) {
    console.error('GET /api/problems/:id/comments error:', err)
    if (err instanceof Error && 'statusCode' in err) throw err
    throw createError({
      statusCode: 500,
      message: `Database error: ${err instanceof Error ? err.message : String(err)}`
    })
  }
})
