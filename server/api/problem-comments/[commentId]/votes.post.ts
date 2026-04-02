import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'
import { query } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const commentId = getRouterParam(event, 'commentId')
    const userEmail = event.context.userEmail

    if (!commentId) {
      throw createError({ statusCode: 400, message: 'Comment ID is required' })
    }
    if (!userEmail) {
      throw createError({ statusCode: 401, message: 'Email required' })
    }

    const body = await readBody(event)
    const voteValue = body?.vote_value ?? 0

    if (![1, 0, -1].includes(voteValue)) {
      throw createError({ statusCode: 400, message: 'vote_value must be -1, 0, or 1' })
    }

    const [comment] = await query('SELECT id FROM problem_comments WHERE id = $1', [commentId])
    if (!comment) {
      throw createError({ statusCode: 404, message: 'Comment not found' })
    }

    const [existingVote] = await query(
      'SELECT id FROM problem_comment_votes WHERE comment_id = $1 AND email = $2',
      [commentId, userEmail]
    )

    if (existingVote) {
      await query(
        'UPDATE problem_comment_votes SET vote_value = $1, updated_at = NOW() WHERE id = $2',
        [voteValue, existingVote.id]
      )
    } else {
      await query(
        'INSERT INTO problem_comment_votes (comment_id, email, vote_value) VALUES ($1, $2, $3)',
        [commentId, userEmail, voteValue]
      )
    }

    const [result] = await query(
      'SELECT COALESCE(SUM(vote_value), 0)::int AS net_votes FROM problem_comment_votes WHERE comment_id = $1 AND vote_value != 0',
      [commentId]
    )

    if (!result) {
      throw createError({ statusCode: 500, message: 'Failed to cast vote' })
    }

    return result
  } catch (err) {
    console.error('POST /api/problem-comments/:commentId/votes error:', err)
    if (err instanceof Error && 'statusCode' in err) throw err
    throw createError({
      statusCode: 500,
      message: `Database error: ${err instanceof Error ? err.message : String(err)}`
    })
  }
})
