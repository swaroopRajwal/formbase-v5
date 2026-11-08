import type { IEditorField } from "@lib/types/form.type"
import type { getMyFormWithFields } from "@src/serverFunctions/forms.api"
import { create } from "zustand"
import { devtools } from "zustand/middleware"

export type EditorStateType = {
  form: Awaited<ReturnType<typeof getMyFormWithFields>> & {
    fields: IEditorField[]
  }
}

export const editorStoreInitialState: EditorStateType["form"] = {
  id: "",
  createdAt: new Date(),
  deletedAt: null,
  status: "unpublished",
  title: "",
  updatedAt: new Date(),
  userId: "",
  description: "",
  fields: [],
  publicId: "",
}

type EditorActionsType = {
  initForm: (v: EditorStateType["form"]) => void
  addNewField: (v: IEditorField) => void
  deleteField: (v: string) => void
}

export const useEditorStore = create<EditorStateType & EditorActionsType>()(
  devtools((set) => ({
    form: { ...editorStoreInitialState },
    initForm: (data) => set(() => ({ form: data })),
    addNewField: (data) =>
      set((state) => ({
        form: {
          ...state.form,
          fields: [...state.form.fields, data],
        },
      })),
    deleteField: (id) =>
      set((state) => {
        const newFields = state.form.fields
          .sort((a, b) => a.position - b.position)
          .filter((i) => i.id !== id)
          .map((i, index) => ({
            ...i,
            position: index + 1,
          }))
        return {
          form: {
            ...state.form,
            fields: newFields,
          },
        }
      }),
  }))
)
