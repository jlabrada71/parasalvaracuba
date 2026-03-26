import { Router, Request, Response } from 'express'

const router = Router()

/**
 * GET /api/auth/me
 * Returns the email extracted by the middleware, or null.
 * Used for integration tests and debugging only. Not user-facing in Phase 1.
 */
router.get('/me', (req: Request, res: Response) => {
  res.json({ email: req.userEmail })
})

export default router
