import { createContext, useContext, useEffect } from "react"
import {
  editorStoreInitialState,
  useEditorStore,
  type EditorStateType,
} from "./editor.store"

interface IEditorContext {
  form: EditorStateType["form"]
  updateField: (v: any) => void
}

const EditorContext = createContext<IEditorContext>({
  form: editorStoreInitialState,
  updateField: () => {
    return
  },
})

interface IEditorProviderProps {
  children: React.ReactNode
  formData: EditorStateType["form"]
}

const EditorProvider: React.FC<IEditorProviderProps> = ({
  children,
  formData,
}) => {
  const storeFormData = useEditorStore((state) => state.form)
  const initForm = useEditorStore((state) => state.initForm)

  useEffect(() => {
    if (storeFormData.id) return
    initForm(formData)
  }, [formData])

  const updateField = (v: any) => {
    return
  }

  return (
    <EditorContext.Provider
      value={{
        form: storeFormData,
        updateField,
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}

export const useEditorContext = () => useContext(EditorContext)
export default EditorProvider
