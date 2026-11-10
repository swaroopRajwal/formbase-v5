import FieldConfig from "./fieldConfig"
import FieldsCanvas from "./fieldsCanvas"
import LeftSidebar from "./leftSidebar"

const FormEditor = () => {
  return (
    <div className="flex gap-6">
      <LeftSidebar className="flex-2 sticky top-20.25" />
      <FieldsCanvas className="flex-2/12" />
      <FieldConfig className="flex-1/12 sticky top-20.25" />
    </div>
  )
}

export default FormEditor
