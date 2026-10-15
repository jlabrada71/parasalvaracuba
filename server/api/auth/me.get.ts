import { defineEventHandler } from 'h3'

/**
 * GET /api/auth/me
 * - `email`: legacy email identity from the X-User-Email header (public flow)
 * - `user`: logged-in account from the session cookie, or null
 */
export default defineEventHandler((event) => {
  return {
    email: event.context.userEmail || null,
    user: event.context.user ?? null,
  }
})
