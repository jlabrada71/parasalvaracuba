import { defineEventHandler, readBody, createError, getRouterParam, setResponseStatus } from 'h3'
import { query } from '../../../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const ideaId = getRouterParam(event, 'id')
    const parentCommentId = getRouterParam(event, 'commentId')
    const userEmail = event.context.userEmail

    if (!ideaId) {
      throw createError({ statusCode: 400, message: 'Idea ID is required' })
    }
    if (!parentCommentId) {
      throw createError({ statusCode: 400, message: 'Parent comment ID is required' })
    }
    if (!userEmail) {
      throw createError({ statusCode: 401, message: 'Email required' })
    }

    const body = await readBody(event)
    const replyBody = (body?.body ?? '').trim()

    if (!replyBody) {
      throw createError({ statusCode: 400, message: 'Reply body is required' })
    }
    if (replyBody.length > 2000) {
      throw createError({ statusCode: 400, message: 'Reply must be 2000 characters or fewer' })
    }

    // Verify parent comment exists and belongs to the idea
    const [parentExists] = await query(
      'SELECT id FROM comments WHERE id = $1 AND idea_id = $2',
      [parentCommentId, ideaId]
    )
    if (!parentExists) {
      throw createError({ statusCode: 404, message: 'Parent comment not found' })
    }

    // Check nesting depth to prevent infinite threads (max 10 levels)
    const [depthResult] = await query(`
      WITH RECURSIVE depth_cte AS (
        SELECT parent_comment_id, 1 as depth FROM comments WHERE id = $1
        UNION ALL
        SELECT c.parent_comment_id, depth + 1
        FROM depth_cte
        JOIN comments c ON c.id = depth_cte.parent_comment_id
        WHERE depth < 10
      )
      SELECT MAX(depth) as max_depth FROM depth_cte
    `, [parentCommentId])

    const currentDepth = depthResult?.max_depth ?? 0
    if (currentDepth >= 10) {
      throw createError({
        statusCode: 400,
        message: 'Reply nesting depth exceeds maximum (10 levels)'
      })
    }

    // Create reply comment with parent_comment_id set
    const [reply] = await query(`
      INSERT INTO comments (idea_id, parent_comment_id, email, content)
      VALUES ($1, $2, $3, $4)
      RETURNING id, idea_id, parent_comment_id, email, content, created_at, updated_at
    `, [ideaId, parentCommentId, userEmail, replyBody])

    setResponseStatus(event, 201)
    return reply
  } catch (err) {
    console.error('POST /api/ideas/:id/comments/:commentId/reply error:', err)
    if (err instanceof Error && 'statusCode' in err) {
      throw err
    }
    throw createError({
      statusCode: 500,
      message: `Database error: ${err instanceof Error ? err.message : String(err)}`
    })
  }
})
