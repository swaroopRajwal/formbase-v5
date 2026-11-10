import type { IEditorField } from "./form.type"

export type ErrorType = {
  code?: string
  message?: string
  status?: number
} | null

export interface ICommonFieldElementProps {
  disabled?: boolean
  field: IEditorField
}
