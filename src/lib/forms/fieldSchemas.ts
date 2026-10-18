import { z } from "zod"

export const MAX_FIELDS_PER_FORM = 100
export const MAX_OPTIONS_PER_FIELD = 100
export const MAX_TEXT_ANSWER_LENGTH = 10_000

export const FIELD_TYPES = [
  "short",
  "paragraph",
  "number",
  "url",
  "email",
  "radio",
  "checkbox",
  "switch",
  "select",
  "multi_select",
  "date",
  "datetime",
  "date_range",
] as const
export type FieldType = (typeof FIELD_TYPES)[number]

const common = {
  label: z.string().trim().min(1).max(200),
  helperText: z.string().trim().max(1000).default(""),
  required: z.boolean().default(false),
}

const placeholder = z.string().trim().max(200).optional()

const optionsList = z
  .array(z.string().trim().min(1).max(200))
  .min(1)
  .max(MAX_OPTIONS_PER_FIELD)
  .refine(
    (opts) => new Set(opts.map((o) => o.toLowerCase())).size === opts.length,
    {
      message: "Options must be unique",
    }
  )

const textMaxLength = z
  .number()
  .int()
  .min(1)
  .max(MAX_TEXT_ANSWER_LENGTH)
  .optional()

// Strict objects: settings that don't apply to a type (e.g. placeholder on
// Radio) are rejected rather than silently dropped.
const text = (type: "short" | "paragraph") =>
  z.strictObject({
    ...common,
    type: z.literal(type),
    placeholder,
    maxLength: textMaxLength,
  })

const placeholderOnly = (type: "url" | "email" | "date" | "datetime") =>
  z.strictObject({ ...common, type: z.literal(type), placeholder })

const noSettings = (type: "switch" | "date_range") =>
  z.strictObject({ ...common, type: z.literal(type) })

const choice = <T extends "radio" | "checkbox" | "select" | "multi_select">(
  type: T
) =>
  z.strictObject({
    ...common,
    type: z.literal(type),
    options: optionsList,
    allowOther: z.boolean().default(false),
  })

const dropdown = (type: "select" | "multi_select") =>
  choice(type).extend({ placeholder })

const numberField = z
  .strictObject({
    ...common,
    type: z.literal("number"),
    placeholder,
    min: z.number().finite().optional(),
    max: z.number().finite().optional(),
  })
  .refine((f) => f.min === undefined || f.max === undefined || f.min <= f.max, {
    message: "min must not exceed max",
    path: ["min"],
  })

export const fieldSchema = z.discriminatedUnion("type", [
  text("short"),
  text("paragraph"),
  numberField,
  placeholderOnly("url"),
  placeholderOnly("email"),
  choice("radio"),
  choice("checkbox"),
  noSettings("switch"),
  dropdown("select"),
  dropdown("multi_select"),
  placeholderOnly("date"),
  placeholderOnly("datetime"),
  noSettings("date_range"),
])
export type FieldInput = z.input<typeof fieldSchema>
export type Field = z.output<typeof fieldSchema>

export const formDraftSchema = z.strictObject({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).default(""),
  fields: z.array(fieldSchema).max(MAX_FIELDS_PER_FORM),
})
export type FormDraft = z.output<typeof formDraftSchema>
