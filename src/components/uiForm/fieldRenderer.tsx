import type { FormFieldKeyType, IEditorField } from "@lib/types/form.type"
import ShortTextInput from "./fields/shortTextInput"
import ParagraphInput from "./fields/paragraphInput"
import NumberInput from "./fields/numberInput"
import URLInput from "./fields/urlInput"
import EmailInput from "./fields/emailInput"
import RadioInput from "./fields/radioInput"
import CheckboxInput from "./fields/checkboxInput"
import SwitchInput from "./fields/switchInput"
import SelectInput from "./fields/selectInput"
import MultiSelectInput from "./fields/multiSelectInput"
import DateInput from "./fields/dateInput"
import TimeInput from "./fields/timeInput"
import DateRangeInput from "./fields/dateRangeInput"
import type { ICommonFieldElementProps } from "@lib/types/shared.type"

interface IFieldRendererProps extends ICommonFieldElementProps {
  field: IEditorField
}

const FIELDS_RENDERER_REGISTER: Record<
  FormFieldKeyType,
  React.FC<ICommonFieldElementProps & { field: IEditorField }>
> = {
  short: ShortTextInput,
  paragraph: ParagraphInput,
  number: NumberInput,
  url: URLInput,
  email: EmailInput,
  radio: RadioInput,
  checkbox: CheckboxInput,
  switch: SwitchInput,
  select: SelectInput,
  multi_select: MultiSelectInput,
  date: DateInput,
  time: TimeInput,
  date_range: DateRangeInput,
}

const FieldRenderer: React.FC<IFieldRendererProps> = ({ field, disabled }) =>
  FIELDS_RENDERER_REGISTER[field.type]({ field, disabled })

export default FieldRenderer
