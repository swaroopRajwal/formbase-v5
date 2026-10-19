import { describe, expect, it } from "vitest"
import { availableAction, generatePublicId, nextStatus } from "./lifecycle"

describe("nextStatus", () => {
  it("allows publish from unpublished and unpublish from published", () => {
    expect(nextStatus("unpublished", "publish")).toBe("published")
    expect(nextStatus("published", "unpublish")).toBe("unpublished")
  })

  it.each([
    ["unpublished", "unpublish"],
    ["published", "publish"],
  ] as const)("rejects %s -> %s", (status, action) => {
    expect(nextStatus(status, action)).toBeNull()
  })
})

describe("generatePublicId", () => {
  it("is a 12-character URL-safe id", () => {
    expect(generatePublicId()).toMatch(/^[A-Za-z0-9]{12}$/)
  })

  it("does not repeat across many calls", () => {
    const ids = new Set(Array.from({ length: 5000 }, generatePublicId))
    expect(ids.size).toBe(5000)
  })
})

describe("availableAction", () => {
  it("offers the single valid action per status", () => {
    expect(availableAction("unpublished")).toEqual({
      action: "publish",
      label: "Publish",
    })
    expect(availableAction("published")).toEqual({
      action: "unpublish",
      label: "Unpublish",
    })
  })
})
