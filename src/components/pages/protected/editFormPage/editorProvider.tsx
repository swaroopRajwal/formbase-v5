import { createContext, useContext, useEffect, useState } from "react"
import {
  editorStoreInitialState,
  useEditorStore,
  type EditorStateType,
} from "./editor.store"
import type { IEditorField } from "@lib/types/form.type"

interface IEditorContext {
  form: EditorStateType["form"]
  totalFieldsCount: number
  currentFieldId?: string
  currentField?: IEditorField
  setCurrentField: (id: string) => void
  updateField: (v: any) => void
  addNewField: (v: IEditorField) => void
  deleteField: (id: string) => void
}

const EditorContext = createContext<IEditorContext>({
  form: editorStoreInitialState,
  totalFieldsCount: 0,
  currentFieldId: undefined,
  currentField: undefined,
  setCurrentField: () => {
    return
  },
  updateField: () => {
    return
  },
  addNewField: () => {
    return
  },
  deleteField: () => {
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
  const totalFieldsCount = useEditorStore((state) => state.form.fields.length)
  const initForm = useEditorStore((state) => state.initForm)
  const addNewField = useEditorStore((state) => state.addNewField)
  const deleteField = useEditorStore((state) => state.deleteField)

  const [currentField, setCurrentField] =
    useState<IEditorContext["currentField"]>(undefined)

  const handleFieldSelect = (fieldId: string) => {
    const field = storeFormData.fields.filter((i) => i.id === fieldId)
    if (field.length > 0) setCurrentField(field[0])
  }

  const handleDeleteField = (id: string) => {
    // TODO: if the current selected field is deleted, select a field next to it
    deleteField(id)
  }

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
        totalFieldsCount,
        currentField,
        currentFieldId: currentField?.id,
        setCurrentField: handleFieldSelect,
        updateField,
        addNewField,
        deleteField: handleDeleteField,
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}

export const useEditorContext = () => useContext(EditorContext)
export default EditorProvider
