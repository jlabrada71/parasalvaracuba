import { defineEventHandler, getRouterParam, createError } from 'h3'
import { query } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const ideaId = getRouterParam(event, 'id')

    if (!ideaId) {
      throw createError({ statusCode: 400, message: 'Idea ID is required' })
    }

    // Fetch all comments for the idea (flat list)
    // Include upvote/downvote counts for each comment
    const comments = await query(`
      SELECT
        c.id,
        c.idea_id,
        c.parent_comment_id,
        c.email,
        c.body,
        c.created_at,
        c.updated_at,
        COALESCE(SUM(CASE WHEN v.vote_value = 1 THEN 1 ELSE 0 END), 0)::int as upvotes,
        COALESCE(SUM(CASE WHEN v.vote_value = -1 THEN 1 ELSE 0 END), 0)::int as downvotes,
        COALESCE(SUM(v.vote_value), 0)::int as net_votes
      FROM comments c
      LEFT JOIN votes v ON c.id = v.comment_id AND v.vote_value != 0
      WHERE c.idea_id = $1
      GROUP BY c.id
      ORDER BY c.created_at ASC
    `, [ideaId])

    return comments
  } catch (err) {
    console.error('GET /api/ideas/:id/comments error:', err)
    if (err instanceof Error && 'statusCode' in err) {
      throw err
    }
    throw createError({
      statusCode: 500,
      message: `Database error: ${err instanceof Error ? err.message : String(err)}`
    })
  }
})
