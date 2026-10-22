import type { AnswerValue, SnapshotField } from "./submission"
import { formatAnswer } from "./answerFormat"

// One column per Field that appears in any Submission's snapshot. Submissions
// must be newest first: the newest snapshot supplies the label. Fields still
// on the Form come first in Form order, removed Fields follow.
export const buildColumns = (
  submissions: { snapshot: SnapshotField[] }[],
  currentFieldIds: string[]
): SnapshotField[] => {
  const seen = new Map<string, SnapshotField>()
  for (const s of submissions)
    for (const f of s.snapshot) if (!seen.has(f.fieldId)) seen.set(f.fieldId, f)
  const current = currentFieldIds.flatMap((id) => seen.get(id) ?? [])
  const kept = new Set(currentFieldIds)
  const removed = [...seen.values()].filter((f) => !kept.has(f.fieldId))
  return [...current, ...removed]
}

// Full, untruncated answers for the drawer, in the Submission's own snapshot
// order and labels. Unanswered Fields have empty segments.
export const drawerEntries = (submission: {
  snapshot: SnapshotField[]
  answers: Record<string, AnswerValue>
}) =>
  submission.snapshot.map((f) => ({
    fieldId: f.fieldId,
    label: f.label,
    segments: formatAnswer(f.type, submission.answers[f.fieldId]),
  }))
