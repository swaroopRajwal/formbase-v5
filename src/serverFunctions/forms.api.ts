import { createServerFn } from "@tanstack/react-start"
import { getActiveUser } from "./authHelpers"
import db from "@database"
import { field, form, submission } from "@database/schema"
import { and, asc, desc, eq, isNull } from "drizzle-orm"
import z from "zod"
import { notFound } from "@tanstack/react-router"

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
      .where(and(eq(form.userId, user.id), isNull(form.deletedAt)))
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

export const deleteForm = createServerFn({ method: "POST" })
  .validator(
    z.object({
      formId: z.string().min(1),
    })
  )
  .handler(async ({ data }) => {
    const user = await getActiveUser()

    const [deletedForm] = await db
      .update(form)
      .set({
        deletedAt: new Date(),
      })
      .where(
        and(
          eq(form.id, data.formId),
          eq(form.userId, user.id),
          isNull(form.deletedAt)
        )
      )
      .returning({ id: form.id })

    if (!deletedForm) throw notFound()
    return { deleted: true }
  })

export const getMyFormWithFields = createServerFn({ method: "GET" })
  .validator(z.object({ formId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const user = await getActiveUser()
    const [myForm] = await db
      .select()
      .from(form)
      .where(
        and(
          eq(form.id, data.formId),
          eq(form.userId, user.id),
          isNull(form.deletedAt)
        )
      )
    if (!myForm) throw notFound()
    const fields = await db
      .select()
      .from(field)
      .where(eq(field.formId, myForm.id))
      .orderBy(asc(field.position))

    return {
      ...myForm,
      fields,
    }
  })
