import { describe, expect, it } from "vitest"
import {
  answerText,
  answerType,
  formatAnswer,
  formatSubmitted,
  truncate,
  truncateSegments,
} from "./answerFormat"

describe("formatAnswer", () => {
  it("shows nothing for an unanswered Field", () => {
    expect(formatAnswer("short", undefined)).toEqual([])
    expect(answerText("short", undefined)).toBe("")
  })

  it("formats scalars", () => {
    expect(answerText("short", "Ada")).toBe("Ada")
    expect(answerText("number", 42)).toBe("42")
    expect(answerText("switch", true)).toBe("Yes")
    expect(answerText("switch", false)).toBe("No")
    expect(answerText("date", "2026-03-04")).toBe("2026-03-04")
  })

  it("formats a Date range and a Date time in the Respondent's zone", () => {
    expect(
      answerText("date_range", { start: "2026-03-04", end: "2026-03-06" })
    ).toBe("2026-03-04 – 2026-03-06")
    expect(
      answerText("datetime", {
        instant: "2026-03-04T14:30:00.000Z",
        timezone: "Asia/Kolkata",
      })
    ).toBe("2026-03-04 20:00 (Asia/Kolkata)")
  })

  it("joins many options with commas", () => {
    expect(answerText("checkbox", ["Red", "Blue"])).toBe("Red, Blue")
  })

  it("keeps Other answers distinct from a listed option with the same text", () => {
    expect(formatAnswer("radio", { other: "Red" })).toEqual([
      { text: "Red", other: true },
    ])
    expect(formatAnswer("checkbox", ["Red", { other: "Red" }])).toEqual([
      { text: "Red", other: false },
      { text: "Red", other: true },
    ])
    expect(answerText("radio", { other: "Red" })).toBe("Other: Red")
    expect(answerText("checkbox", ["Red", { other: "Red" }])).toBe(
      "Red, Other: Red"
    )
  })
})

describe("truncate", () => {
  it("leaves short text and cuts long text with an ellipsis", () => {
    expect(truncate("abc", 5)).toBe("abc")
    expect(truncate("abcdef", 5)).toBe("abcd…")
  })
})

describe("formatSubmitted", () => {
  it("is fixed-format UTC", () => {
    expect(formatSubmitted("2026-01-02T03:04:05.000Z")).toBe(
      "2026-01-02 03:04 UTC"
    )
  })
})

describe("answerType", () => {
  it("prefers the Submission's own snapshot type", () => {
    expect(answerType("a", "datetime", [{ fieldId: "a", label: "A", type: "short" }])).toBe("short")
    expect(answerType("a", "datetime", [])).toBe("datetime")
    expect(answerType("a", "datetime")).toBe("datetime")
  })
})

describe("truncateSegments", () => {
  const seg = (text: string, other = false) => ({ text, other })
  it("limits the cell as a whole, not each segment", () => {
    expect(truncateSegments([seg("aaaa"), seg("bbbb"), seg("cccc")], 6)).toEqual([
      seg("aaaa"),
      seg("b…"),
    ])
    expect(truncateSegments([seg("ab"), seg("cd")], 10)).toEqual([seg("ab"), seg("cd")])
  })
})
