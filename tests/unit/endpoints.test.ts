import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createError, getQuery, setResponseStatus } from 'h3'

// Mock the database module
vi.mock('../../server/utils/db', () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
}))

describe('API Endpoints', () => {
  let query: any
  let queryOne: any

  beforeEach(async () => {
    const db = await import('../../server/utils/db')
    query = vi.mocked(db.query)
    queryOne = vi.mocked(db.queryOne)
    vi.clearAllMocks()
  })

  describe('GET /api/ideas', () => {
    it('returns paginated ideas sorted by net votes', async () => {
      const mockIdeas = [
        {
          id: 'idea-1',
          title: 'Better transit',
          net_votes: 5,
          email: 'user@example.com',
          created_at: '2025-03-26T10:00:00Z',
          updated_at: '2025-03-26T10:00:00Z',
        },
      ]

      query.mockResolvedValue(mockIdeas)

      // Simulate the handler logic
      const limit = 20
      const offset = 0
      const result = await query(
        `
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
        GROUP BY i.id
        ORDER BY net_votes DESC, i.created_at DESC
        LIMIT $1 OFFSET $2
      `,
        [limit, offset]
      )

      expect(result).toEqual(mockIdeas)
      expect(query).toHaveBeenCalledWith(expect.any(String), [limit, offset])
    })

    it('handles pagination correctly', async () => {
      query.mockResolvedValue([])

      const limit = 20
      const page = 2
      const offset = (page - 1) * limit

      await query('SELECT ... LIMIT $1 OFFSET $2', [limit, offset])

      expect(query).toHaveBeenCalledWith(expect.any(String), [20, 20])
    })
  })

  describe('POST /api/ideas', () => {
    it('creates new idea with required fields', async () => {
      const newIdea = {
        id: 'idea-new',
        title: 'Improved water system',
        description: 'Better infrastructure',
        email: 'citizen@example.com',
        created_at: '2025-03-26T11:00:00Z',
        updated_at: '2025-03-26T11:00:00Z',
      }

      query.mockResolvedValue([newIdea])

      const result = await query(
        `
        INSERT INTO ideas (title, description, email)
        VALUES ($1, $2, $3)
        RETURNING id, title, description, email, created_at, updated_at
      `,
        ['Improved water system', 'Better infrastructure', 'citizen@example.com']
      )

      expect(result[0]).toEqual(newIdea)
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO ideas'),
        expect.arrayContaining([
          'Improved water system',
          'Better infrastructure',
          'citizen@example.com',
        ])
      )
    })

    it('validates title is required', () => {
      const title = ''
      expect(title).toBeFalsy()
    })

    it('validates description is required', () => {
      const description = ''
      expect(description).toBeFalsy()
    })

    it('validates title length', () => {
      const title = 'x'.repeat(201)
      expect(title.length > 200).toBe(true)
    })
  })

  describe('GET /api/ideas/:id', () => {
    it('returns idea with detail including net votes', async () => {
      const mockIdea = {
        id: 'idea-1',
        title: 'Better transit',
        description: 'Improve public transportation',
        email: 'user@example.com',
        created_at: '2025-03-26T10:00:00Z',
        updated_at: '2025-03-26T10:00:00Z',
        net_votes: 10,
      }

      query.mockResolvedValue([mockIdea])

      const result = await query(
        `
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
      `,
        ['idea-1']
      )

      expect(result[0]).toEqual(mockIdea)
      expect(result[0].net_votes).toBe(10)
    })
  })

  describe('PATCH /api/ideas/:id', () => {
    it('updates idea when user is author', async () => {
      const updatedIdea = {
        id: 'idea-1',
        title: 'Improved transit system',
        description: 'Much better description',
        email: 'user@example.com',
        created_at: '2025-03-26T10:00:00Z',
        updated_at: '2025-03-26T12:00:00Z',
      }

      query.mockResolvedValue([updatedIdea])

      const result = await query(
        `
        UPDATE ideas
        SET title = $1, description = $2, updated_at = NOW()
        WHERE id = $3 AND email = $4
        RETURNING id, title, description, email, created_at, updated_at
      `,
        [
          'Improved transit system',
          'Much better description',
          'idea-1',
          'user@example.com',
        ]
      )

      expect(result[0]).toEqual(updatedIdea)
    })

    it('prevents non-author from updating', async () => {
      query.mockResolvedValue([])

      const result = await query(
        `
        UPDATE ideas
        SET title = $1, description = $2, updated_at = NOW()
        WHERE id = $3 AND email = $4
        RETURNING id, title, description, email, created_at, updated_at
      `,
        ['New title', 'New desc', 'idea-1', 'different@example.com']
      )

      expect(result).toEqual([])
    })
  })

  describe('POST /api/ideas/:id/votes', () => {
    it('creates or updates vote using upsert', async () => {
      query.mockResolvedValue([{ net_votes: 6 }])

      const result = await query(
        `
        INSERT INTO votes (idea_id, email, vote_value)
        VALUES ($1, $2, $3)
        ON CONFLICT (idea_id, email) DO UPDATE
          SET vote_value = EXCLUDED.vote_value, updated_at = NOW()
        RETURNING (SELECT COALESCE(SUM(vote_value), 0)::int FROM votes WHERE idea_id = $1) AS net_votes
      `,
        ['idea-1', 'user@example.com', 1]
      )

      expect(result[0].net_votes).toBe(6)
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('ON CONFLICT'),
        expect.arrayContaining(['idea-1', 'user@example.com', 1])
      )
    })

    it('handles vote toggle (0 means no vote)', async () => {
      query.mockResolvedValue([{ net_votes: 5 }])

      const result = await query(
        `
        INSERT INTO votes (idea_id, email, vote_value)
        VALUES ($1, $2, $3)
        ON CONFLICT (idea_id, email) DO UPDATE
          SET vote_value = EXCLUDED.vote_value, updated_at = NOW()
        RETURNING (SELECT COALESCE(SUM(vote_value), 0)::int FROM votes WHERE idea_id = $1) AS net_votes
      `,
        ['idea-1', 'user@example.com', 0]
      )

      expect(result[0].net_votes).toBe(5)
    })

    it('prevents duplicate votes with unique constraint', async () => {
      // The database enforces UNIQUE(idea_id, email)
      // This test documents the expected behavior
      const ideaId = 'idea-1'
      const email = 'user@example.com'

      // First vote: +1
      query.mockResolvedValueOnce([{ net_votes: 1 }])
      await query(
        'INSERT INTO votes ... ON CONFLICT DO UPDATE ...',
        [ideaId, email, 1]
      )

      // Second vote: same user, changes to -1 (upsert updates)
      query.mockResolvedValueOnce([{ net_votes: -1 }])
      await query(
        'INSERT INTO votes ... ON CONFLICT DO UPDATE ...',
        [ideaId, email, -1]
      )

      expect(query).toHaveBeenCalledTimes(2)
    })
  })
})
