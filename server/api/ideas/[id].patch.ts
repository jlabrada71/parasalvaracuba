import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'
import { query } from '../../utils/db'

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
    const title = (body?.title ?? '').trim()
    const description = (body?.description ?? '').trim()
    const problemId = body?.problem_id || null

    if (!title) throw createError({ statusCode: 400, message: 'title is required' })
    if (!description) throw createError({ statusCode: 400, message: 'description is required' })
    if (title.length > 200) throw createError({ statusCode: 400, message: 'title must be 200 characters or fewer' })

    const [idea] = await query(`
      UPDATE ideas
      SET title = $1, description = $2, problem_id = $3, updated_at = NOW()
      WHERE id = $4 AND email = $5
      RETURNING id, title, description, email, problem_id, created_at, updated_at
    `, [title, description, problemId, ideaId, userEmail])

    if (!idea) {
      throw createError({ statusCode: 403, message: 'Only the author can edit this idea' })
    }

    return idea
  } catch (err) {
    console.error('PATCH /api/ideas/:id error:', err)
    if (err instanceof Error && 'statusCode' in err) {
      throw err
    }
    throw createError({
      statusCode: 500,
      message: `Database error: ${err instanceof Error ? err.message : String(err)}`
    })
  }
})
