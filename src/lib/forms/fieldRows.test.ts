import { describe, expect, it } from "vitest"
import { fieldSchema } from "./fieldSchemas"
import { fieldToRow, rowToEditorField } from "./fieldRows"
import { toFieldInput } from "./editorModel"

describe("fieldToRow", () => {
  it("stores type-specific validation in settings", () => {
    const field = fieldSchema.parse({
      type: "number",
      label: "Age",
      min: 0,
      max: 120,
      placeholder: "18",
    })
    expect(fieldToRow(field, "f1", 3)).toEqual({
      formId: "f1",
      position: 3,
      type: "number",
      label: "Age",
      helperText: "",
      required: false,
      placeholder: "18",
      options: null,
      allowOther: false,
      settings: { min: 0, max: 120 },
    })
  })

  it("stores options and allowOther for choice fields", () => {
    const field = fieldSchema.parse({
      type: "select",
      label: "Colour",
      options: ["Red", "Blue"],
      allowOther: true,
    })
    expect(fieldToRow(field, "f1", 0)).toMatchObject({
      placeholder: null,
      options: ["Red", "Blue"],
      allowOther: true,
      settings: {},
    })
  })
})

describe("rowToEditorField", () => {
  it("round-trips every stored setting back into the editor", () => {
    const originals = [
      { type: "short", label: "Name", maxLength: 50, placeholder: "Ada" },
      { type: "number", label: "Age", min: 1, max: 9 },
      {
        type: "multi_select",
        label: "Pick",
        options: ["a", "b"],
        allowOther: true,
      },
      { type: "switch", label: "Agree", required: true },
      { type: "date_range", label: "Stay", helperText: "Dates" },
    ]
    for (const raw of originals) {
      const field = fieldSchema.parse(raw)
      const r = fieldToRow(field, "f1", 0)
      const row = {
        ...r,
        id: "row1",
        options: r.options ?? null,
        placeholder: r.placeholder ?? null,
        settings: r.settings ?? {},
        helperText: r.helperText ?? "",
        required: r.required ?? false,
        allowOther: r.allowOther ?? false,
      }
      const editor = rowToEditorField(row)
      expect(editor.id).toBe("row1")
      expect(fieldSchema.parse(toFieldInput(editor)), raw.type).toEqual(field)
    }
  })
})
