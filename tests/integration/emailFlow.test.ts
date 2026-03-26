import { describe, it, expect } from 'vitest'
import express from 'express'
import request from 'supertest'
import { emailExtractMiddleware } from '../../server/middleware/emailExtract'
import authRouter from '../../server/routes/auth'

const app = express()
app.use(emailExtractMiddleware)
app.use('/api/auth', authRouter)

describe('Email flow integration', () => {
  it('returns email when valid X-User-Email header is sent', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('X-User-Email', 'test@example.com')

    expect(res.status).toBe(200)
    expect(res.body.email).toBe('test@example.com')
  })

  it('returns null when no header is sent', async () => {
    const res = await request(app).get('/api/auth/me')

    expect(res.status).toBe(200)
    expect(res.body.email).toBeNull()
  })

  it('returns null when header is malformed', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('X-User-Email', 'not-an-email')

    expect(res.status).toBe(200)
    expect(res.body.email).toBeNull()
  })
})
