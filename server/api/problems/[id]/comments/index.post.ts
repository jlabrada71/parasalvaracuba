import { defineEventHandler, readBody, createError, getRouterParam, setResponseStatus } from 'h3'
import { query } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const problemId = getRouterParam(event, 'id')
    const userEmail = event.context.userEmail

    if (!problemId) {
      throw createError({ statusCode: 400, message: 'Problem ID is required' })
    }
    if (!userEmail) {
      throw createError({ statusCode: 401, message: 'Email required' })
    }

    const body = await readBody(event)
    const commentBody = (body?.body ?? '').trim()

    if (!commentBody) {
      throw createError({ statusCode: 400, message: 'Comment body is required' })
    }
    if (commentBody.length > 2000) {
      throw createError({ statusCode: 400, message: 'Comment must be 2000 characters or fewer' })
    }

    const [problemExists] = await query('SELECT id FROM problems WHERE id = $1', [problemId])
    if (!problemExists) {
      throw createError({ statusCode: 404, message: 'Problem not found' })
    }

    const [comment] = await query(`
      INSERT INTO problem_comments (problem_id, email, content)
      VALUES ($1, $2, $3)
      RETURNING id, problem_id, parent_comment_id, email, content, created_at, updated_at
    `, [problemId, userEmail, commentBody])

    setResponseStatus(event, 201)
    return comment
  } catch (err) {
    console.error('POST /api/problems/:id/comments error:', err)
    if (err instanceof Error && 'statusCode' in err) throw err
    throw createError({
      statusCode: 500,
      message: `Database error: ${err instanceof Error ? err.message : String(err)}`
    })
  }
})
