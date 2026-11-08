import { cn } from "cn"
import { useEditorContext } from "../../editorProvider"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@ui/card"
import { FIELDS_META_RECORD } from "@lib/constants/fields"
import { Button } from "@ui/button"
import { IconTrash } from "@tabler/icons-react"
import AppTooltip from "@components/shared/appTooltip"

interface IFieldsCanvasProps extends React.ComponentPropsWithoutRef<"div"> {}

const FieldsCanvas: React.FC<IFieldsCanvasProps> = ({
  className,
  ...props
}) => {
  const { form, deleteField, setCurrentField, currentFieldId } =
    useEditorContext()
  const fields = form.fields

  return (
    <div {...props} className={cn("space-y-4", className)}>
      {fields.map((i) => (
        <Card
          key={`form-field-${i.id}-${i.type}`}
          tabIndex={0}
          onClick={() => setCurrentField(i.id)}
          className={cn(
            currentFieldId === i.id ? "ring-2 ring-ring" : "",
            "hover:cursor-pointer",
            "transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "border touch-none"
          )}
        >
          <CardHeader>
            <CardTitle>{FIELDS_META_RECORD[i.type].label}</CardTitle>
            <CardAction>
              <AppTooltip message="Delete Field">
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => deleteField(i.id)}
                >
                  <IconTrash />
                </Button>
              </AppTooltip>
            </CardAction>
          </CardHeader>
          <CardContent>This is the {i.type} field</CardContent>
        </Card>
      ))}
    </div>
  )
}

export default FieldsCanvas
