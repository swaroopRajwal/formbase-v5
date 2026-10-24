import db from "@database"
import { field, form, submission } from "@database/schema"
import { auth } from "@lib/auth"
import { notFound, redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
  notInArray,
  sql,
} from "drizzle-orm"
import { z } from "zod"
import { fieldToRow } from "./fieldRows"
import { saveFormSchema } from "./fieldSchemas"
import { formsTableSearchSchema } from "./formsTableSearch"
import { generatePublicId, nextStatus, type LifecycleAction } from "./lifecycle"
import { formVersion } from "./formChange"
import { toPublicForm } from "./publicForm"
import { isHoneypotFilled, submitLimiter } from "./spamGuard"
import { validateSubmission } from "./submission"
import { buildColumns } from "./submissionsTable"

const requireUserId = async () => {
  const session = await auth.api.getSession({ headers: getRequestHeaders() })
  if (!session) throw redirect({ to: "/login" })
  return session.user.id
}

const formSummary = {
  id: form.id,
  title: form.title,
  status: form.status,
  publicId: form.publicId,
  updatedAt: form.updatedAt,
}

// Drizzle drops table qualifiers in single-table queries, so the outer
// `form.id` would resolve to the inner table's own `id`. Qualify it by hand.
const countRelated = (
  table: typeof field | typeof submission,
  formId: typeof field.formId | typeof submission.formId
) =>
  sql<number>`(select count(*) from ${table} where ${formId} = "form"."id")`.mapWith(
    Number
  )

const fieldCount = countRelated(field, field.formId)
const submissionCount = countRelated(submission, submission.formId)

const SORT_COLUMNS = {
  title: sql`lower(${form.title})`,
  createdAt: form.createdAt,
  updatedAt: form.updatedAt,
  fields: fieldCount,
  submissions: submissionCount,
}

// Escapes LIKE wildcards so the search is a literal substring match.
const titleContains = (q: string) =>
  sql`lower(${form.title}) like ${`%${q.toLowerCase().replace(/[\\%_]/g, "\\$&")}%`} escape '\\'`

// One page of the Creator's Forms, sorted on the server with `id` as the
// stable tie-breaker. `hasAnyForms` tells "no Forms yet" from "no matches".
export const listMyForms = createServerFn({ method: "GET" })
  .validator(formsTableSearchSchema)
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    const owned = eq(form.userId, userId)
    const matching = and(
      owned,
      data.q ? titleContains(data.q) : undefined,
      data.status === "all" ? undefined : eq(form.status, data.status)
    )
    const direction = data.dir === "asc" ? asc : desc
    const [rows, [counted], [anyForm]] = await Promise.all([
      db
        .select({
          ...formSummary,
          createdAt: form.createdAt,
          fieldCount,
          submissionCount,
        })
        .from(form)
        .where(matching)
        .orderBy(direction(SORT_COLUMNS[data.sort]), asc(form.id))
        .limit(data.pageSize)
        .offset((data.page - 1) * data.pageSize),
      db.select({ total: count() }).from(form).where(matching),
      db.select({ id: form.id }).from(form).where(owned).limit(1),
    ])
    return {
      rows,
      total: counted?.total ?? 0,
      hasAnyForms: anyForm !== undefined,
    }
  })

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

// The Creator's own Form, or notFound for a missing or someone else's Form.
const findOwnedForm = async (userId: string, formId: string) => {
  const [found] = await db
    .select({ ...formSummary, description: form.description })
    .from(form)
    .where(and(eq(form.id, formId), eq(form.userId, userId)))
  if (!found) throw notFound()
  return found
}

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
    const found = await findOwnedForm(userId, data.formId)
    const fields = await db
      .select()
      .from(field)
      .where(eq(field.formId, found.id))
      .orderBy(asc(field.position))
    return { ...found, fields }
  })

// Creator-only: the Form's Submissions (newest first) with one column per
// Field seen in any snapshot, so removed Fields still show. Another Creator's
// Form is indistinguishable from a missing one.
export const getMySubmissions = createServerFn({ method: "GET" })
  .validator(z.object({ formId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    const found = await findOwnedForm(userId, data.formId)
    const [currentFields, rows] = await Promise.all([
      db
        .select({ id: field.id })
        .from(field)
        .where(eq(field.formId, found.id))
        .orderBy(asc(field.position)),
      db
        .select()
        .from(submission)
        .where(eq(submission.formId, found.id))
        .orderBy(desc(submission.createdAt)),
    ])
    return {
      form: found,
      columns: buildColumns(
        rows,
        currentFields.map((f) => f.id)
      ),
      submissions: rows.map((r) => ({
        id: r.id,
        createdAt: r.createdAt.toISOString(),
        answers: r.answers,
        snapshot: r.snapshot,
      })),
    }
  })

// Replaces the Form's title, description and ordered Fields. Fields with an
// id are updated in place; Fields missing from the payload are deleted.
export const saveForm = createServerFn({ method: "POST" })
  .validator(saveFormSchema)
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    const [found] = await db
      .select({ id: form.id })
      .from(form)
      .where(and(eq(form.id, data.formId), eq(form.userId, userId)))
    if (!found) throw notFound()

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

// Moves a Form along Unpublished <-> Published. The first
// publish assigns the Public link id; it is kept across unpublish/republish.
export const changeFormStatus = createServerFn({ method: "POST" })
  .validator(
    z.object({
      formId: z.string().min(1),
      action: z.enum(["publish", "unpublish"]),
    })
  )
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    const [found] = await db
      .select({ status: form.status, publicId: form.publicId })
      .from(form)
      .where(and(eq(form.id, data.formId), eq(form.userId, userId)))
    if (!found) throw notFound()
    const action: LifecycleAction = data.action
    const to = nextStatus(found.status, action)
    if (!to) throw new Error(`Cannot ${action} a ${found.status} form`)

    if (action === "publish") {
      const [anyField] = await db
        .select({ id: field.id })
        .from(field)
        .where(eq(field.formId, data.formId))
        .limit(1)
      if (!anyField) throw new Error("Add at least one field before publishing")
    }

    // The status guard in WHERE keeps concurrent requests from double-applying.
    // A Public link id collision (unique violation) is retried with a new id.
    let updated
    for (let attempt = 0; attempt < 3 && !updated; attempt++) {
      try {
        ;[updated] = await db
          .update(form)
          .set({ status: to, publicId: found.publicId ?? generatePublicId() })
          .where(
            and(
              eq(form.id, data.formId),
              eq(form.userId, userId),
              eq(form.status, found.status)
            )
          )
          .returning(formSummary)
        break
      } catch (e) {
        if (found.publicId || attempt === 2) throw e
      }
    }
    if (!updated) throw new Error("Form status changed, please retry")
    return updated
  })

// Unpublished and unknown ids are both a 404.
const loadPublishedForm = async (publicId: string) => {
  const [found] = await db
    .select({
      id: form.id,
      title: form.title,
      description: form.description,
      status: form.status,
    })
    .from(form)
    .where(eq(form.publicId, publicId))
  if (found?.status !== "published") throw notFound()
  const fields = await db.select().from(field).where(eq(field.formId, found.id))
  const publicForm = toPublicForm(found, fields)
  if (!publicForm) throw notFound()
  return { formId: found.id, publicForm }
}

// Public (no auth): Respondent view of a Published Form.
export const getPublicForm = createServerFn({ method: "GET" })
  .validator(z.object({ publicId: z.string().min(1) }))
  .handler(
    async ({ data }) => (await loadPublishedForm(data.publicId)).publicForm
  )

const clientIp = () => {
  const headers = getRequestHeaders()
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  )
}

// Public (no auth): validates answers against the Form as it is now and, if
// valid, stores them with a snapshot of the Field labels/types. Invalid
// answers come back as per-field errors, not a thrown error.
export const submitForm = createServerFn({ method: "POST" })
  .validator(
    z.object({
      publicId: z.string().min(1),
      answers: z.record(z.string(), z.unknown()),
      // formVersion of the Fields the Respondent was shown.
      version: z.string(),
    })
  )
  .handler(async ({ data }) => {
    if (!submitLimiter.take(`${data.publicId}:${clientIp()}`))
      return { ok: false as const, rateLimited: true as const }
    const { formId, publicForm } = await loadPublishedForm(data.publicId)
    // Bots that fill the hidden honeypot see success but nothing is stored.
    if (isHoneypotFilled(data.answers)) return { ok: true as const }
    // The Form changed while the Respondent was filling: nothing is stored;
    // they get the new Fields to review and resubmit.
    if (data.version !== formVersion(publicForm.fields))
      return {
        ok: false as const,
        rateLimited: false as const,
        stale: true as const,
        form: publicForm,
      }
    const result = validateSubmission(publicForm.fields, data.answers)
    if (!result.ok)
      return {
        ok: false as const,
        rateLimited: false as const,
        stale: false as const,
        errors: result.errors,
      }
    await db.insert(submission).values({
      formId,
      answers: result.answers,
      snapshot: result.snapshot,
    })
    return { ok: true as const }
  })
