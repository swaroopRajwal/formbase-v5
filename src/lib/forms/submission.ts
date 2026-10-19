import { z } from "zod"
import { MAX_TEXT_ANSWER_LENGTH, type FieldType } from "./fieldSchemas"
import type { PublicField } from "./publicForm"

export type DateRangeAnswer = { start: string; end: string }
export type AnswerValue = string | number | boolean | string[] | DateRangeAnswer

// Label and type of every Field as they were when the Respondent submitted,
// so later Form edits never change what an old Submission means.
export type SnapshotField = { fieldId: string; label: string; type: FieldType }

export type SubmissionResult =
  | {
      ok: true
      answers: Record<string, AnswerValue>
      snapshot: SnapshotField[]
    }
  | { ok: false; errors: Record<string, string> }

type FieldCheck = { value: AnswerValue } | { error: string }

const REQUIRED = "This field is required"

const isRecord = (raw: unknown): raw is Record<string, unknown> =>
  typeof raw === "object" && raw !== null && !Array.isArray(raw)

const isBlank = (raw: unknown) => typeof raw === "string" && raw.trim() === ""

const isEmpty = (raw: unknown) =>
  raw === undefined ||
  raw === null ||
  isBlank(raw) ||
  (Array.isArray(raw) && raw.length === 0) ||
  (isRecord(raw) && Object.values(raw).every((v) => v == null || isBlank(v)))

const checkText = (f: PublicField, raw: unknown): FieldCheck => {
  if (typeof raw !== "string") return { error: "Enter text" }
  const value = raw.trim()
  const limit = Math.min(f.maxLength ?? Infinity, MAX_TEXT_ANSWER_LENGTH)
  if (value.length > limit) return { error: `Use at most ${limit} characters` }
  return { value }
}

// Plain decimals only (what a number input produces), not 0x10 or 0b11.
const DECIMAL_RE = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/

const checkNumber = (f: PublicField, raw: unknown): FieldCheck => {
  const value =
    typeof raw === "number"
      ? raw
      : typeof raw === "string" && DECIMAL_RE.test(raw.trim())
        ? Number(raw.trim())
        : NaN
  if (!Number.isFinite(value)) return { error: "Enter a valid number" }
  if (f.min !== undefined && value < f.min)
    return { error: `Must be at least ${f.min}` }
  if (f.max !== undefined && value > f.max)
    return { error: `Must be at most ${f.max}` }
  return { value }
}

const checkUrl = (f: PublicField, raw: unknown): FieldCheck => {
  const text = checkText({ ...f, maxLength: undefined }, raw)
  if ("error" in text) return text
  try {
    const { protocol } = new URL(text.value as string)
    if (protocol === "http:" || protocol === "https:") return text
  } catch {
    // falls through to the error below
  }
  return { error: "Enter a valid URL starting with http:// or https://" }
}

const checkEmail = (f: PublicField, raw: unknown): FieldCheck => {
  const text = checkText({ ...f, maxLength: undefined }, raw)
  if ("error" in text) return text
  if (!z.email().safeParse(text.value).success)
    return { error: "Enter a valid email address" }
  return text
}

const checkSwitch = (f: PublicField, raw: unknown): FieldCheck => {
  if (typeof raw !== "boolean") return { error: "Choose on or off" }
  // A required Switch is a "must be on" consent-style toggle.
  if (f.required && !raw) return { error: REQUIRED }
  return { value: raw }
}

const LISTED = "Choose from the listed options"

const checkOne = (f: PublicField, raw: unknown): FieldCheck => {
  if (typeof raw !== "string" || !f.options.includes(raw))
    return { error: LISTED }
  return { value: raw }
}

const checkMany = (f: PublicField, raw: unknown): FieldCheck => {
  const picked = typeof raw === "string" ? [raw] : raw
  if (!Array.isArray(picked) || picked.some((v) => typeof v !== "string"))
    return { error: LISTED }
  if (picked.some((v) => !f.options.includes(v))) return { error: LISTED }
  if (new Set(picked).size !== picked.length)
    return { error: "Each option can only be chosen once" }
  return { value: picked as string[] }
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

const isCalendarDate = (value: unknown): value is string => {
  if (typeof value !== "string") return false
  const m = DATE_RE.exec(value)
  if (!m) return false
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const date = new Date(Date.UTC(y, mo - 1, d))
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === mo - 1 &&
    date.getUTCDate() === d
  )
}

const checkDate = (_f: PublicField, raw: unknown): FieldCheck =>
  isCalendarDate(raw) ? { value: raw } : { error: "Enter a valid date" }

// Natural-language entry ("Tomorrow 8pm") is a later ticket; until then only
// an unambiguous ISO 8601 instant with a zone is accepted, never guessed.
const ISO_INSTANT_RE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/

const checkDateTime = (_f: PublicField, raw: unknown): FieldCheck => {
  const time =
    typeof raw === "string" && ISO_INSTANT_RE.test(raw.trim())
      ? Date.parse(raw.trim())
      : NaN
  if (Number.isNaN(time)) return { error: "Enter a valid date and time" }
  return { value: new Date(time).toISOString() }
}

const checkDateRange = (_f: PublicField, raw: unknown): FieldCheck => {
  if (!isRecord(raw)) return { error: "Enter a start and end date" }
  const { start, end } = raw
  if (isBlank(start) || isBlank(end) || start == null || end == null)
    return { error: "Enter both a start and an end date" }
  if (!isCalendarDate(start) || !isCalendarDate(end))
    return { error: "Enter valid dates" }
  // ISO dates sort lexicographically; same-day ranges are valid.
  if (end < start) return { error: "End date must be on or after the start" }
  return { value: { start, end } }
}

const checkers: Record<
  FieldType,
  (f: PublicField, raw: unknown) => FieldCheck
> = {
  short: checkText,
  paragraph: checkText,
  number: checkNumber,
  url: checkUrl,
  email: checkEmail,
  radio: checkOne,
  checkbox: checkMany,
  switch: checkSwitch,
  select: checkOne,
  multi_select: checkMany,
  date: checkDate,
  datetime: checkDateTime,
  date_range: checkDateRange,
}

export const validateSubmission = (
  fields: PublicField[],
  raw: Record<string, unknown>
): SubmissionResult => {
  const answers: Record<string, AnswerValue> = {}
  const errors: Record<string, string> = {}
  for (const f of fields) {
    const input = raw[f.id]
    if (isEmpty(input)) {
      if (f.required) errors[f.id] = REQUIRED
      continue
    }
    const checked = checkers[f.type](f, input)
    if ("error" in checked) errors[f.id] = checked.error
    else answers[f.id] = checked.value
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return {
    ok: true,
    answers,
    snapshot: fields.map((f) => ({
      fieldId: f.id,
      label: f.label,
      type: f.type,
    })),
  }
}
