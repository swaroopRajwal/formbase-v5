import { getRouteApi } from "@tanstack/react-router"
import EditorProvider from "./editorProvider"
import FormEditor from "./editor/formEditor"

const routeApi = getRouteApi("/__protected/forms/edit/$formId")

const EditFormPage = () => {
  const form = routeApi.useLoaderData()

  return (
    <EditorProvider formData={form}>
      <FormEditor />
    </EditorProvider>
  )
}

export default EditFormPage
