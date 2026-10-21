import { describe, expect, it } from "vitest"
import { diffFields, formVersion } from "./formChange"
import type { PublicField } from "./publicForm"

const field = (over: Partial<PublicField> = {}): PublicField => ({
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

describe("formVersion", () => {
  it("is stable for identical Fields", () => {
    expect(formVersion([field()])).toBe(formVersion([field()]))
  })

  it("changes when a Field is added, removed or edited", () => {
    const base = formVersion([field()])
    expect(formVersion([field(), field({ id: "f2" })])).not.toBe(base)
    expect(formVersion([])).not.toBe(base)
    expect(formVersion([field({ required: true })])).not.toBe(base)
    expect(formVersion([field({ options: ["a"] })])).not.toBe(base)
  })

  it("changes when Fields are reordered", () => {
    const a = field({ id: "a" })
    const b = field({ id: "b" })
    expect(formVersion([a, b])).not.toBe(formVersion([b, a]))
  })
})

describe("diffFields", () => {
  it("reports added and removed Fields by id", () => {
    const kept = field({ id: "keep" })
    const gone = field({ id: "gone" })
    const fresh = field({ id: "fresh", required: true })
    expect(diffFields([kept, gone], [kept, fresh])).toEqual({
      added: [fresh],
      removed: [gone],
    })
  })

  it("reports nothing when only existing Fields were edited", () => {
    expect(diffFields([field()], [field({ label: "Full name" })])).toEqual({
      added: [],
      removed: [],
    })
  })
})
