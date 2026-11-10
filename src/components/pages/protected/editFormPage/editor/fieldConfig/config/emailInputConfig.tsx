import type { ICommonFieldConfigProps } from "@lib/types/shared.type"

const EmailInputConfig: React.FC<ICommonFieldConfigProps> = ({ fieldData }) => {
  return <>This is the Email input config - {fieldData.id}</>
}

export default EmailInputConfig
