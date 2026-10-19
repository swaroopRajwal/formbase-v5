import db from "@database"
import { field, form } from "@database/schema"
import { auth } from "@lib/auth"
import { notFound, redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { and, asc, desc, eq, inArray, notInArray } from "drizzle-orm"
import { z } from "zod"
import { fieldToRow } from "./fieldRows"
import { saveFormSchema } from "./fieldSchemas"

const requireUserId = async () => {
  const session = await auth.api.getSession({ headers: getRequestHeaders() })
  if (!session) throw redirect({ to: "/login" })
  return session.user.id
}

const formSummary = {
  id: form.id,
  title: form.title,
  status: form.status,
  updatedAt: form.updatedAt,
}

export const listMyForms = createServerFn({ method: "GET" }).handler(
  async () => {
    const userId = await requireUserId()
    return db
      .select(formSummary)
      .from(form)
      .where(eq(form.userId, userId))
      .orderBy(desc(form.updatedAt))
  }
)

export const createBlankForm = createServerFn({ method: "POST" }).handler(
  async () => {
    const userId = await requireUserId()
    const [created] = await db
      .insert(form)
      .values({ userId, title: "Untitled form" })
      .returning(formSummary)
    if (!created) throw new Error("Failed to create form")
    return created
  }
)

// Another Creator's Form is indistinguishable from a missing one.
export const getMyForm = createServerFn({ method: "GET" })
  .validator(z.object({ formId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    const [found] = await db
      .select(formSummary)
      .from(form)
      .where(and(eq(form.id, data.formId), eq(form.userId, userId)))
    if (!found) throw notFound()
    return found
  })

export const getMyFormWithFields = createServerFn({ method: "GET" })
  .validator(z.object({ formId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    const [found] = await db
      .select({
        ...formSummary,
        description: form.description,
      })
      .from(form)
      .where(and(eq(form.id, data.formId), eq(form.userId, userId)))
    if (!found) throw notFound()
    const fields = await db
      .select()
      .from(field)
      .where(eq(field.formId, found.id))
      .orderBy(asc(field.position))
    return { ...found, fields }
  })

// Replaces the Form's title, description and ordered Fields. Fields with an
// id are updated in place; Fields missing from the payload are deleted.
export const saveForm = createServerFn({ method: "POST" })
  .validator(saveFormSchema)
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    const [found] = await db
      .select({ id: form.id, status: form.status })
      .from(form)
      .where(and(eq(form.id, data.formId), eq(form.userId, userId)))
    if (!found) throw notFound()
    if (found.status === "closed")
      throw new Error("Reopen this form before editing it")

    const keptIds = data.fields.flatMap((f) => (f.id ? [f.id] : []))
    if (keptIds.length > 0) {
      const owned = await db
        .select({ id: field.id })
        .from(field)
        .where(and(eq(field.formId, found.id), inArray(field.id, keptIds)))
      if (owned.length !== new Set(keptIds).size)
        throw new Error("Unknown field in request")
    }

    const writes = [
      db
        .update(form)
        .set({ title: data.title, description: data.description })
        .where(eq(form.id, found.id)),
      keptIds.length > 0
        ? db
            .delete(field)
            .where(
              and(eq(field.formId, found.id), notInArray(field.id, keptIds))
            )
        : db.delete(field).where(eq(field.formId, found.id)),
      ...data.fields.map((f, position) => {
        const row = fieldToRow(f.field, found.id, position)
        return f.id
          ? db
              .update(field)
              .set(row)
              .where(and(eq(field.id, f.id), eq(field.formId, found.id)))
          : db.insert(field).values(row)
      }),
    ] as unknown as Parameters<typeof db.batch>[0]
    await db.batch(writes)
    return { saved: true }
  })
