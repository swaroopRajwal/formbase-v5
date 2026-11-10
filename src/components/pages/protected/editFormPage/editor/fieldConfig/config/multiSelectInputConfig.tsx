import type { ICommonFieldConfigProps } from "@lib/types/shared.type"

const MultiSelectInputConfig: React.FC<ICommonFieldConfigProps> = ({
  fieldData,
}) => {
  return <>This is the multi select config - {fieldData.id}</>
}

export default MultiSelectInputConfig
