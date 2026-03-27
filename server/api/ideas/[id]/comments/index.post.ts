import { defineEventHandler, readBody, createError, getRouterParam, setResponseStatus } from 'h3'
import { query } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const ideaId = getRouterParam(event, 'id')
    const userEmail = event.context.userEmail

    if (!ideaId) {
      throw createError({ statusCode: 400, message: 'Idea ID is required' })
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

    // Verify idea exists
    const [ideaExists] = await query('SELECT id FROM ideas WHERE id = $1', [ideaId])
    if (!ideaExists) {
      throw createError({ statusCode: 404, message: 'Idea not found' })
    }

    // Create top-level comment (parent_comment_id = NULL)
    const [comment] = await query(`
      INSERT INTO comments (idea_id, email, content)
      VALUES ($1, $2, $3)
      RETURNING id, idea_id, parent_comment_id, email, content, created_at, updated_at
    `, [ideaId, userEmail, commentBody])

    setResponseStatus(event, 201)
    return comment
  } catch (err) {
    console.error('POST /api/ideas/:id/comments error:', err)
    if (err instanceof Error && 'statusCode' in err) {
      throw err
    }
    throw createError({
      statusCode: 500,
      message: `Database error: ${err instanceof Error ? err.message : String(err)}`
    })
  }
})
