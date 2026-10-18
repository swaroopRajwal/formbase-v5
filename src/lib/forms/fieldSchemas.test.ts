import { describe, expect, it } from "vitest"
import {
  MAX_FIELDS_PER_FORM,
  MAX_OPTIONS_PER_FIELD,
  MAX_TEXT_ANSWER_LENGTH,
  fieldSchema,
  formDraftSchema,
} from "./fieldSchemas"

const base = { label: "Name", helperText: "", required: false }
const options = ["A", "B"]

describe("fieldSchema", () => {
  it("accepts a minimal valid field of every type", () => {
    const valid = [
      { type: "short" },
      { type: "paragraph" },
      { type: "number" },
      { type: "url" },
      { type: "email" },
      { type: "radio", options },
      { type: "checkbox", options },
      { type: "switch" },
      { type: "select", options },
      { type: "multi_select", options },
      { type: "date" },
      { type: "datetime" },
      { type: "date_range" },
    ]
    for (const f of valid) {
      expect(fieldSchema.safeParse({ ...base, ...f }).success, f.type).toBe(
        true
      )
    }
  })

  it("rejects unknown types and empty labels", () => {
    expect(fieldSchema.safeParse({ ...base, type: "rating" }).success).toBe(
      false
    )
    expect(
      fieldSchema.safeParse({ ...base, label: "", type: "short" }).success
    ).toBe(false)
  })

  it.each(["radio", "checkbox", "switch", "date_range"])(
    "rejects a placeholder on %s",
    (type) => {
      const extra = type === "radio" || type === "checkbox" ? { options } : {}
      expect(
        fieldSchema.safeParse({ ...base, type, ...extra, placeholder: "x" })
          .success
      ).toBe(false)
    }
  )

  it.each([
    "short",
    "paragraph",
    "number",
    "url",
    "email",
    "select",
    "multi_select",
    "date",
    "datetime",
  ])("allows a placeholder on %s", (type) => {
    const extra =
      type === "select" || type === "multi_select" ? { options } : {}
    expect(
      fieldSchema.safeParse({ ...base, type, ...extra, placeholder: "x" })
        .success
    ).toBe(true)
  })

  describe("number", () => {
    it("rejects min > max but allows min == max", () => {
      expect(
        fieldSchema.safeParse({ ...base, type: "number", min: 5, max: 1 })
          .success
      ).toBe(false)
      expect(
        fieldSchema.safeParse({ ...base, type: "number", min: 3, max: 3 })
          .success
      ).toBe(true)
    })
    it("allows open-ended bounds", () => {
      expect(
        fieldSchema.safeParse({ ...base, type: "number", min: 0 }).success
      ).toBe(true)
      expect(
        fieldSchema.safeParse({ ...base, type: "number", max: 0 }).success
      ).toBe(true)
    })
  })

  describe("text max length", () => {
    it.each(["short", "paragraph"])(
      "bounds %s maxLength to 1..10,000",
      (type) => {
        const ok = (maxLength: number) =>
          fieldSchema.safeParse({ ...base, type, maxLength }).success
        expect(ok(1)).toBe(true)
        expect(ok(MAX_TEXT_ANSWER_LENGTH)).toBe(true)
        expect(ok(0)).toBe(false)
        expect(ok(MAX_TEXT_ANSWER_LENGTH + 1)).toBe(false)
        expect(ok(1.5)).toBe(false)
      }
    )
    it("rejects maxLength on non-text types", () => {
      expect(
        fieldSchema.safeParse({ ...base, type: "email", maxLength: 10 }).success
      ).toBe(false)
    })
  })

  describe("choice fields", () => {
    it.each(["radio", "checkbox", "select", "multi_select"])(
      "%s requires 1..100 options",
      (type) => {
        const ok = (opts: string[]) =>
          fieldSchema.safeParse({ ...base, type, options: opts }).success
        expect(ok([])).toBe(false)
        expect(ok(["A"])).toBe(true)
        expect(
          ok(Array.from({ length: MAX_OPTIONS_PER_FIELD }, (_, i) => `o${i}`))
        ).toBe(true)
        expect(
          ok(
            Array.from({ length: MAX_OPTIONS_PER_FIELD + 1 }, (_, i) => `o${i}`)
          )
        ).toBe(false)
      }
    )
    it("rejects blank and duplicate options", () => {
      expect(
        fieldSchema.safeParse({ ...base, type: "radio", options: ["A", " "] })
          .success
      ).toBe(false)
      expect(
        fieldSchema.safeParse({ ...base, type: "radio", options: ["A", "A"] })
          .success
      ).toBe(false)
    })
    it("treats options as duplicates case-insensitively", () => {
      expect(
        fieldSchema.safeParse({
          ...base,
          type: "radio",
          options: ["Yes", "yes"],
        }).success
      ).toBe(false)
    })
    it("limits option length to 200", () => {
      const ok = (n: number) =>
        fieldSchema.safeParse({
          ...base,
          type: "radio",
          options: ["a".repeat(n)],
        }).success
      expect(ok(200)).toBe(true)
      expect(ok(201)).toBe(false)
    })
    it("supports allowOther, defaulting to false", () => {
      const r = fieldSchema.parse({ ...base, type: "radio", options })
      expect(r).toMatchObject({ allowOther: false })
      expect(
        fieldSchema.safeParse({
          ...base,
          type: "radio",
          options,
          allowOther: true,
        }).success
      ).toBe(true)
    })
    it("rejects options and allowOther on non-choice types", () => {
      expect(
        fieldSchema.safeParse({ ...base, type: "short", options }).success
      ).toBe(false)
      expect(
        fieldSchema.safeParse({ ...base, type: "switch", allowOther: true })
          .success
      ).toBe(false)
    })
  })

  it("rejects whitespace-only labels and over-long text", () => {
    expect(
      fieldSchema.safeParse({ ...base, label: "   ", type: "short" }).success
    ).toBe(false)
    expect(
      fieldSchema.safeParse({ ...base, label: "a".repeat(201), type: "short" })
        .success
    ).toBe(false)
    expect(
      fieldSchema.safeParse({
        ...base,
        helperText: "a".repeat(1001),
        type: "short",
      }).success
    ).toBe(false)
  })

  it("rejects non-finite number bounds", () => {
    expect(
      fieldSchema.safeParse({ ...base, type: "number", min: Infinity }).success
    ).toBe(false)
  })

  it("rejects min/max on non-number types", () => {
    expect(
      fieldSchema.safeParse({ ...base, type: "short", min: 1 }).success
    ).toBe(false)
  })
})

describe("formDraftSchema", () => {
  const field = { ...base, type: "short" }
  it("accepts up to 100 fields and rejects 101", () => {
    const make = (n: number) => ({
      title: "T",
      fields: Array.from({ length: n }, () => field),
    })
    expect(formDraftSchema.safeParse(make(MAX_FIELDS_PER_FORM)).success).toBe(
      true
    )
    expect(
      formDraftSchema.safeParse(make(MAX_FIELDS_PER_FORM + 1)).success
    ).toBe(false)
  })
  it("requires a title", () => {
    expect(formDraftSchema.safeParse({ title: "", fields: [] }).success).toBe(
      false
    )
  })
})
