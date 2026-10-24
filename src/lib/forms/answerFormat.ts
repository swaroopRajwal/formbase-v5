import type { FieldType } from "./fieldSchemas"
import type {
  AnswerValue,
  DateRangeAnswer,
  DateTimeAnswer,
  OtherAnswer,
  SnapshotField,
} from "./submission"

// One displayed piece of an answer. `other` marks a Respondent's free-text
// Other answer so it stays distinguishable from a listed option.
export type AnswerSegment = { text: string; other: boolean }

const isOther = (v: unknown): v is OtherAnswer =>
  typeof v === "object" && v !== null && "other" in v

const pad = (n: number) => String(n).padStart(2, "0")

const formatDateTime = ({ instant, timezone }: DateTimeAnswer) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
      .formatToParts(new Date(instant))
      .map((p) => [p.type, p.value])
  )
  return `${parts.year}-${parts.month}-${parts.day} ${pad(Number(parts.hour))}:${parts.minute} (${timezone})`
}

// Splits a stored answer into display segments. Shared by the table, the
// drawer and the CSV export.
export const formatAnswer = (
  type: FieldType,
  value: AnswerValue | undefined
): AnswerSegment[] => {
  if (value === undefined) return []
  const plain = (text: string) => [{ text, other: false }]
  if (Array.isArray(value))
    return value.map((v) =>
      isOther(v) ? { text: v.other, other: true } : { text: v, other: false }
    )
  if (typeof value === "boolean") return plain(value ? "Yes" : "No")
  if (typeof value === "object") {
    if (isOther(value)) return [{ text: value.other, other: true }]
    if (type === "datetime")
      return plain(formatDateTime(value as DateTimeAnswer))
    const range = value as DateRangeAnswer
    return plain(`${range.start} – ${range.end}`)
  }
  return plain(String(value))
}

// Plain-text form of an answer; Other answers are prefixed "Other: ".
export const answerText = (
  type: FieldType,
  value: AnswerValue | undefined
): string =>
  formatAnswer(type, value)
    .map((s) => (s.other ? `Other: ${s.text}` : s.text))
    .join(", ")

export const truncate = (text: string, max: number) =>
  text.length <= max ? text : `${text.slice(0, max - 1)}…`

// Submission timestamp in a fixed, locale-independent format: "YYYY-MM-DD HH:mm UTC".
export const formatSubmitted = (iso: string) =>
  `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`

// A Submission is read with the Field type from its own snapshot when it has
// one, since a Field's type can change between Submissions.
export const answerType = (
  fieldId: string,
  fallback: FieldType,
  snapshot?: SnapshotField[]
): FieldType => snapshot?.find((f) => f.fieldId === fieldId)?.type ?? fallback

// Cuts a cell's segments to `max` characters in total (text only, ", "
// separators between segments not counted), appending an ellipsis on the last
// kept segment.
export const truncateSegments = (
  segments: AnswerSegment[],
  max: number
): AnswerSegment[] => {
  const out: AnswerSegment[] = []
  let left = max
  for (const seg of segments) {
    if (left <= 0) break
    out.push({ ...seg, text: truncate(seg.text, left) })
    left -= seg.text.length
    if (left < 0) break
  }
  return out
}
