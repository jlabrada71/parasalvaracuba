import { setCookie, deleteCookie, getCookie } from 'h3'
import type { H3Event } from 'h3'
import { query, queryOne } from './db'
import { generateToken, hashToken } from './tokens'

export const SESSION_COOKIE = 'session'
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

export interface SessionUser {
  id: string
  email: string
  role: 'admin' | 'author'
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  }
}

export async function createSession(event: H3Event, userId: string): Promise<void> {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  await query(
    `INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)`,
    [hashToken(token), userId, expiresAt]
  )
  setCookie(event, SESSION_COOKIE, token, { ...cookieOptions(), expires: expiresAt })
}

export async function getSessionUser(token: string): Promise<SessionUser | null> {
  return queryOne<SessionUser>(
    `SELECT u.id, u.email, u.role
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND s.expires_at > NOW() AND u.is_active = TRUE`,
    [hashToken(token)]
  )
}

export async function destroySession(event: H3Event): Promise<void> {
  const token = getCookie(event, SESSION_COOKIE)
  if (token) await query(`DELETE FROM sessions WHERE token_hash = $1`, [hashToken(token)])
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}
