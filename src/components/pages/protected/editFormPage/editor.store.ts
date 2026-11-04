import type { getMyFormWithFields } from "@src/serverFunctions/forms.api"
import { create } from "zustand"
import { devtools } from "zustand/middleware"

export type EditorStateType = {
  form: Awaited<ReturnType<typeof getMyFormWithFields>>
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
}

export const useEditorStore = create<EditorStateType & EditorActionsType>()(
  devtools((set) => ({
    form: { ...editorStoreInitialState },
    initForm: (data) => set(() => ({ form: data })),
  }))
)
