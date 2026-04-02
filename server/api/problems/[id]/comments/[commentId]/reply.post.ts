import { defineEventHandler, readBody, createError, getRouterParam, setResponseStatus } from 'h3'
import { query } from '../../../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const problemId = getRouterParam(event, 'id')
    const parentCommentId = getRouterParam(event, 'commentId')
    const userEmail = event.context.userEmail

    if (!problemId) {
      throw createError({ statusCode: 400, message: 'Problem ID is required' })
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

    const [parentExists] = await query(
      'SELECT id FROM problem_comments WHERE id = $1 AND problem_id = $2',
      [parentCommentId, problemId]
    )
    if (!parentExists) {
      throw createError({ statusCode: 404, message: 'Parent comment not found' })
    }

    const [depthResult] = await query(`
      WITH RECURSIVE depth_cte AS (
        SELECT parent_comment_id, 1 AS depth FROM problem_comments WHERE id = $1
        UNION ALL
        SELECT c.parent_comment_id, depth + 1
        FROM depth_cte
        JOIN problem_comments c ON c.id = depth_cte.parent_comment_id
        WHERE depth < 10
      )
      SELECT MAX(depth) AS max_depth FROM depth_cte
    `, [parentCommentId])

    if ((depthResult?.max_depth ?? 0) >= 10) {
      throw createError({ statusCode: 400, message: 'Reply nesting depth exceeds maximum (10 levels)' })
    }

    const [reply] = await query(`
      INSERT INTO problem_comments (problem_id, parent_comment_id, email, content)
      VALUES ($1, $2, $3, $4)
      RETURNING id, problem_id, parent_comment_id, email, content, created_at, updated_at
    `, [problemId, parentCommentId, userEmail, replyBody])

    setResponseStatus(event, 201)
    return reply
  } catch (err) {
    console.error('POST /api/problems/:id/comments/:commentId/reply error:', err)
    if (err instanceof Error && 'statusCode' in err) throw err
    throw createError({
      statusCode: 500,
      message: `Database error: ${err instanceof Error ? err.message : String(err)}`
    })
  }
})
