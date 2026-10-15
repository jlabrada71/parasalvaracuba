import { describe, it, expect } from 'vitest'
import { createRateLimiter } from '../../server/utils/rateLimit'

describe('rateLimit', () => {
  it('limits a key after max failures', () => {
    const rl = createRateLimiter({ max: 3, windowMs: 1000 })
    for (let i = 0; i < 2; i++) rl.recordFailure('k')
    expect(rl.isLimited('k')).toBe(false)
    rl.recordFailure('k')
    expect(rl.isLimited('k')).toBe(true)
  })

  it('does not limit other keys', () => {
    const rl = createRateLimiter({ max: 1, windowMs: 1000 })
    rl.recordFailure('a')
    expect(rl.isLimited('b')).toBe(false)
  })

  it('forgets failures older than the window', () => {
    let t = 0
    const rl = createRateLimiter({ max: 1, windowMs: 1000, now: () => t })
    rl.recordFailure('k')
    expect(rl.isLimited('k')).toBe(true)
    t = 1001
    expect(rl.isLimited('k')).toBe(false)
  })

  it('reset clears a key', () => {
    const rl = createRateLimiter({ max: 1, windowMs: 1000 })
    rl.recordFailure('k')
    rl.reset('k')
    expect(rl.isLimited('k')).toBe(false)
  })
})
