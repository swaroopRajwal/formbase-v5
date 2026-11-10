import type { ICommonFieldConfigProps } from "@lib/types/shared.type"

const SelectInputConfig: React.FC<ICommonFieldConfigProps> = ({
  fieldData,
}) => {
  return <>This is the select input config - {fieldData.id}</>
}

export default SelectInputConfig
