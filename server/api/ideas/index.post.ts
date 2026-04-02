import { defineEventHandler, readBody, createError, setResponseStatus } from 'h3'
import { query } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const userEmail = event.context.userEmail
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
      INSERT INTO ideas (title, description, email, problem_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, title, description, email, problem_id, created_at, updated_at
    `, [title, description, userEmail, problemId])

    setResponseStatus(event, 201)
    return idea
  } catch (err) {
    console.error('POST /api/ideas error:', err)
    if (err instanceof Error && 'statusCode' in err) {
      throw err
    }
    throw createError({
      statusCode: 500,
      message: `Database error: ${err instanceof Error ? err.message : String(err)}`
    })
  }
})
