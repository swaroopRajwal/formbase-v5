import { describe, expect, it } from "vitest"
import { buildColumns, drawerEntries } from "./submissionsTable"

const sub = (
  snapshot: { fieldId: string; label: string; type: "short" }[]
) => ({
  snapshot,
})

describe("buildColumns", () => {
  it("orders columns by the Form's current Fields, then removed Fields", () => {
    const columns = buildColumns(
      [
        sub([
          { fieldId: "gone", label: "Old", type: "short" },
          { fieldId: "b", label: "B", type: "short" },
          { fieldId: "a", label: "A", type: "short" },
        ]),
      ],
      ["a", "b", "new"]
    )
    expect(columns.map((c) => c.fieldId)).toEqual(["a", "b", "gone"])
  })

  it("uses the newest Submission's label and drops Fields nobody answered yet", () => {
    const columns = buildColumns(
      [
        sub([{ fieldId: "a", label: "Renamed", type: "short" }]),
        sub([{ fieldId: "a", label: "Original", type: "short" }]),
      ],
      ["a", "unseen"]
    )
    expect(columns).toEqual([{ fieldId: "a", label: "Renamed", type: "short" }])
  })
})

describe("drawerEntries", () => {
  it("lists the Submission's own snapshot Fields with full untruncated answers and Other labelled", () => {
    const long = "x".repeat(200)
    const entries = drawerEntries({
      snapshot: [
        { fieldId: "a", label: "Name", type: "short" },
        { fieldId: "b", label: "Colours", type: "checkbox" },
        { fieldId: "c", label: "Notes", type: "short" },
      ],
      answers: { a: long, b: ["Red", { other: "Teal" }] },
    })
    expect(entries).toEqual([
      { fieldId: "a", label: "Name", segments: [{ text: long, other: false }] },
      {
        fieldId: "b",
        label: "Colours",
        segments: [
          { text: "Red", other: false },
          { text: "Teal", other: true },
        ],
      },
      { fieldId: "c", label: "Notes", segments: [] },
    ])
  })
})
