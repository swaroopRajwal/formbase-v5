// Name of the hidden field humans never see; bots tend to fill every input.
export const HONEYPOT_FIELD = "website_url"

export const isHoneypotFilled = (raw: Record<string, unknown>) => {
  const value = raw[HONEYPOT_FIELD]
  return typeof value === "string" && value.trim() !== ""
}

type RateLimiterOptions = {
  limit: number
  windowMs: number
  now?: () => number
}

// Fixed-window counter per key. In-memory, so it is per server instance.
export const createRateLimiter = ({
  limit,
  windowMs,
  now = Date.now,
}: RateLimiterOptions) => {
  const windows = new Map<string, { start: number; count: number }>()
  return {
    // True if this request is within the limit (and counts it).
    take: (key: string) => {
      const t = now()
      for (const [k, w] of windows)
        if (t - w.start >= windowMs) windows.delete(k)
      const w = windows.get(key)
      if (!w) {
        windows.set(key, { start: t, count: 1 })
        return true
      }
      if (w.count >= limit) return false
      w.count += 1
      return true
    },
  }
}

export const submitLimiter = createRateLimiter({
  limit: 5,
  windowMs: 60_000,
})
