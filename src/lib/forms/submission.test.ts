import { describe, expect, it } from "vitest"
import type { PublicField } from "./publicForm"
import { OTHER_CHOICE, otherTextKey, validateSubmission } from "./submission"

const field = (over: Partial<PublicField>): PublicField => ({
  id: "f1",
  type: "short",
  label: "Name",
  helperText: "",
  required: false,
  placeholder: null,
  options: [],
  allowOther: false,
  ...over,
})

const errorsOf = (fields: PublicField[], raw: Record<string, unknown>) => {
  const result = validateSubmission(fields, raw)
  if (result.ok) throw new Error("expected validation errors")
  return result.errors
}

const answersOf = (fields: PublicField[], raw: Record<string, unknown>) => {
  const result = validateSubmission(fields, raw)
  if (!result.ok) throw new Error(JSON.stringify(result.errors))
  return result.answers
}

describe("validateSubmission: required and text", () => {
  it("rejects a missing required answer with a per-field error", () => {
    const fields = [
      field({ id: "a", required: true }),
      field({ id: "b", required: true }),
    ]
    expect(errorsOf(fields, { a: "  " })).toEqual({
      a: "This field is required",
      b: "This field is required",
    })
  })

  it("accepts a missing optional answer and stores nothing for it", () => {
    expect(answersOf([field({})], { f1: "" })).toEqual({})
  })

  it("trims and stores text answers", () => {
    expect(answersOf([field({})], { f1: " Ada " })).toEqual({ f1: "Ada" })
  })

  it("enforces the Field's max length", () => {
    const fields = [field({ maxLength: 3 })]
    expect(errorsOf(fields, { f1: "abcd" }).f1).toMatch(/at most 3/)
    expect(answersOf(fields, { f1: "abc" })).toEqual({ f1: "abc" })
  })

  it("caps any text answer at 10,000 characters", () => {
    const fields = [field({ type: "paragraph" })]
    expect(errorsOf(fields, { f1: "x".repeat(10_001) }).f1).toMatch(/10000/)
    expect(answersOf(fields, { f1: "x".repeat(10_000) })).toHaveProperty("f1")
  })

  it("ignores answers for unknown Fields", () => {
    expect(answersOf([field({})], { f1: "a", ghost: "b" })).toEqual({ f1: "a" })
  })

  it("rejects a non-string text answer", () => {
    expect(errorsOf([field({})], { f1: 5 }).f1).toBeDefined()
  })
})

describe("validateSubmission: number, url, email, switch", () => {
  const num = (over: Partial<PublicField> = {}) =>
    field({ type: "number", ...over })

  it("stores a number (numeric strings from the browser are accepted)", () => {
    expect(answersOf([num()], { f1: "42.5" })).toEqual({ f1: 42.5 })
    expect(answersOf([num()], { f1: 0 })).toEqual({ f1: 0 })
  })

  it("rejects non-numeric input", () => {
    expect(errorsOf([num()], { f1: "abc" }).f1).toMatch(/number/i)
    expect(errorsOf([num()], { f1: "Infinity" }).f1).toMatch(/number/i)
    expect(errorsOf([num()], { f1: "0x10" }).f1).toMatch(/number/i)
    expect(errorsOf([num()], { f1: "0b11" }).f1).toMatch(/number/i)
  })

  it("enforces min and max inclusively", () => {
    const fields = [num({ min: 1, max: 10 })]
    expect(errorsOf(fields, { f1: 0 }).f1).toMatch(/at least 1/)
    expect(errorsOf(fields, { f1: 11 }).f1).toMatch(/at most 10/)
    expect(answersOf(fields, { f1: 1 })).toEqual({ f1: 1 })
    expect(answersOf(fields, { f1: 10 })).toEqual({ f1: 10 })
  })

  it("accepts http(s) URLs only", () => {
    const fields = [field({ type: "url" })]
    expect(answersOf(fields, { f1: "https://example.com/a?b=1" })).toEqual({
      f1: "https://example.com/a?b=1",
    })
    expect(errorsOf(fields, { f1: "not a url" }).f1).toMatch(/URL/)
    expect(errorsOf(fields, { f1: "javascript:alert(1)" }).f1).toMatch(/URL/)
  })

  it("validates Email format", () => {
    const fields = [field({ type: "email" })]
    expect(answersOf(fields, { f1: "a@b.co" })).toEqual({ f1: "a@b.co" })
    expect(errorsOf(fields, { f1: "a@" }).f1).toMatch(/email/i)
  })

  it("caps URL and Email at 10,000 characters", () => {
    const fields = [field({ type: "url" })]
    const long = `https://example.com/${"a".repeat(10_000)}`
    expect(errorsOf(fields, { f1: long }).f1).toMatch(/10000/)
  })

  it("stores a Switch as a boolean; off is a valid answer", () => {
    const fields = [field({ type: "switch" })]
    expect(answersOf(fields, { f1: true })).toEqual({ f1: true })
    expect(answersOf(fields, { f1: false })).toEqual({ f1: false })
    expect(errorsOf(fields, { f1: "yes" }).f1).toBeDefined()
  })

  it("requires a required Switch to be on", () => {
    const fields = [field({ type: "switch", required: true })]
    expect(errorsOf(fields, { f1: false }).f1).toBe("This field is required")
    expect(errorsOf(fields, {}).f1).toBe("This field is required")
    expect(answersOf(fields, { f1: true })).toEqual({ f1: true })
  })
})

describe("validateSubmission: choices", () => {
  const choice = (type: PublicField["type"], over: Partial<PublicField> = {}) =>
    field({ type, options: ["a", "b", "c"], ...over })

  it.each(["radio", "select"] as const)(
    "%s takes exactly one listed option",
    (type) => {
      const fields = [choice(type)]
      expect(answersOf(fields, { f1: "b" })).toEqual({ f1: "b" })
      expect(errorsOf(fields, { f1: "z" }).f1).toMatch(/listed options/)
      expect(errorsOf(fields, { f1: ["a", "b"] }).f1).toBeDefined()
    }
  )

  it.each(["checkbox", "multi_select"] as const)(
    "%s takes many distinct listed options",
    (type) => {
      const fields = [choice(type)]
      expect(answersOf(fields, { f1: ["a", "c"] })).toEqual({ f1: ["a", "c"] })
      expect(answersOf(fields, { f1: "a" })).toEqual({ f1: ["a"] })
      expect(errorsOf(fields, { f1: ["a", "z"] }).f1).toMatch(/listed options/)
      expect(errorsOf(fields, { f1: ["a", "a"] }).f1).toBeDefined()
    }
  )

  it("reports a required many-choice with nothing picked", () => {
    const fields = [choice("checkbox", { required: true })]
    expect(errorsOf(fields, { f1: [] }).f1).toBe("This field is required")
  })
})

describe("validateSubmission: Other option", () => {
  const withOther = (
    type: PublicField["type"],
    over: Partial<PublicField> = {}
  ) => field({ type, options: ["a", "b"], allowOther: true, ...over })
  const key = otherTextKey("f1")

  it.each(["radio", "select"] as const)(
    "%s Other replaces the listed choice and is stored as a distinct value",
    (type) => {
      const fields = [withOther(type)]
      expect(
        answersOf(fields, { f1: OTHER_CHOICE, [key]: "  Pears " })
      ).toEqual({ f1: { other: "Pears" } })
      // typing a listed option's name as Other text stays distinct from it
      expect(answersOf(fields, { f1: OTHER_CHOICE, [key]: "a" })).toEqual({
        f1: { other: "a" },
      })
    }
  )

  it.each(["radio", "select"] as const)(
    "%s rejects Other combined with a listed option",
    (type) => {
      const fields = [withOther(type)]
      expect(
        errorsOf(fields, { f1: ["a", OTHER_CHOICE], [key]: "x" }).f1
      ).toBeDefined()
    }
  )

  it.each(["checkbox", "multi_select"] as const)(
    "%s combines listed options with Other",
    (type) => {
      const fields = [withOther(type)]
      expect(
        answersOf(fields, { f1: ["a", OTHER_CHOICE], [key]: "Pears" })
      ).toEqual({ f1: ["a", { other: "Pears" }] })
      expect(answersOf(fields, { f1: [OTHER_CHOICE], [key]: "Pears" })).toEqual(
        { f1: [{ other: "Pears" }] }
      )
    }
  )

  it.each(["radio", "select", "checkbox", "multi_select"] as const)(
    "%s requires Other text once Other is selected",
    (type) => {
      const fields = [withOther(type)]
      const picked =
        type === "radio" || type === "select" ? OTHER_CHOICE : [OTHER_CHOICE]
      expect(errorsOf(fields, { f1: picked }).f1).toMatch(/other/i)
      expect(errorsOf(fields, { f1: picked, [key]: "   " }).f1).toMatch(
        /other/i
      )
    }
  )

  it("rejects Other when the Field does not allow it", () => {
    const fields = [withOther("radio", { allowOther: false })]
    expect(errorsOf(fields, { f1: OTHER_CHOICE, [key]: "x" }).f1).toMatch(
      /listed options/
    )
  })

  it("applies the text length cap to Other text", () => {
    const fields = [withOther("radio")]
    expect(
      errorsOf(fields, { f1: OTHER_CHOICE, [key]: "x".repeat(10_001) }).f1
    ).toMatch(/at most/)
  })

  it("ignores stray Other text when Other is not selected", () => {
    const fields = [withOther("radio")]
    expect(answersOf(fields, { f1: "a", [key]: "junk" })).toEqual({ f1: "a" })
  })
})

describe("validateSubmission: dates", () => {
  it("accepts a real calendar Date", () => {
    const fields = [field({ type: "date" })]
    expect(answersOf(fields, { f1: "2026-02-28" })).toEqual({
      f1: "2026-02-28",
    })
    expect(errorsOf(fields, { f1: "2026-02-30" }).f1).toMatch(/date/i)
    expect(errorsOf(fields, { f1: "tomorrow" }).f1).toMatch(/date/i)
  })

  it("accepts a Date time as an ISO instant and stores it as UTC", () => {
    const fields = [field({ type: "datetime" })]
    const timezone = "Asia/Kolkata"
    expect(
      answersOf(fields, {
        f1: { instant: "2026-10-20T20:00:00+05:30", timezone },
      })
    ).toEqual({ f1: { instant: "2026-10-20T14:30:00.000Z", timezone } })
  })

  it("rejects an unparseable Date time rather than guessing", () => {
    const fields = [field({ type: "datetime" })]
    const timezone = "Asia/Kolkata"
    expect(
      errorsOf(fields, { f1: { instant: "Tomorrow 8pm", timezone } }).f1
    ).toMatch(/date and time/i)
    // No zone on the instant: ambiguous, so not guessed.
    expect(
      errorsOf(fields, { f1: { instant: "2026-10-20T20:00:00", timezone } }).f1
    ).toBeDefined()
    expect(
      errorsOf(fields, {
        f1: { instant: "2026-10-20T14:30:00Z", timezone: "Mars/Base" },
      }).f1
    ).toBeDefined()
  })

  it("accepts a Date range with end on or after start", () => {
    const fields = [field({ type: "date_range" })]
    const range = (start: string, end: string) => ({ f1: { start, end } })
    expect(answersOf(fields, range("2026-01-01", "2026-01-02"))).toEqual(
      range("2026-01-01", "2026-01-02")
    )
    expect(answersOf(fields, range("2026-01-01", "2026-01-01"))).toEqual(
      range("2026-01-01", "2026-01-01")
    )
    expect(errorsOf(fields, range("2026-01-02", "2026-01-01")).f1).toMatch(
      /on or after/
    )
  })

  it("requires both ends of a Date range", () => {
    const fields = [field({ type: "date_range" })]
    expect(
      errorsOf(fields, { f1: { start: "2026-01-01", end: "" } }).f1
    ).toMatch(/both/i)
    expect(
      errorsOf(fields, { f1: { start: "x", end: "2026-01-01" } }).f1
    ).toMatch(/date/i)
  })

  it("treats an entirely empty Date range as unanswered", () => {
    const fields = [field({ type: "date_range", required: true })]
    expect(errorsOf(fields, { f1: { start: "", end: "" } }).f1).toBe(
      "This field is required"
    )
    expect(
      answersOf([field({ type: "date_range" })], { f1: { start: "", end: "" } })
    ).toEqual({})
  })
})

describe("validateSubmission: snapshot", () => {
  it("records label and type of every Field, answered or not", () => {
    const fields = [
      field({ id: "a", label: "Name" }),
      field({ id: "b", label: "Age", type: "number" }),
    ]
    const result = validateSubmission(fields, { a: "Ada" })
    expect(result).toMatchObject({
      ok: true,
      snapshot: [
        { fieldId: "a", label: "Name", type: "short" },
        { fieldId: "b", label: "Age", type: "number" },
      ],
    })
  })
})
