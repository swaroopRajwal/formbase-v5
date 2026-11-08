import { cn } from "cn"
import { useEditorContext } from "../../editorProvider"

interface IFiledConfigProps extends React.ComponentPropsWithoutRef<"div"> {}

const FieldConfig: React.FC<IFiledConfigProps> = ({ className, ...props }) => {
  const { currentField } = useEditorContext()

  return (
    <div {...props} className={cn("h-fit", className)}>
      Currently selected field - {currentField?.id}
    </div>
  )
}

export default FieldConfig
