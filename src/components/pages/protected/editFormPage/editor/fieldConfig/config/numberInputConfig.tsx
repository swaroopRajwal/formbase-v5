import type { ICommonFieldConfigProps } from "@lib/types/shared.type"

const NumberInputConfig: React.FC<ICommonFieldConfigProps> = ({
  fieldData,
}) => {
  return <>This is the number input config - {fieldData.id}</>
}

export default NumberInputConfig
