import type { IEditorField } from "@lib/types/form.type"
import ShortTextInput from "./fields/shortText"
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
import DateTimeInput from "./fields/dateTimeInput"
import DateRangeInput from "./fields/dateRangeInput"

interface IFieldRendererProps {
  field: IEditorField
}

const FieldRenderer: React.FC<IFieldRendererProps> = ({ field }) => {
  switch (field.type) {
    case "short":
      ;<ShortTextInput field={field} />
      break
    case "paragraph":
      ;<ParagraphInput field={field} />
      break
    case "number":
      ;<NumberInput field={field} />
      break
    case "url":
      ;<URLInput field={field} />
      break
    case "email":
      ;<EmailInput field={field} />
      break
    case "radio":
      ;<RadioInput field={field} />
      break
    case "checkbox":
      ;<CheckboxInput field={field} />
      break
    case "switch":
      ;<SwitchInput field={field} />
      break
    case "select":
      ;<SelectInput field={field} />
      break
    case "multi_select":
      ;<MultiSelectInput field={field} />
      break
    case "date":
      ;<DateInput field={field} />
      break
    case "datetime":
      ;<DateTimeInput field={field} />
      break
    case "date_range":
      ;<DateRangeInput field={field} />
      break

    default:
      ;<></>
      break
  }

  return <></>
}

export default FieldRenderer
