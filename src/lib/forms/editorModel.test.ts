import { describe, expect, it } from "vitest"
import { FIELD_TYPES, fieldSchema } from "./fieldSchemas"
import {
  SETTINGS_BY_TYPE,
  blankField,
  dropIndexFor,
  invalidFieldIndexes,
  selectionAfterRemove,
  toFieldInput,
  validateEditor,
  type EditorField,
} from "./editorModel"

const labelled = (f: EditorField): EditorField => ({
  ...f,
  label: "Question",
  options: f.options.map((_, i) => ({ value: `Option ${i + 1}` })),
})

describe("blankField", () => {
  it("is valid for every type once labelled", () => {
    for (const type of FIELD_TYPES) {
      const input = toFieldInput(labelled(blankField(type)))
      expect(fieldSchema.safeParse(input).success, type).toBe(true)
    }
  })

  it("starts choice fields with options and nothing else with options", () => {
    expect(blankField("radio").options.length).toBeGreaterThan(0)
    expect(blankField("select").options.length).toBeGreaterThan(0)
    expect(blankField("short").options).toEqual([])
  })
})

describe("toFieldInput", () => {
  it("drops settings that do not apply to the type", () => {
    const stale: EditorField = {
      ...labelled(blankField("switch")),
      placeholder: "left over",
      maxLength: "5",
      min: "1",
      options: [{ value: "x" }],
      allowOther: true,
    }
    expect(toFieldInput(stale)).toEqual({
      type: "switch",
      label: "Question",
      helperText: "",
      required: false,
    })
  })

  it("converts numeric strings and omits blank optional settings", () => {
    const f: EditorField = {
      ...labelled(blankField("number")),
      min: "1",
      max: "",
      placeholder: "",
    }
    const input = toFieldInput(f)
    expect(input).toMatchObject({ type: "number", min: 1 })
    expect(input).not.toHaveProperty("max")
    expect(input).not.toHaveProperty("placeholder")
  })

  it("keeps options and allowOther for choice fields", () => {
    const f = { ...labelled(blankField("checkbox")), allowOther: true }
    expect(toFieldInput(f)).toMatchObject({
      type: "checkbox",
      options: ["Option 1", "Option 2"],
      allowOther: true,
    })
    expect(toFieldInput(f)).not.toHaveProperty("placeholder")
  })
})

describe("SETTINGS_BY_TYPE", () => {
  it("matches the spec's placeholder rule", () => {
    const withPlaceholder = FIELD_TYPES.filter((t) =>
      SETTINGS_BY_TYPE[t].includes("placeholder")
    )
    expect(withPlaceholder.sort()).toEqual(
      [
        "short",
        "paragraph",
        "number",
        "url",
        "email",
        "select",
        "multi_select",
        "date",
        "datetime",
      ].sort()
    )
  })

  it("gives only the right types their validation settings", () => {
    expect(SETTINGS_BY_TYPE.number).toEqual(
      expect.arrayContaining(["min", "max"])
    )
    expect(SETTINGS_BY_TYPE.short).toContain("maxLength")
    expect(SETTINGS_BY_TYPE.paragraph).toContain("maxLength")
    expect(SETTINGS_BY_TYPE.email).not.toContain("maxLength")
    expect(SETTINGS_BY_TYPE.radio).toEqual(
      expect.arrayContaining(["options", "allowOther"])
    )
    expect(SETTINGS_BY_TYPE.switch).toEqual([])
  })
})

describe("validateEditor", () => {
  const values = (fields: EditorField[]) => ({
    title: "My form",
    description: "",
    fields,
  })

  it("returns the draft with ids kept for existing fields", () => {
    const result = validateEditor(
      values([{ ...labelled(blankField("short")), id: "abc" }])
    )
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.fields[0]).toMatchObject({
        id: "abc",
        field: { type: "short", label: "Question" },
      })
    }
  })

  it("maps errors to react-hook-form paths", () => {
    const result = validateEditor(
      values([
        blankField("short"),
        {
          ...labelled(blankField("number")),
          min: "10",
          max: "2",
        },
        {
          ...labelled(blankField("radio")),
          options: [{ value: "A" }, { value: "" }],
        },
        {
          ...labelled(blankField("select")),
          options: [{ value: "A" }, { value: "a" }],
        },
      ])
    )
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors["fields.0.label"]).toBe("Label is required")
      expect(result.errors["fields.1.min"]).toBeTruthy()
      expect(result.errors["fields.2.options.1.value"]).toBeTruthy()
      expect(result.errors["fields.3.options"]).toBe("Options must be unique")
    }
  })

  it("rejects a blank title and more than 100 fields", () => {
    const many = Array.from({ length: 101 }, () =>
      labelled(blankField("short"))
    )
    const result = validateEditor({ ...values(many), title: " " })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors["title"]).toBeTruthy()
      expect(result.errors["fields"]).toBeTruthy()
    }
  })
})

describe("selectionAfterRemove", () => {
  const keys = ["a", "b", "c"]

  it("selects the next neighbour", () => {
    expect(selectionAfterRemove(keys, 0)).toBe("b")
    expect(selectionAfterRemove(keys, 1)).toBe("c")
  })

  it("falls back to the previous neighbour for the last Field", () => {
    expect(selectionAfterRemove(keys, 2)).toBe("b")
  })

  it("selects nothing when the only Field is removed", () => {
    expect(selectionAfterRemove(["a"], 0)).toBeNull()
  })
})

describe("invalidFieldIndexes", () => {
  it("returns the indexes of Fields with errors", () => {
    const errors = [undefined, { label: {} }, undefined, { options: {} }]
    expect(invalidFieldIndexes(errors)).toEqual([1, 3])
  })

  it("returns none when there are no field errors", () => {
    expect(invalidFieldIndexes(undefined)).toEqual([])
    expect(invalidFieldIndexes({ root: {} })).toEqual([])
  })
})

describe("dropIndexFor", () => {
  it("inserts before the card when the pointer is in its top half", () => {
    expect(dropIndexFor(2, 110, 100, 100)).toBe(2)
  })

  it("inserts after the card when the pointer is in its bottom half", () => {
    expect(dropIndexFor(2, 160, 100, 100)).toBe(3)
  })
})
