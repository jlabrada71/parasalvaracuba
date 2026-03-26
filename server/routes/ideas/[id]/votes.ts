import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'
import { query, queryOne } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  if (event.method !== 'POST') {
    throw createError({ statusCode: 405, message: 'Method not allowed' })
  }

  const userEmail = event.context.userEmail
  if (!userEmail) throw createError({ statusCode: 401, message: 'Email required' })

  const ideaId = getRouterParam(event, 'id')
  if (!ideaId) throw createError({ statusCode: 400, message: 'idea id is required' })

  // Verify idea exists
  const idea = await queryOne('SELECT id FROM ideas WHERE id = $1', [ideaId])
  if (!idea) throw createError({ statusCode: 404, message: 'Idea not found' })

  const body = await readBody(event)
  const voteValue = body?.vote_value

  if (voteValue === undefined || voteValue === null) {
    throw createError({ statusCode: 400, message: 'vote_value is required' })
  }
  if (![1, 0, -1].includes(Number(voteValue))) {
    throw createError({ statusCode: 400, message: 'vote_value must be -1, 0, or 1' })
  }

  // Upsert: insert or update on duplicate (idea_id, email)
  await query(`
    INSERT INTO votes (idea_id, email, vote_value)
    VALUES ($1, $2, $3)
    ON CONFLICT (idea_id, email)
    DO UPDATE SET vote_value = EXCLUDED.vote_value, updated_at = NOW()
  `, [ideaId, userEmail, Number(voteValue)])

  // Return updated net vote count for this idea
  const result = await queryOne<{ net_votes: number }>(`
    SELECT COALESCE(SUM(vote_value), 0)::int AS net_votes
    FROM votes
    WHERE idea_id = $1
  `, [ideaId])

  return { idea_id: ideaId, net_votes: result?.net_votes ?? 0 }
})
