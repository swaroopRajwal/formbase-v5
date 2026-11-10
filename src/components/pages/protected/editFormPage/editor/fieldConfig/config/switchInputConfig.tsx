import type { ICommonFieldConfigProps } from "@lib/types/shared.type"

const SwitchInputConfig: React.FC<ICommonFieldConfigProps> = ({
  fieldData,
}) => {
  return <>This is the switch input config - {fieldData.id}</>
}

export default SwitchInputConfig
