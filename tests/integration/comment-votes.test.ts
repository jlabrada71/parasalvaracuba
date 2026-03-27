import { describe, it, expect } from 'vitest'

const RUN_HTTP = process.env.INTEGRATION === 'true'
const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000'
const TEST_EMAIL = 'comment-voter-test@example.com'
const OTHER_EMAIL = 'comment-voter-other@example.com'

describe.skipIf(!RUN_HTTP)('Comment Votes API (HTTP)', () => {
  let ideaId: string
  let commentId: string

  // Create test idea and comment
  async function createIdea(email = TEST_EMAIL): Promise<string> {
    const res = await fetch(`${BASE}/api/ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': email },
      body: JSON.stringify({ title: 'Comment vote test', description: 'Testing comment votes.' }),
    })
    const body = await res.json()
    return body.id
  }

  async function createComment(ideaId: string, email = TEST_EMAIL): Promise<string> {
    const res = await fetch(`${BASE}/api/ideas/${ideaId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': email },
      body: JSON.stringify({ body: 'Test comment for voting' }),
    })
    const body = await res.json()
    return body.id
  }

  it('setup: create test idea and comment', async () => {
    ideaId = await createIdea()
    expect(ideaId).toBeTruthy()
    commentId = await createComment(ideaId)
    expect(commentId).toBeTruthy()
  })

  // POST /api/comments/:id/votes tests
  describe('POST /api/comments/:id/votes', () => {
    it('requires X-User-Email header (401)', async () => {
      const res = await fetch(`${BASE}/api/comments/${commentId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote_value: 1 }),
      })
      expect(res.status).toBe(401)
    })

    it('requires vote_value in [-1, 0, 1] (400)', async () => {
      const res = await fetch(`${BASE}/api/comments/${commentId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
        body: JSON.stringify({ vote_value: 99 }),
      })
      expect(res.status).toBe(400)
    })

    it('creates vote with comment_id set, idea_id = null', async () => {
      const res = await fetch(`${BASE}/api/comments/${commentId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
        body: JSON.stringify({ vote_value: 1 }),
      })
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toHaveProperty('net_votes')
      expect(body.net_votes).toBe(1)
    })

    it('upvote: vote_value = 1 increases net_votes', async () => {
      const res = await fetch(`${BASE}/api/comments/${commentId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Email': OTHER_EMAIL },
        body: JSON.stringify({ vote_value: 1 }),
      })
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.net_votes).toBe(2)
    })

    it('downvote: vote_value = -1 decreases net_votes', async () => {
      // Create new comment for downvote test
      const newCommentId = await createComment(ideaId)
      const res = await fetch(`${BASE}/api/comments/${newCommentId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
        body: JSON.stringify({ vote_value: -1 }),
      })
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.net_votes).toBe(-1)
    })

    it('clear vote: vote_value = 0 removes vote', async () => {
      // Create new comment for clear vote test
      const newCommentId = await createComment(ideaId)
      // Cast upvote
      await fetch(`${BASE}/api/comments/${newCommentId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
        body: JSON.stringify({ vote_value: 1 }),
      })
      // Clear vote
      const res = await fetch(`${BASE}/api/comments/${newCommentId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
        body: JSON.stringify({ vote_value: 0 }),
      })
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.net_votes).toBe(0)
    })

    it('upsert: second vote with different value updates (no duplicate)', async () => {
      // Create new comment for upsert test
      const newCommentId = await createComment(ideaId)
      // Cast upvote
      const res1 = await fetch(`${BASE}/api/comments/${newCommentId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
        body: JSON.stringify({ vote_value: 1 }),
      })
      const body1 = await res1.json()
      expect(body1.net_votes).toBe(1)

      // Change vote to downvote
      const res2 = await fetch(`${BASE}/api/comments/${newCommentId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
        body: JSON.stringify({ vote_value: -1 }),
      })
      const body2 = await res2.json()
      expect(body2.net_votes).toBe(-1) // Should be -1, not 0 (upserted, not duplicated)
    })

    it('returns net_votes after vote', async () => {
      const res = await fetch(`${BASE}/api/comments/${commentId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Email': 'voter-new@example.com' },
        body: JSON.stringify({ vote_value: 1 }),
      })
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(typeof body.net_votes).toBe('number')
    })

    it('returns 404 for unknown comment', async () => {
      const res = await fetch(
        `${BASE}/api/comments/00000000-0000-0000-0000-000000000000/votes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
          body: JSON.stringify({ vote_value: 1 }),
        }
      )
      expect(res.status).toBe(404)
    })
  })

  // Vote aggregation and retrieval tests
  describe('Vote aggregation', () => {
    it('GET /api/ideas/:id/comments reflects updated vote counts', async () => {
      const newCommentId = await createComment(ideaId)

      // Cast votes
      await fetch(`${BASE}/api/comments/${newCommentId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
        body: JSON.stringify({ vote_value: 1 }),
      })
      await fetch(`${BASE}/api/comments/${newCommentId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Email': OTHER_EMAIL },
        body: JSON.stringify({ vote_value: 1 }),
      })

      // Fetch comments
      const res = await fetch(`${BASE}/api/ideas/${ideaId}/comments`)
      const comments = await res.json()
      const comment = comments.find((c: any) => c.id === newCommentId)
      expect(comment).toBeTruthy()
      expect(comment.net_votes).toBe(2)
      expect(comment.upvotes).toBe(2)
    })

    it('multiple users can vote on same comment independently', async () => {
      const newCommentId = await createComment(ideaId)

      // User 1 upvotes
      const res1 = await fetch(`${BASE}/api/comments/${newCommentId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
        body: JSON.stringify({ vote_value: 1 }),
      })
      const body1 = await res1.json()
      expect(body1.net_votes).toBe(1)

      // User 2 upvotes
      const res2 = await fetch(`${BASE}/api/comments/${newCommentId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Email': OTHER_EMAIL },
        body: JSON.stringify({ vote_value: 1 }),
      })
      const body2 = await res2.json()
      expect(body2.net_votes).toBe(2)

      // User 1 changes vote to downvote
      const res3 = await fetch(`${BASE}/api/comments/${newCommentId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
        body: JSON.stringify({ vote_value: -1 }),
      })
      const body3 = await res3.json()
      expect(body3.net_votes).toBe(0) // (1 from user 2) + (-1 from user 1) = 0
    })

    it('vote aggregation sums correctly (excluding 0s)', async () => {
      const newCommentId = await createComment(ideaId)

      const voters = [
        { email: 'voter1@test.com', value: 1 },
        { email: 'voter2@test.com', value: 1 },
        { email: 'voter3@test.com', value: -1 },
        { email: 'voter4@test.com', value: 1 },
      ]

      for (const voter of voters) {
        await fetch(`${BASE}/api/comments/${newCommentId}/votes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-User-Email': voter.email },
          body: JSON.stringify({ vote_value: voter.value }),
        })
      }

      const res = await fetch(`${BASE}/api/ideas/${ideaId}/comments`)
      const comments = await res.json()
      const comment = comments.find((c: any) => c.id === newCommentId)
      // Expected: 1 + 1 + (-1) + 1 = 2
      expect(comment.net_votes).toBe(2)
      expect(comment.upvotes).toBe(3)
      expect(comment.downvotes).toBe(1)
    })
  })
})
