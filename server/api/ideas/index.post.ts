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

    if (!title) throw createError({ statusCode: 400, message: 'title is required' })
    if (!description) throw createError({ statusCode: 400, message: 'description is required' })
    if (title.length > 200) throw createError({ statusCode: 400, message: 'title must be 200 characters or fewer' })

    const [idea] = await query(`
      INSERT INTO ideas (title, description, email)
      VALUES ($1, $2, $3)
      RETURNING id, title, description, email, created_at, updated_at
    `, [title, description, userEmail])

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
