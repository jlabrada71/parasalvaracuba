import { getRequestIP } from 'h3'
import type { H3Event } from 'h3'

/**
 * Client IP for rate limiting. X-Forwarded-For is only honoured when TRUST_PROXY=true,
 * i.e. when a reverse proxy in front of the app overwrites that header; otherwise any
 * client could spoof it to dodge the limiter.
 */
export function clientIp(event: H3Event): string {
  return getRequestIP(event, { xForwardedFor: process.env.TRUST_PROXY === 'true' }) ?? 'unknown'
}
