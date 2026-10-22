import { answerType, formatAnswer } from "./answerFormat"
import type { AnswerValue, SnapshotField } from "./submission"

export const CSV_BOM = "﻿"

// Cells starting with these are read as formulas by spreadsheets.
const cell = (raw: string) => {
  const text = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

// Other answers are written "Other: x". A listed option that itself starts
// with "Other: " (or a backslash) gets a leading backslash so the two can
// never collide.
const answerCell = (
  type: SnapshotField["type"],
  value: AnswerValue | undefined
) =>
  formatAnswer(type, value)
    .map((s) =>
      s.other
        ? `Other: ${s.text}`
        : /^(Other: |\\)/.test(s.text)
          ? `\\${s.text}`
          : s.text
    )
    .join(", ")

const header = (c: SnapshotField) =>
  c.type === "datetime" ? `${c.label} (YYYY-MM-DD HH:mm (timezone))` : c.label

export const CSV_FORMAT_NOTE =
  "Submitted is UTC ISO 8601. Date time answers read YYYY-MM-DD HH:mm (timezone). Other answers read Other: <text>; a listed option starting with Other: or a backslash gets a leading backslash."

// CSV of all Submissions (newest first, as given). Each Submission's answers
// are formatted with its own snapshot's Field types when present. Prefix the
// download with CSV_BOM so Excel reads UTF-8.
export const buildCsv = (
  columns: SnapshotField[],
  submissions: {
    createdAt: string
    answers: Record<string, AnswerValue>
    snapshot?: SnapshotField[]
  }[]
): string =>
  [
    ["Submitted (UTC ISO 8601)", ...columns.map(header)],
    ...submissions.map((s) => [
      s.createdAt,
      ...columns.map((c) =>
        answerCell(
          answerType(c.fieldId, c.type, s.snapshot),
          s.answers[c.fieldId]
        )
      ),
    ]),
  ]
    .map((row) => row.map(cell).join(",") + "\r\n")
    .join("")
