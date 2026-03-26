import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'
import { query, queryOne } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'id is required' })

  // GET /api/ideas/:id
  if (event.method === 'GET') {
    const idea = await queryOne(`
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
      WHERE i.id = $1
      GROUP BY i.id
    `, [id])

    if (!idea) throw createError({ statusCode: 404, message: 'Idea not found' })
    return idea
  }

  // PATCH /api/ideas/:id
  if (event.method === 'PATCH') {
    const userEmail = event.context.userEmail
    if (!userEmail) throw createError({ statusCode: 401, message: 'Email required' })

    const existing = await queryOne('SELECT id, email FROM ideas WHERE id = $1', [id])
    if (!existing) throw createError({ statusCode: 404, message: 'Idea not found' })
    if (existing.email !== userEmail) throw createError({ statusCode: 403, message: 'Forbidden' })

    const body = await readBody(event)
    const title = (body?.title ?? '').trim()
    const description = (body?.description ?? '').trim()

    if (!title) throw createError({ statusCode: 400, message: 'title is required' })
    if (!description) throw createError({ statusCode: 400, message: 'description is required' })
    if (title.length > 200) throw createError({ statusCode: 400, message: 'title must be 200 characters or fewer' })

    const [updated] = await query(`
      UPDATE ideas
      SET title = $1, description = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING id, title, description, email, created_at, updated_at
    `, [title, description, id])

    return updated
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' })
})
