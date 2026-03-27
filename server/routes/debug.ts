import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const databaseUrl = process.env.DATABASE_URL || 'NOT_SET'
  return {
    status: 'ok',
    databaseUrl: databaseUrl ? 'SET' : 'NOT_SET',
    env_keys: Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('NODE')),
    event_context_userEmail: event.context.userEmail,
  }
})
