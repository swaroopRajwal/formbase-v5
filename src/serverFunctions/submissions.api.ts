import { createServerFn } from "@tanstack/react-start"
import z from "zod"
import { getActiveUser } from "./authHelpers"
import { form, submission } from "@database/schema"
import db from "@database"
import { and, desc, eq } from "drizzle-orm"
import { notFound } from "@tanstack/react-router"

export const getMyFormSubmissions = createServerFn({ method: "GET" })
  .validator(
    z.object({
      formId: z.string().min(1),
    })
  )
  .handler(async ({ data }) => {
    const user = await getActiveUser()

    const [formResult] = await db
      .select()
      .from(form)
      .where(and(eq(form.id, data.formId), eq(form.userId, user.id)))

    if (!formResult) throw notFound()

    const submissions = await db
      .select()
      .from(submission)
      .where(and(eq(submission.formId, data.formId)))
      .orderBy(desc(submission.createdAt))

    return {
      form: formResult,
      submissions: submissions,
    }
  })
