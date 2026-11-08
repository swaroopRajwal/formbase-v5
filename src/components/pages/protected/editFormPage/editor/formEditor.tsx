import { useEditorContext } from "../editorProvider"
import FieldConfig from "./fieldConfig"
import FieldsCanvas from "./fieldsCanvas"
import LeftSidebar from "./leftSidebar"

const FormEditor = () => {
  const { form } = useEditorContext()

  return (
    <div>
      <p>currently editing - {form.title} form</p>
      <div className="flex gap-6">
        <LeftSidebar className="flex-2" />
        <FieldsCanvas className="flex-2/12" />
        <FieldConfig className="flex-1/12" />
      </div>
    </div>
  )
}

export default FormEditor
