import { describe, expect, it } from "vitest"
import { toPublicForm } from "./publicForm"

const formRow = {
  id: "form-1",
  userId: "creator-1",
  title: "Feedback",
  description: "Tell us",
  status: "published" as const,
  publicId: "abc123",
}

const fieldRow = (over: Record<string, unknown>) => ({
  id: "f1",
  formId: "form-1",
  type: "short" as const,
  label: "Name",
  helperText: "",
  required: false,
  placeholder: null,
  options: null,
  allowOther: false,
  settings: {},
  position: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...over,
})

describe("toPublicForm", () => {
  it("returns null for an Unpublished Form", () => {
    expect(
      toPublicForm({ ...formRow, status: "unpublished" }, [fieldRow({})])
    ).toBeNull()
  })

  it("exposes only what a Respondent needs, never the Creator", () => {
    const result = toPublicForm(formRow, [
      fieldRow({
        type: "number",
        label: "Age",
        helperText: "Years",
        required: true,
        placeholder: "18",
        settings: { min: 0, max: 120 },
      }),
    ])
    expect(result).toEqual({
      title: "Feedback",
      description: "Tell us",
      fields: [
        {
          id: "f1",
          type: "number",
          label: "Age",
          helperText: "Years",
          required: true,
          placeholder: "18",
          options: [],
          allowOther: false,
          min: 0,
          max: 120,
          maxLength: undefined,
        },
      ],
    })
    expect(JSON.stringify(result)).not.toContain("creator-1")
  })

  it("orders Fields by position and keeps choice options", () => {
    const result = toPublicForm(formRow, [
      fieldRow({ id: "b", position: 1, label: "B" }),
      fieldRow({
        id: "a",
        position: 0,
        type: "radio",
        label: "A",
        options: ["x", "y"],
        allowOther: true,
      }),
    ])
    expect(result?.fields.map((f) => f.id)).toEqual(["a", "b"])
    expect(result?.fields[0]).toMatchObject({
      options: ["x", "y"],
      allowOther: true,
    })
  })
})
