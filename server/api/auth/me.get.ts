import { defineEventHandler } from 'h3'

/**
 * GET /api/auth/me
 * Returns the email extracted by the middleware, or null.
 * Used for integration tests and debugging only.
 */
export default defineEventHandler((event) => {
  return {
    email: event.context.userEmail || null
  }
})
