import { describe, expect, it } from "vitest"
import { buildCsv } from "./submissionsCsv"

const columns = [
  { fieldId: "a", label: "Name", type: "short" as const },
  { fieldId: "b", label: "Color", type: "select" as const },
]

describe("buildCsv", () => {
  it("writes a header row and one row per Submission, Submitted as UTC ISO", () => {
    const csv = buildCsv(columns, [
      {
        createdAt: "2026-01-02T03:04:05.000Z",
        answers: { a: "Ada", b: "Red" },
      },
    ])
    expect(csv).toBe(
      "Submitted (UTC ISO 8601),Name,Color\r\n2026-01-02T03:04:05.000Z,Ada,Red\r\n"
    )
  })

  it("quotes commas, quotes and newlines", () => {
    const csv = buildCsv(columns, [
      { createdAt: "2026-01-02T03:04:05.000Z", answers: { a: 'a,"b"\nc' } },
    ])
    expect(csv).toContain(',"a,""b""\nc",\r\n')
  })

  it("marks Other answers and leaves unanswered Fields empty", () => {
    const csv = buildCsv(columns, [
      {
        createdAt: "2026-01-02T03:04:05.000Z",
        answers: { b: { other: "Teal" } },
      },
    ])
    expect(csv).toContain(",,Other: Teal\r\n")
  })

  it("states Date time answers with their timezone", () => {
    const csv = buildCsv(
      [{ fieldId: "d", label: "When", type: "datetime" as const }],
      [
        {
          createdAt: "2026-01-02T03:04:05.000Z",
          answers: {
            d: {
              instant: "2026-06-01T12:00:00.000Z",
              timezone: "Asia/Kolkata",
            },
          },
        },
      ]
    )
    expect(csv).toContain("2026-06-01 17:30 (Asia/Kolkata)")
  })

  it("guards against formula injection", () => {
    const csv = buildCsv(columns, [
      { createdAt: "2026-01-02T03:04:05.000Z", answers: { a: "=1+1", b: "@x" } },
    ])
    expect(csv).toContain(",'=1+1,'@x\r\n")
  })

  it("keeps a listed option 'Other: x' distinct from an Other answer", () => {
    const csv = buildCsv(columns, [
      { createdAt: "t1", answers: { b: "Other: x" } },
      { createdAt: "t2", answers: { b: { other: "x" } } },
    ])
    expect(csv).toContain("t1,,\\Other: x\r\n")
    expect(csv).toContain("t2,,Other: x\r\n")
  })

  it("formats each Submission with its own snapshot's Field type", () => {
    const csv = buildCsv(
      [{ fieldId: "d", label: "When", type: "datetime" as const }],
      [
        {
          createdAt: "t",
          answers: { d: "plain" },
          snapshot: [{ fieldId: "d", label: "When", type: "short" as const }],
        },
      ]
    )
    expect(csv).toContain("t,plain\r\n")
  })

  it("states the Date time format in the column header", () => {
    const csv = buildCsv(
      [{ fieldId: "d", label: "When", type: "datetime" as const }],
      []
    )
    expect(csv).toContain("When (YYYY-MM-DD HH:mm (timezone))")
  })
})
