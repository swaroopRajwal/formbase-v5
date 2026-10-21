import type { PublicField } from "./publicForm"
import { HONEYPOT_FIELD } from "./spamGuard"
import { otherTextKey } from "./submission"

// Reads a browser form into the raw per-Field values the server validates.
// Values are sent as entered; the server is the only judge of validity.
export const collectAnswers = (
  fields: PublicField[],
  data: FormData
): Record<string, unknown> => {
  const answers: Record<string, unknown> = {
    [HONEYPOT_FIELD]: data.get(HONEYPOT_FIELD) ?? "",
  }
  for (const f of fields) {
    switch (f.type) {
      case "switch":
        answers[f.id] = data.get(f.id) !== null
        break
      case "checkbox":
      case "multi_select":
        answers[f.id] = data.getAll(f.id)
        answers[otherTextKey(f.id)] = data.get(otherTextKey(f.id)) ?? ""
        break
      case "date_range":
        answers[f.id] = {
          start: data.get(`${f.id}.start`) ?? "",
          end: data.get(`${f.id}.end`) ?? "",
        }
        break
      case "datetime":
        answers[f.id] = {
          instant: data.get(f.id) ?? "",
          timezone: data.get(`${f.id}.timezone`) ?? "",
        }
        break
      case "radio":
      case "select":
        answers[f.id] = data.get(f.id) ?? ""
        answers[otherTextKey(f.id)] = data.get(otherTextKey(f.id)) ?? ""
        break
      default:
        answers[f.id] = data.get(f.id) ?? ""
    }
  }
  return answers
}
