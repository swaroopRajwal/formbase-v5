import type { ICommonFieldConfigProps } from "@lib/types/shared.type"

const ShortTextInputConfig: React.FC<ICommonFieldConfigProps> = ({
  fieldData,
}) => {
  return <>This is the short text input config - {fieldData.id}</>
}

export default ShortTextInputConfig
