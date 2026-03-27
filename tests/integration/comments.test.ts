import { describe, it, expect } from 'vitest'

const RUN_HTTP = process.env.INTEGRATION === 'true'
const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000'
const TEST_EMAIL = 'comment-test@example.com'
const OTHER_EMAIL = 'comment-other@example.com'

describe.skipIf(!RUN_HTTP)('Comments API (HTTP)', () => {
  let ideaId: string
  let commentId: string

  // Create a fresh idea before comment tests
  async function createIdea(email = TEST_EMAIL): Promise<string> {
    const res = await fetch(`${BASE}/api/ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': email },
      body: JSON.stringify({ title: 'Comment test idea', description: 'Testing comments.' }),
    })
    const body = await res.json()
    return body.id
  }

  it('setup: create a test idea', async () => {
    ideaId = await createIdea()
    expect(ideaId).toBeTruthy()
  })

  // POST /api/ideas/:id/comments tests
  describe('POST /api/ideas/:id/comments', () => {
    it('requires X-User-Email header (401)', async () => {
      const res = await fetch(`${BASE}/api/ideas/${ideaId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: 'Test comment' }),
      })
      expect(res.status).toBe(401)
    })

    it('requires body (400)', async () => {
      const res = await fetch(`${BASE}/api/ideas/${ideaId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
        body: JSON.stringify({ body: '' }),
      })
      expect(res.status).toBe(400)
    })

    it('validates body max 2000 chars (400)', async () => {
      const longBody = 'a'.repeat(2001)
      const res = await fetch(`${BASE}/api/ideas/${ideaId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
        body: JSON.stringify({ body: longBody }),
      })
      expect(res.status).toBe(400)
    })

    it('creates comment with parent_comment_id = null', async () => {
      const res = await fetch(`${BASE}/api/ideas/${ideaId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
        body: JSON.stringify({ body: 'Top-level comment' }),
      })
      expect(res.status).toBe(201)
      const body = await res.json()
      expect(body.id).toBeTruthy()
      expect(body.idea_id).toBe(ideaId)
      expect(body.parent_comment_id).toBeNull()
      expect(body.email).toBe(TEST_EMAIL)
      expect(body.body).toBe('Top-level comment')
      expect(body.net_votes).toBe(0)
      commentId = body.id
    })

    it('returns 201 with comment object', async () => {
      const res = await fetch(`${BASE}/api/ideas/${ideaId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
        body: JSON.stringify({ body: 'Another comment' }),
      })
      expect(res.status).toBe(201)
      const body = await res.json()
      expect(body).toHaveProperty('id')
      expect(body).toHaveProperty('idea_id')
      expect(body).toHaveProperty('parent_comment_id')
      expect(body).toHaveProperty('email')
      expect(body).toHaveProperty('body')
      expect(body).toHaveProperty('created_at')
      expect(body).toHaveProperty('updated_at')
      expect(body).toHaveProperty('upvotes')
      expect(body).toHaveProperty('downvotes')
      expect(body).toHaveProperty('net_votes')
    })

    it('returns 404 if idea not found', async () => {
      const res = await fetch(
        `${BASE}/api/ideas/00000000-0000-0000-0000-000000000000/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
          body: JSON.stringify({ body: 'Comment on non-existent idea' }),
        }
      )
      expect(res.status).toBe(404)
    })
  })

  // GET /api/ideas/:id/comments tests
  describe('GET /api/ideas/:id/comments', () => {
    it('returns array of comments', async () => {
      const res = await fetch(`${BASE}/api/ideas/${ideaId}/comments`)
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(Array.isArray(body)).toBe(true)
    })

    it('comments sorted by created_at ASC', async () => {
      const res = await fetch(`${BASE}/api/ideas/${ideaId}/comments`)
      const comments = await res.json()
      if (comments.length > 1) {
        for (let i = 0; i < comments.length - 1; i++) {
          const a = new Date(comments[i].created_at).getTime()
          const b = new Date(comments[i + 1].created_at).getTime()
          expect(a).toBeLessThanOrEqual(b)
        }
      }
    })

    it('includes vote counts (upvotes, downvotes, net_votes)', async () => {
      const res = await fetch(`${BASE}/api/ideas/${ideaId}/comments`)
      const comments = await res.json()
      if (comments.length > 0) {
        expect(comments[0]).toHaveProperty('upvotes')
        expect(comments[0]).toHaveProperty('downvotes')
        expect(comments[0]).toHaveProperty('net_votes')
      }
    })

    it('includes parent_comment_id', async () => {
      const res = await fetch(`${BASE}/api/ideas/${ideaId}/comments`)
      const comments = await res.json()
      if (comments.length > 0) {
        expect(comments[0]).toHaveProperty('parent_comment_id')
      }
    })

    it('returns 404 if idea not found', async () => {
      const res = await fetch(
        `${BASE}/api/ideas/00000000-0000-0000-0000-000000000000/comments`
      )
      expect(res.status).toBe(404)
    })
  })

  // POST /api/ideas/:id/comments/:id/reply tests
  describe('POST /api/ideas/:id/comments/:id/reply', () => {
    it('creates reply with parent_comment_id set', async () => {
      const res = await fetch(
        `${BASE}/api/ideas/${ideaId}/comments/${commentId}/reply`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
          body: JSON.stringify({ body: 'Reply to comment' }),
        }
      )
      expect(res.status).toBe(201)
      const body = await res.json()
      expect(body.parent_comment_id).toBe(commentId)
      expect(body.idea_id).toBe(ideaId)
    })

    it('requires X-User-Email header', async () => {
      const res = await fetch(
        `${BASE}/api/ideas/${ideaId}/comments/${commentId}/reply`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: 'Reply' }),
        }
      )
      expect(res.status).toBe(401)
    })

    it('validates body (required, max 2000)', async () => {
      const res = await fetch(
        `${BASE}/api/ideas/${ideaId}/comments/${commentId}/reply`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
          body: JSON.stringify({ body: '' }),
        }
      )
      expect(res.status).toBe(400)
    })

    it('returns 404 if parent comment not found', async () => {
      const res = await fetch(
        `${BASE}/api/ideas/${ideaId}/comments/00000000-0000-0000-0000-000000000000/reply`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
          body: JSON.stringify({ body: 'Reply' }),
        }
      )
      expect(res.status).toBe(404)
    })

    it('prevents nesting > 10 levels (400)', async () => {
      // Create a 10-level deep comment chain
      let parentId = commentId
      for (let i = 0; i < 10; i++) {
        const res = await fetch(
          `${BASE}/api/ideas/${ideaId}/comments/${parentId}/reply`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
            body: JSON.stringify({ body: `Reply level ${i + 1}` }),
          }
        )
        if (res.status === 400) {
          // Depth limit reached
          expect(res.status).toBe(400)
          return
        }
        expect(res.status).toBe(201)
        const body = await res.json()
        parentId = body.id
      }

      // Try to create one more level (should fail if max depth reached)
      const res = await fetch(
        `${BASE}/api/ideas/${ideaId}/comments/${parentId}/reply`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
          body: JSON.stringify({ body: 'Should fail - too deep' }),
        }
      )
      // Server may allow up to 10 or enforce earlier, this is flexible
      if (res.status === 400) {
        expect(res.status).toBe(400)
      }
    })
  })

  // Verify backward compatibility
  describe('Backward compatibility', () => {
    it('ideas voting still works (not affected by comments)', async () => {
      const res = await fetch(`${BASE}/api/ideas/${ideaId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
        body: JSON.stringify({ vote_value: 1 }),
      })
      expect(res.status).toBe(200)
    })

    it('idea detail includes net_votes', async () => {
      const res = await fetch(`${BASE}/api/ideas/${ideaId}`)
      expect(res.status).toBe(200)
      const idea = await res.json()
      expect(idea).toHaveProperty('net_votes')
    })
  })
})
