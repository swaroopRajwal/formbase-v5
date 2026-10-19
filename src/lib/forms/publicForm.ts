import type { field as fieldTable, form as formTable } from "@database/schema"
import type { FieldType } from "./fieldSchemas"

type FormRow = Pick<
  typeof formTable.$inferSelect,
  "title" | "description" | "status"
>
type FieldRow = Pick<
  typeof fieldTable.$inferSelect,
  | "id"
  | "type"
  | "label"
  | "helperText"
  | "required"
  | "placeholder"
  | "options"
  | "allowOther"
  | "settings"
  | "position"
>

export type PublicField = {
  id: string
  type: FieldType
  label: string
  helperText: string
  required: boolean
  placeholder: string | null
  options: string[]
  allowOther: boolean
  min?: number
  max?: number
  maxLength?: number
}

export type PublicForm = {
  title: string
  description: string
  fields: PublicField[]
}

// What a Respondent may see of a Form. Null (a 404) unless Published, and no
// Creator identity is ever included.
export const toPublicForm = (
  form: FormRow,
  fields: FieldRow[]
): PublicForm | null => {
  if (form.status !== "published") return null
  return {
    title: form.title,
    description: form.description,
    fields: [...fields]
      .sort((a, b) => a.position - b.position)
      .map((f) => ({
        id: f.id,
        type: f.type,
        label: f.label,
        helperText: f.helperText,
        required: f.required,
        placeholder: f.placeholder,
        options: f.options ?? [],
        allowOther: f.allowOther,
        min: f.settings.min,
        max: f.settings.max,
        maxLength: f.settings.maxLength,
      })),
  }
}
