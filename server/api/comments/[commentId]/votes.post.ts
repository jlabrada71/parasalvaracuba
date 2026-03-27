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

    // Verify comment exists and get its idea_id
    const [comment] = await query('SELECT id, idea_id FROM comments WHERE id = $1', [commentId])
    if (!comment) {
      throw createError({ statusCode: 404, message: 'Comment not found' })
    }

    // Upsert vote: check if exists, then update or insert
    // Comment votes don't have a database constraint (NULL handling issue), so we handle it at app level
    const [existingVote] = await query(
      'SELECT id FROM votes WHERE idea_id = $1 AND comment_id = $2 AND email = $3',
      [comment.idea_id, commentId, userEmail]
    )

    if (existingVote) {
      // Update existing vote
      await query(
        'UPDATE votes SET vote_value = $1, updated_at = NOW() WHERE id = $2',
        [voteValue, existingVote.id]
      )
    } else {
      // Insert new vote
      await query(
        'INSERT INTO votes (idea_id, comment_id, email, vote_value) VALUES ($1, $2, $3, $4)',
        [comment.idea_id, commentId, userEmail, voteValue]
      )
    }

    // Get the updated vote count
    const [result] = await query(
      'SELECT COALESCE(SUM(vote_value), 0)::int as net_votes FROM votes WHERE comment_id = $1 AND vote_value != 0',
      [commentId]
    )

    if (!result) {
      throw createError({ statusCode: 500, message: 'Failed to cast vote' })
    }

    return result
  } catch (err) {
    console.error('POST /api/comments/:commentId/votes error:', err)
    if (err instanceof Error && 'statusCode' in err) {
      throw err
    }
    throw createError({
      statusCode: 500,
      message: `Database error: ${err instanceof Error ? err.message : String(err)}`
    })
  }
})
