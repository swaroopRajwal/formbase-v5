import type { ICommonFieldConfigProps } from "@lib/types/shared.type"

const CheckboxInputConfig: React.FC<ICommonFieldConfigProps> = ({
  fieldData,
}) => {
  return <>This is the checkbox input config - {fieldData.id}</>
}

export default CheckboxInputConfig
