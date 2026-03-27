import { defineEventHandler, readBody, createError, getQuery, setResponseStatus } from 'h3'
import { query } from '../../utils/db'

export default defineEventHandler(async (event) => {
  // GET /api/ideas?page=1
  if (event.method === 'GET') {
    try {
      const qs = getQuery(event)
      const page = Math.max(1, parseInt(String(qs.page ?? '1'), 10))
      const limit = 20
      const offset = (page - 1) * limit

      const rows = await query(`
        SELECT
          i.id,
          i.title,
          i.description,
          i.email,
          i.created_at,
          i.updated_at,
          COALESCE(SUM(v.vote_value), 0)::int AS net_votes
        FROM ideas i
        LEFT JOIN votes v ON v.idea_id = i.id
        GROUP BY i.id
        ORDER BY net_votes DESC, i.created_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset])

      return { ideas: rows, page, limit }
    } catch (err) {
      console.error('GET /api/ideas error:', err)
      throw createError({
        statusCode: 500,
        message: `Database error: ${err instanceof Error ? err.message : String(err)}`
      })
    }
  }

  // POST /api/ideas
  if (event.method === 'POST') {
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
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' })
})
