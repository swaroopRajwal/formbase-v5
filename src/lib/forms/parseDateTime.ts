import * as chrono from "chrono-node"

export type ParsedDateTime = { instant: string; timezone: string }

export const browserTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone

// Interprets natural language ("Tomorrow 8pm") in the runtime's local zone,
// which in the browser is the Respondent's. Returns null rather than guessing:
// text that isn't wholly a date, or that gives no time of day, is rejected.
export const parseDateTime = (
  text: string,
  now: Date = new Date()
): ParsedDateTime | null => {
  const input = text.trim()
  const [result] = chrono.parse(input, now, { forwardDate: true })
  if (!result || result.text !== input) return null
  if (!result.start.isCertain("hour")) return null
  const date = result.date()
  if (Number.isNaN(date.getTime())) return null
  return { instant: date.toISOString(), timezone: browserTimeZone() }
}
