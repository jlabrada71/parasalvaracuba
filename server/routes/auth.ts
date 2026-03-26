/**
 * GET /api/auth/me
 * Returns the email extracted by the middleware, or null.
 * Used for integration tests and debugging only. Not user-facing in Phase 1.
 */
export default defineEventHandler((event) => {
  return {
    email: event.context.userEmail || null
  }
})
