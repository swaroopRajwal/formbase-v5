import { set } from "react-hook-form"
import { saveFormSchema, type FieldInput, type FieldType } from "./fieldSchemas"

export type FieldSetting =
  "placeholder" | "maxLength" | "min" | "max" | "options" | "allowOther"

// Which per-type settings the editor shows (and sends). Mirrors spec.md.
export const SETTINGS_BY_TYPE: Record<FieldType, FieldSetting[]> = {
  short: ["placeholder", "maxLength"],
  paragraph: ["placeholder", "maxLength"],
  number: ["placeholder", "min", "max"],
  url: ["placeholder"],
  email: ["placeholder"],
  radio: ["options", "allowOther"],
  checkbox: ["options", "allowOther"],
  switch: [],
  select: ["placeholder", "options", "allowOther"],
  multi_select: ["placeholder", "options", "allowOther"],
  date: ["placeholder"],
  datetime: ["placeholder"],
  date_range: [],
}

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  short: "Short",
  paragraph: "Paragraph",
  number: "Number",
  url: "URL",
  email: "Email",
  radio: "Radio",
  checkbox: "Checkbox",
  switch: "Switch",
  select: "Select",
  multi_select: "Multi Select",
  date: "Date",
  datetime: "Date time",
  date_range: "Date range",
}

// Flat form-state shape: every setting is always present (as a string where
// it is typed into an input) so changing a Field's type never loses state.
export type EditorField = {
  id?: string
  type: FieldType
  label: string
  helperText: string
  required: boolean
  placeholder: string
  maxLength: string
  min: string
  max: string
  options: { value: string }[]
  allowOther: boolean
}

export type EditorValues = {
  title: string
  description: string
  fields: EditorField[]
}

const isChoice = (type: FieldType) => SETTINGS_BY_TYPE[type].includes("options")

// Pre-filled when a Field is added; real values the Creator can edit or clear.
const DEFAULTS_BY_TYPE: Partial<
  Record<FieldType, { placeholder?: string; helperText?: string }>
> = {
  date: { placeholder: "Pick a date" },
  datetime: {
    placeholder: "e.g. Tomorrow 8pm",
    helperText: 'Type a date and time in plain English, e.g. "Next Friday 3pm"',
  },
}

export const blankField = (type: FieldType): EditorField => ({
  type,
  label: FIELD_TYPE_LABELS[type],
  helperText: DEFAULTS_BY_TYPE[type]?.helperText ?? "",
  required: false,
  placeholder: DEFAULTS_BY_TYPE[type]?.placeholder ?? "",
  maxLength: "",
  min: "",
  max: "",
  options: isChoice(type) ? [{ value: "Option 1" }, { value: "Option 2" }] : [],
  allowOther: false,
})

export const toFieldInput = (e: EditorField): FieldInput => {
  const has = (s: FieldSetting) => SETTINGS_BY_TYPE[e.type].includes(s)
  const num = (s: string) => (s.trim() === "" ? undefined : Number(s))
  const out: Record<string, unknown> = {
    type: e.type,
    label: e.label,
    helperText: e.helperText,
    required: e.required,
  }
  if (has("placeholder") && e.placeholder.trim() !== "")
    out.placeholder = e.placeholder
  if (has("maxLength") && e.maxLength.trim() !== "")
    out.maxLength = num(e.maxLength)
  if (has("min") && e.min.trim() !== "") out.min = num(e.min)
  if (has("max") && e.max.trim() !== "") out.max = num(e.max)
  if (has("options")) out.options = e.options.map((o) => o.value)
  if (has("allowOther")) out.allowOther = e.allowOther
  return out as FieldInput
}

export type ValidationResult =
  | { ok: true; data: ReturnType<typeof saveFormSchema.parse> }
  | { ok: false; errors: Record<string, string> }

// Validates against the same zod schemas the server uses. Error keys are
// react-hook-form paths ("fields.2.options.1.value").
export const validateEditor = (values: EditorValues): ValidationResult => {
  const result = saveFormSchema.safeParse({
    formId: "-",
    title: values.title,
    description: values.description,
    fields: values.fields.map((f) => ({
      ...(f.id ? { id: f.id } : {}),
      field: toFieldInput(f),
    })),
  })
  if (result.success) return { ok: true, data: result.data }

  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const path = issue.path.filter((p) => p !== "field").map(String)
    // fields.N.options.M is a string in the schema but {value} in the form.
    if (path[2] === "options" && path.length === 4) path.push("value")
    const key = path.join(".")
    if (!(key in errors)) errors[key] = issue.message
  }
  return { ok: false, errors }
}

// Resolver for react-hook-form built on validateEditor.
export const editorResolver = async (values: EditorValues) => {
  const result = validateEditor(values)
  if (result.ok) return { values, errors: {} }
  const errors: Record<string, unknown> = {}
  for (const [key, message] of Object.entries(result.errors)) {
    set(errors, key, { type: "validation", message })
  }
  return { values: {}, errors }
}

// Which Field to select after removing the one at `removedIndex`: the next
// neighbour, else the previous, else none. `keys` is the list before removal.
export const selectionAfterRemove = (
  keys: string[],
  removedIndex: number
): string | null => keys[removedIndex + 1] ?? keys[removedIndex - 1] ?? null

// Indexes of Fields that have validation errors (react-hook-form's
// `errors.fields` is a sparse array, plus a possible `root` entry).
export const invalidFieldIndexes = (fieldErrors: unknown): number[] => {
  if (!Array.isArray(fieldErrors)) return []
  const out: number[] = []
  fieldErrors.forEach((e, i) => {
    if (e) out.push(i)
  })
  return out
}

// Where a Field dragged in from the palette lands when dropped on the card at
// `overIndex`: before it if the pointer is in its top half, otherwise after.
export const dropIndexFor = (
  overIndex: number,
  pointerY: number,
  overTop: number,
  overHeight: number
): number => (pointerY > overTop + overHeight / 2 ? overIndex + 1 : overIndex)
