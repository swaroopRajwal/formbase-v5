import { cn } from "cn"
import { useEditorContext } from "../../editorProvider"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@ui/card"
import { FIELDS_META_RECORD } from "@lib/constants/fields"
import AppTooltip from "@components/shared/appTooltip"
import { Button } from "@ui/button"
import { IconTrash } from "@tabler/icons-react"
import FieldConfigRenderer from "./fieldConfigRenderer"

interface IFiledConfigProps extends React.ComponentPropsWithoutRef<"div"> {}

const FieldConfig: React.FC<IFiledConfigProps> = ({ className, ...props }) => {
  const { currentField, deleteField } = useEditorContext()

  return (
    <Card {...props} className={cn("h-fit", className)}>
      {currentField ? (
        <>
          <CardHeader>
            <CardTitle>{FIELDS_META_RECORD[currentField.type].label}</CardTitle>
            <CardAction>
              <AppTooltip message="Delete Field">
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => deleteField(currentField.id)}
                >
                  <IconTrash />
                </Button>
              </AppTooltip>
            </CardAction>
          </CardHeader>
          <CardContent>
            <FieldConfigRenderer fieldData={currentField} />
          </CardContent>
        </>
      ) : (
        <CardContent>
          Please select a field to update it's configuration
        </CardContent>
      )}
    </Card>
  )
}

export default FieldConfig
