import type { PublicField } from "./publicForm"

// Reads a browser form into the raw per-Field values the server validates.
// Values are sent as entered; the server is the only judge of validity.
export const collectAnswers = (
  fields: PublicField[],
  data: FormData
): Record<string, unknown> => {
  const answers: Record<string, unknown> = {}
  for (const f of fields) {
    switch (f.type) {
      case "switch":
        answers[f.id] = data.get(f.id) !== null
        break
      case "checkbox":
      case "multi_select":
        answers[f.id] = data.getAll(f.id)
        break
      case "date_range":
        answers[f.id] = {
          start: data.get(`${f.id}.start`) ?? "",
          end: data.get(`${f.id}.end`) ?? "",
        }
        break
      default:
        answers[f.id] = data.get(f.id) ?? ""
    }
  }
  return answers
}
