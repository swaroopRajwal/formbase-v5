import { FIELDS_META_RECORD, getDefeaultFieldData } from "@lib/constants/fields"
import { cn } from "cn"
import { useEditorContext } from "../../editorProvider"
import type { FormFieldKeyType } from "@lib/types/form.type"

interface ILeftSidebarProps extends React.ComponentPropsWithoutRef<"div"> {}

const LeftSidebar: React.FC<ILeftSidebarProps> = ({ className, ...props }) => {
  const { totalFieldsCount, form, addNewField } = useEditorContext()

  const handleFieldClick = (type: FormFieldKeyType) => {
    const fieldData = getDefeaultFieldData({
      type,
      formId: form.id,
      position: totalFieldsCount + 1,
    })
    addNewField(fieldData)
  }

  return (
    <div {...props} className={cn("grid grid-cols-2 gap-2 h-fit", className)}>
      {Object.values(FIELDS_META_RECORD).map((field) => (
        <button
          key={`left-sidebar-fields-${field.type}`}
          onClick={() => handleFieldClick(field.type)}
          className={cn(
            "flex w-full touch-none flex-col items-start gap-1 rounded-lg border bg-card p-3 text-left transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
          )}
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <field.icon className="size-4 shrink-0" />
            {field.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {field.description}
          </span>
        </button>
      ))}
    </div>
  )
}

export default LeftSidebar
