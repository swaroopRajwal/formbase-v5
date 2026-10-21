import { describe, expect, it } from "vitest"
import {
  createRateLimiter,
  isHoneypotFilled,
  HONEYPOT_FIELD,
} from "./spamGuard"

describe("isHoneypotFilled", () => {
  it("is false when the honeypot is missing or blank", () => {
    expect(isHoneypotFilled({})).toBe(false)
    expect(isHoneypotFilled({ [HONEYPOT_FIELD]: "" })).toBe(false)
    expect(isHoneypotFilled({ [HONEYPOT_FIELD]: "   " })).toBe(false)
  })

  it("is true when a bot filled it in", () => {
    expect(isHoneypotFilled({ [HONEYPOT_FIELD]: "http://spam" })).toBe(true)
  })
})

describe("createRateLimiter", () => {
  const setup = (limit = 2, windowMs = 1000) => {
    let now = 0
    const limiter = createRateLimiter({ limit, windowMs, now: () => now })
    return { limiter, advance: (ms: number) => (now += ms) }
  }

  it("allows up to the limit then blocks", () => {
    const { limiter } = setup()
    expect(limiter.take("form1:1.1.1.1")).toBe(true)
    expect(limiter.take("form1:1.1.1.1")).toBe(true)
    expect(limiter.take("form1:1.1.1.1")).toBe(false)
  })

  it("counts each key separately (per IP per Form)", () => {
    const { limiter } = setup(1)
    expect(limiter.take("form1:1.1.1.1")).toBe(true)
    expect(limiter.take("form1:2.2.2.2")).toBe(true)
    expect(limiter.take("form2:1.1.1.1")).toBe(true)
    expect(limiter.take("form1:1.1.1.1")).toBe(false)
  })

  it("allows again once the window has passed", () => {
    const { limiter, advance } = setup(1, 1000)
    limiter.take("k")
    expect(limiter.take("k")).toBe(false)
    advance(1000)
    expect(limiter.take("k")).toBe(true)
  })
})
