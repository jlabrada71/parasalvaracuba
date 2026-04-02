import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'
import { query } from '../../../utils/db'

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
    const voteValue = body?.vote_value ?? 0

    if (![1, 0, -1].includes(voteValue)) {
      throw createError({ statusCode: 400, message: 'vote_value must be -1, 0, or 1' })
    }

    const [existingVote] = await query(
      'SELECT id FROM problem_votes WHERE problem_id = $1 AND email = $2',
      [problemId, userEmail]
    )

    if (existingVote) {
      await query(
        'UPDATE problem_votes SET vote_value = $1, updated_at = NOW() WHERE id = $2',
        [voteValue, existingVote.id]
      )
    } else {
      await query(
        'INSERT INTO problem_votes (problem_id, email, vote_value) VALUES ($1, $2, $3)',
        [problemId, userEmail, voteValue]
      )
    }

    const [result] = await query(
      'SELECT COALESCE(SUM(vote_value), 0)::int as net_votes FROM problem_votes WHERE problem_id = $1 AND vote_value != 0',
      [problemId]
    )

    if (!result) {
      throw createError({ statusCode: 500, message: 'Failed to cast vote' })
    }

    return result
  } catch (err) {
    console.error('POST /api/problems/:id/votes error:', err)
    if (err instanceof Error && 'statusCode' in err) {
      throw err
    }
    throw createError({
      statusCode: 500,
      message: `Database error: ${err instanceof Error ? err.message : String(err)}`
    })
  }
})
