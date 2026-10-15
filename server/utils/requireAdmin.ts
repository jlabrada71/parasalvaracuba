import { createError } from 'h3'
import type { H3Event } from 'h3'
import type { SessionUser } from './session'

export function requireAdmin(event: H3Event): SessionUser {
  const user = event.context.user as SessionUser | null | undefined
  if (!user) throw createError({ statusCode: 401, message: 'Authentication required' })
  if (user.role !== 'admin') throw createError({ statusCode: 403, message: 'Admin access required' })
  return user
}
