import type { PublicField } from "./publicForm"

// Identifies the Fields a Respondent was shown. Computed on both sides, so the
// server can tell the Form changed between load and submit (FNV-1a over JSON).
export const formVersion = (fields: PublicField[]): string => {
  const json = JSON.stringify(fields)
  let hash = 0x811c9dc5
  for (let i = 0; i < json.length; i++) {
    hash ^= json.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16)
}

// Which Fields appeared or disappeared, matched by id.
export const diffFields = (before: PublicField[], after: PublicField[]) => {
  const beforeIds = new Set(before.map((f) => f.id))
  const afterIds = new Set(after.map((f) => f.id))
  return {
    added: after.filter((f) => !beforeIds.has(f.id)),
    removed: before.filter((f) => !afterIds.has(f.id)),
  }
}
