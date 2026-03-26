import { describe, it, expect } from 'vitest'
import { validateEmail } from '../../server/utils/emailValidation'

// ─── Lightweight unit tests (no running server required) ──────────────────
// Full HTTP integration tests require a running dev server + DB.
// Run those manually with: npm run dev  (then npx vitest run tests/integration)
// Or add a separate test:integration script that spins up the server.

describe('Ideas: email validation (unit smoke)', () => {
  it('accepts a valid email', () => {
    expect(validateEmail('idea-author@example.com').valid).toBe(true)
  })

  it('rejects empty string', () => {
    expect(validateEmail('').valid).toBe(false)
  })
})

// ─── HTTP integration tests ───────────────────────────────────────────────
// These are skipped in the default vitest run (no server).
// To run: start the dev server, then `INTEGRATION=true npx vitest run tests/integration`

const RUN_HTTP = process.env.INTEGRATION === 'true'
const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000'
const TEST_EMAIL = 'integration-test@example.com'

describe.skipIf(!RUN_HTTP)('Ideas API (HTTP)', () => {
  let createdId: string

  it('GET /api/ideas returns a paginated list', async () => {
    const res = await fetch(`${BASE}/api/ideas`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('ideas')
    expect(Array.isArray(body.ideas)).toBe(true)
    expect(body).toHaveProperty('page', 1)
    expect(body).toHaveProperty('limit', 20)
  })

  it('POST /api/ideas creates an idea (authenticated)', async () => {
    const res = await fetch(`${BASE}/api/ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
      body: JSON.stringify({ title: 'Integration test idea', description: 'Created by automated test.' }),
    })
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body).toHaveProperty('id')
    expect(body.title).toBe('Integration test idea')
    expect(body.email).toBe(TEST_EMAIL)
    createdId = body.id
  })

  it('POST /api/ideas returns 401 without email header', async () => {
    const res = await fetch(`${BASE}/api/ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Ghost idea', description: 'No auth.' }),
    })
    expect(res.status).toBe(401)
  })

  it('POST /api/ideas returns 400 for missing title', async () => {
    const res = await fetch(`${BASE}/api/ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
      body: JSON.stringify({ description: 'No title.' }),
    })
    expect(res.status).toBe(400)
  })

  it('GET /api/ideas/:id returns the idea', async () => {
    const res = await fetch(`${BASE}/api/ideas/${createdId}`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.id).toBe(createdId)
    expect(body).toHaveProperty('net_votes')
  })

  it('GET /api/ideas/:id returns 404 for unknown id', async () => {
    const res = await fetch(`${BASE}/api/ideas/00000000-0000-0000-0000-000000000000`)
    expect(res.status).toBe(404)
  })

  it('PATCH /api/ideas/:id updates the idea (author)', async () => {
    const res = await fetch(`${BASE}/api/ideas/${createdId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
      body: JSON.stringify({ title: 'Updated title', description: 'Updated description.' }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.title).toBe('Updated title')
  })

  it('PATCH /api/ideas/:id returns 403 for non-author', async () => {
    const res = await fetch(`${BASE}/api/ideas/${createdId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': 'attacker@example.com' },
      body: JSON.stringify({ title: 'Hacked', description: 'Should not work.' }),
    })
    expect(res.status).toBe(403)
  })
})
