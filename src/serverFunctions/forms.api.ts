import { createServerFn } from "@tanstack/react-start"
import { getActiveUser } from "./authHelpers"
import db from "@database"
import { field, form, submission } from "@database/schema"
import { desc, eq } from "drizzle-orm"

const formSummary = {
  id: form.id,
  title: form.title,
  status: form.status,
  createdAt: form.createdAt,
  updatedAt: form.updatedAt,
  publicId: form.publicId,
}

export const getAllForms = createServerFn({ method: "GET" }).handler(
  async () => {
    const user = await getActiveUser()

    const userForms = await db
      .select({
        ...formSummary,
        fieldCount: db.$count(field, eq(field.formId, form.id)),
        submissionCount: db.$count(submission, eq(submission.formId, form.id)),
      })
      .from(form)
      .where(eq(form.userId, user.id))
      .orderBy(desc(form.updatedAt))

    return userForms
  }
)

export const createBlankForm = createServerFn({ method: "POST" }).handler(
  async () => {
    const user = await getActiveUser()

    const [newForm] = await db
      .insert(form)
      .values({
        userId: user.id,
        title: "Untitled Form",
      })
      .returning(formSummary)
    if (!newForm) throw new Error("Failed to create form")
    return newForm
  }
)
