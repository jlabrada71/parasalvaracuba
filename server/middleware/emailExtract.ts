import { Request, Response, NextFunction } from 'express'
import { validateEmail } from '../utils/emailValidation'

declare global {
  namespace Express {
    interface Request {
      userEmail: string | null
    }
  }
}

export function emailExtractMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const raw = req.headers['x-user-email']
  const headerValue = Array.isArray(raw) ? raw[0] : raw

  const result = validateEmail(headerValue)
  req.userEmail = result.valid ? (headerValue as string).trim().toLowerCase() : null

  next()
}
