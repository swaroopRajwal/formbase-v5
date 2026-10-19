export type FormStatus = "unpublished" | "published"
export type LifecycleAction = "publish" | "unpublish"

const TRANSITIONS: Record<
  LifecycleAction,
  { from: FormStatus; to: FormStatus }
> = {
  publish: { from: "unpublished", to: "published" },
  unpublish: { from: "published", to: "unpublished" },
}

const LABELS: Record<LifecycleAction, string> = {
  publish: "Publish",
  unpublish: "Unpublish",
}

// Returns the resulting status, or null when the action is not valid from
// the current status.
export const nextStatus = (
  status: FormStatus,
  action: LifecycleAction
): FormStatus | null => {
  const t = TRANSITIONS[action]
  return t.from === status ? t.to : null
}

// The one action a Creator can take from this status, with its button label.
export const availableAction = (
  status: FormStatus
): { action: LifecycleAction; label: string } => {
  const action = (Object.keys(TRANSITIONS) as LifecycleAction[]).find(
    (a) => TRANSITIONS[a].from === status
  )!
  return { action, label: LABELS[action] }
}

const ID_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
const ID_LENGTH = 12

// Random, unguessable id for the Public link (`/f/<id>`).
export const generatePublicId = (): string => {
  let out = ""
  while (out.length < ID_LENGTH) {
    for (const b of crypto.getRandomValues(new Uint8Array(ID_LENGTH))) {
      // 62 does not divide 256, so skip the biased tail.
      if (b < 248 && out.length < ID_LENGTH) out += ID_ALPHABET[b % 62]
    }
  }
  return out
}
