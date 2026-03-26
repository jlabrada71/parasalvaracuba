import { describe, it, expect } from 'vitest'

const RUN_HTTP = process.env.INTEGRATION === 'true'
const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000'
const TEST_EMAIL = 'voter-test@example.com'
const OTHER_EMAIL = 'voter-other@example.com'

describe.skipIf(!RUN_HTTP)('Votes API (HTTP)', () => {
  let ideaId: string

  // Create a fresh idea before vote tests
  async function createIdea(email = TEST_EMAIL): Promise<string> {
    const res = await fetch(`${BASE}/api/ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': email },
      body: JSON.stringify({ title: 'Vote test idea', description: 'Testing voting.' }),
    })
    const body = await res.json()
    return body.id
  }

  it('setup: create a test idea', async () => {
    ideaId = await createIdea()
    expect(ideaId).toBeTruthy()
  })

  it('POST /api/ideas/:id/votes casts an upvote', async () => {
    const res = await fetch(`${BASE}/api/ideas/${ideaId}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
      body: JSON.stringify({ vote_value: 1 }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.net_votes).toBe(1)
  })

  it('duplicate upvote from same user returns net_votes unchanged (upsert, no duplicate row)', async () => {
    const res = await fetch(`${BASE}/api/ideas/${ideaId}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
      body: JSON.stringify({ vote_value: 1 }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    // Same user voting same value — net_votes stays at 1, no duplicate
    expect(body.net_votes).toBe(1)
  })

  it('second user upvote increases net_votes to 2', async () => {
    const res = await fetch(`${BASE}/api/ideas/${ideaId}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': OTHER_EMAIL },
      body: JSON.stringify({ vote_value: 1 }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.net_votes).toBe(2)
  })

  it('first user changes vote to -1 — net_votes drops to 0', async () => {
    const res = await fetch(`${BASE}/api/ideas/${ideaId}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
      body: JSON.stringify({ vote_value: -1 }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.net_votes).toBe(0)
  })

  it('first user clears vote (vote_value 0) — net_votes returns to 1', async () => {
    const res = await fetch(`${BASE}/api/ideas/${ideaId}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
      body: JSON.stringify({ vote_value: 0 }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.net_votes).toBe(1)
  })

  it('returns 401 when no email header', async () => {
    const res = await fetch(`${BASE}/api/ideas/${ideaId}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vote_value: 1 }),
    })
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid vote_value', async () => {
    const res = await fetch(`${BASE}/api/ideas/${ideaId}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
      body: JSON.stringify({ vote_value: 99 }),
    })
    expect(res.status).toBe(400)
  })

  it('returns 404 for unknown idea', async () => {
    const res = await fetch(`${BASE}/api/ideas/00000000-0000-0000-0000-000000000000/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
      body: JSON.stringify({ vote_value: 1 }),
    })
    expect(res.status).toBe(404)
  })
})
