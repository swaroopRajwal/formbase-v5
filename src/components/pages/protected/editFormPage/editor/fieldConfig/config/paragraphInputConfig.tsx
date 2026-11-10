import type { ICommonFieldConfigProps } from "@lib/types/shared.type"

const ParagraphInputConfig: React.FC<ICommonFieldConfigProps> = ({
  fieldData,
}) => {
  return <>This is the paragraph input config - {fieldData.id}</>
}

export default ParagraphInputConfig
