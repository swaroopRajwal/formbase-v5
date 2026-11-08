import type { field, FieldSettingsType, form } from "@database/schema"
import type { FIELD_TYPES } from "@lib/constants/fields"

export type BaseFormType = typeof form.$inferSelect
export type BaseFieldType = typeof field.$inferSelect

export type FormFieldKeyType = (typeof FIELD_TYPES)[number]

export interface IEditorField {
  id: string
  formId: string
  type: FormFieldKeyType
  label: string
  helperText: string
  required: boolean
  placeholder: string
  options: string[]
  allowOther: boolean
  settings: FieldSettingsType
  position: number
  createdAt: Date
  updatedAt: Date
}
