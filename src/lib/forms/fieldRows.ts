import type { field as fieldTable } from "@database/schema"
import { blankField, type EditorField } from "./editorModel"
import type { Field } from "./fieldSchemas"

export type FieldRow = typeof fieldTable.$inferSelect
type FieldRowValues = Omit<
  typeof fieldTable.$inferInsert,
  "id" | "createdAt" | "updatedAt"
>

export const fieldToRow = (
  f: Field,
  formId: string,
  position: number
): FieldRowValues => {
  const settings: FieldRow["settings"] = {}
  if ("maxLength" in f && f.maxLength !== undefined)
    settings.maxLength = f.maxLength
  if (f.type === "number") {
    if (f.min !== undefined) settings.min = f.min
    if (f.max !== undefined) settings.max = f.max
  }
  return {
    formId,
    position,
    type: f.type,
    label: f.label,
    helperText: f.helperText,
    required: f.required,
    placeholder: "placeholder" in f ? (f.placeholder ?? null) : null,
    options: "options" in f ? f.options : null,
    allowOther: "allowOther" in f ? f.allowOther : false,
    settings,
  }
}

export const rowToEditorField = (
  row: Omit<FieldRow, "formId" | "position" | "createdAt" | "updatedAt">
): EditorField => ({
  ...blankField(row.type),
  id: row.id,
  label: row.label,
  helperText: row.helperText,
  required: row.required,
  placeholder: row.placeholder ?? "",
  maxLength: row.settings.maxLength?.toString() ?? "",
  min: row.settings.min?.toString() ?? "",
  max: row.settings.max?.toString() ?? "",
  options: (row.options ?? []).map((value) => ({ value })),
  allowOther: row.allowOther,
})
