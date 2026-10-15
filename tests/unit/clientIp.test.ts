import { describe, it, expect, afterEach } from 'vitest'
import { clientIp } from '../../server/utils/clientIp'

const ev = (headers: Record<string, string>, remote = '10.0.0.9') =>
  ({ context: {}, node: { req: { headers, socket: { remoteAddress: remote } } } }) as any

describe('clientIp', () => {
  afterEach(() => { delete process.env.TRUST_PROXY })

  it('uses the socket address and ignores X-Forwarded-For by default (spoof-proof)', () => {
    expect(clientIp(ev({ 'x-forwarded-for': '1.2.3.4' }))).toBe('10.0.0.9')
  })

  it('uses the first X-Forwarded-For entry when TRUST_PROXY=true', () => {
    process.env.TRUST_PROXY = 'true'
    expect(clientIp(ev({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }))).toBe('1.2.3.4')
  })

  it('falls back to the socket address when TRUST_PROXY=true but no header is sent', () => {
    process.env.TRUST_PROXY = 'true'
    expect(clientIp(ev({}))).toBe('10.0.0.9')
  })

  it('returns "unknown" when no address is available', () => {
    expect(clientIp(ev({}, null as any))).toBe('unknown')
  })
})
