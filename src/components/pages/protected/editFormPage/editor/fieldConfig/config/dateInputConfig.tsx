import type { ICommonFieldConfigProps } from "@lib/types/shared.type"

const DateInputConfig: React.FC<ICommonFieldConfigProps> = ({ fieldData }) => {
  return <>This is the date input config - {fieldData.id}</>
}

export default DateInputConfig
