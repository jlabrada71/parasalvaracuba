export interface RateLimiter {
  isLimited(key: string): boolean
  recordFailure(key: string): void
  reset(key: string): void
}

export function createRateLimiter(opts: { max: number; windowMs: number; now?: () => number }): RateLimiter {
  const now = opts.now ?? Date.now
  const failures = new Map<string, number[]>()

  function recent(key: string): number[] {
    const cutoff = now() - opts.windowMs
    const kept = (failures.get(key) ?? []).filter(ts => ts > cutoff)
    if (kept.length) failures.set(key, kept)
    else failures.delete(key)
    return kept
  }

  return {
    isLimited: key => recent(key).length >= opts.max,
    recordFailure(key) {
      const kept = recent(key)
      kept.push(now())
      failures.set(key, kept)
    },
    reset: key => { failures.delete(key) },
  }
}
