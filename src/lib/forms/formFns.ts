import db from "@database"
import { form } from "@database/schema"
import { auth } from "@lib/auth"
import { notFound, redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { and, desc, eq } from "drizzle-orm"
import { z } from "zod"

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
