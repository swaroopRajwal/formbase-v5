import type { ICommonFieldConfigProps } from "@lib/types/shared.type"

const DateRangeInputConfig: React.FC<ICommonFieldConfigProps> = ({
  fieldData,
}) => {
  return <>This is the date range input config - {fieldData.id}</>
}

export default DateRangeInputConfig
