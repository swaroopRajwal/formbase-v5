import { relations } from "drizzle-orm"
import { user, session, account, form, field, submission } from "./schema"

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  forms: many(form),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const formRelations = relations(form, ({ one, many }) => ({
  user: one(user, {
    fields: [form.userId],
    references: [user.id],
  }),
  fields: many(field),
  submissions: many(submission),
}))

export const fieldRelations = relations(field, ({ one }) => ({
  form: one(form, {
    fields: [field.formId],
    references: [form.id],
  }),
}))

export const submissionRelations = relations(submission, ({ one }) => ({
  form: one(form, {
    fields: [submission.formId],
    references: [form.id],
  }),
}))
