import type { FormFieldKeyType } from "@lib/types/form.type"
import type { ICommonFieldConfigProps } from "@lib/types/shared.type"
import ShortTextInputConfig from "./config/shortTextInputConfig"
import ParagraphInputConfig from "./config/paragraphInputConfig"
import NumberInputConfig from "./config/numberInputConfig"
import URLInputConfig from "./config/urlInputConfig"
import EmailInputConfig from "./config/emailInputConfig"
import RadioInputConfig from "./config/radioInputConfig"
import CheckboxInputConfig from "./config/checkboxInputConfig"
import SwitchInputConfig from "./config/switchInputConfig"
import SelectInputConfig from "./config/selectInputConfig"
import MultiSelectInputConfig from "./config/multiSelectInputConfig"
import DateInputConfig from "./config/dateInputConfig"
import TimeInputConfig from "./config/timeInputConfig"
import DateRangeInputConfig from "./config/dateRangeInputConfig"

const FIELDS_CONFIG_RENDERER_REGISTER: Record<
  FormFieldKeyType,
  React.FC<ICommonFieldConfigProps>
> = {
  short: ShortTextInputConfig,
  paragraph: ParagraphInputConfig,
  number: NumberInputConfig,
  url: URLInputConfig,
  email: EmailInputConfig,
  radio: RadioInputConfig,
  checkbox: CheckboxInputConfig,
  switch: SwitchInputConfig,
  select: SelectInputConfig,
  multi_select: MultiSelectInputConfig,
  date: DateInputConfig,
  time: TimeInputConfig,
  date_range: DateRangeInputConfig,
}

const FieldConfigRenderer: React.FC<ICommonFieldConfigProps> = ({
  fieldData,
}) => FIELDS_CONFIG_RENDERER_REGISTER[fieldData.type]({ fieldData })

export default FieldConfigRenderer
