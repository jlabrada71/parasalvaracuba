import { defineEventHandler, getCookie } from 'h3'
import { getSessionUser, SESSION_COOKIE } from '../utils/session'

export default defineEventHandler(async (event) => {
  event.context.user = null
  if (!event.path.startsWith('/api/')) return
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) return
  try {
    event.context.user = await getSessionUser(token)
  } catch (err) {
    console.error('session lookup failed:', err)
  }
})
