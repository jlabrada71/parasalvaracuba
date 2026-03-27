import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'
import { query } from '../../../utils/db'

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
    const voteValue = body?.vote_value ?? 0

    if (![1, 0, -1].includes(voteValue)) {
      throw createError({ statusCode: 400, message: 'vote_value must be -1, 0, or 1' })
    }

    const [result] = await query(`
      INSERT INTO votes (idea_id, email, vote_value, comment_id)
      VALUES ($1, $2, $3, NULL)
      ON CONFLICT (idea_id, email) WHERE comment_id IS NULL DO UPDATE
        SET vote_value = EXCLUDED.vote_value, updated_at = NOW()
      RETURNING (SELECT COALESCE(SUM(vote_value), 0)::int FROM votes WHERE idea_id = $1 AND comment_id IS NULL) AS net_votes
    `, [ideaId, userEmail, voteValue])

    if (!result) {
      throw createError({ statusCode: 500, message: 'Failed to cast vote' })
    }

    return result
  } catch (err) {
    console.error('POST /api/ideas/:id/votes error:', err)
    if (err instanceof Error && 'statusCode' in err) {
      throw err
    }
    throw createError({
      statusCode: 500,
      message: `Database error: ${err instanceof Error ? err.message : String(err)}`
    })
  }
})
