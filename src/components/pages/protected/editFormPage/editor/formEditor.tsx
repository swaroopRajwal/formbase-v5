import { useEditorContext } from "../editorProvider"

const FormEditor = () => {
  const { form } = useEditorContext()

  return (
    <>
      This is the form editor
      <br />
      currently editing - {form.title} form
    </>
  )
}

export default FormEditor
