import PageWrapper from "@components/shared/pageWrapper"
import { collectAnswers } from "@lib/forms/collectAnswers"
import { diffFields, formVersion } from "@lib/forms/formChange"
import { submitForm } from "@lib/forms/formFns"
import type { PublicField, PublicForm } from "@lib/forms/publicForm"
import { browserTimeZone, parseDateTime } from "@lib/forms/parseDateTime"
import { HONEYPOT_FIELD } from "@lib/forms/spamGuard"
import { OTHER_CHOICE, otherTextKey } from "@lib/forms/submission"
import { Button } from "@ui/button"
import { Input } from "@ui/input"
import { Label } from "@ui/label"
import { Switch } from "@ui/switch"
import { Textarea } from "@ui/textarea"
import { useEffect, useRef, useState, type FormEvent } from "react"

const nativeSelect =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"

const OtherText = ({ f }: { f: PublicField }) => (
  <Input
    name={otherTextKey(f.id)}
    type="text"
    placeholder="Your answer"
    aria-label={`${f.label} other answer`}
  />
)

const Choices = ({
  f,
  kind,
}: {
  f: PublicField
  kind: "radio" | "checkbox"
}) => (
  <div
    role={kind === "radio" ? "radiogroup" : "group"}
    aria-labelledby={`${f.id}-label`}
    className="flex flex-col gap-2"
  >
    {f.options.map((o) => (
      <label key={o} className="flex items-center gap-2 text-sm">
        <input
          type={kind}
          name={f.id}
          value={o}
          required={kind === "radio" && f.required}
        />
        {o}
      </label>
    ))}
    {f.allowOther && (
      <label className="flex items-center gap-2 text-sm">
        <input type={kind} name={f.id} value={OTHER_CHOICE} />
        Other
      </label>
    )}
    {f.allowOther && <OtherText f={f} />}
  </div>
)

const formatInstant = (instant: string, timeZone: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
    timeStyle: "short",
    timeZone,
  }).format(new Date(instant))

// Natural-language entry: the text input is only for typing; the parsed UTC
// instant and browser timezone travel in hidden inputs. Text that can't be
// parsed blocks submit through the input's validity message.
const DateTimeControl = ({ f }: { f: PublicField }) => {
  const [text, setText] = useState("")
  const ref = useRef<HTMLInputElement>(null)
  const parsed = text.trim() === "" ? null : parseDateTime(text)
  const unparseable = text.trim() !== "" && !parsed

  useEffect(() => {
    ref.current?.setCustomValidity(
      unparseable ? "Couldn't understand that date and time" : ""
    )
  }, [unparseable])

  return (
    <>
      <Input
        ref={ref}
        id={f.id}
        type="text"
        required={f.required}
        placeholder={f.placeholder ?? "e.g. Tomorrow 8pm"}
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-invalid={unparseable || undefined}
      />
      <input type="hidden" name={f.id} value={parsed?.instant ?? ""} />
      <input
        type="hidden"
        name={`${f.id}.timezone`}
        value={parsed?.timezone ?? ""}
      />
      {parsed && (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          Understood as {formatInstant(parsed.instant, parsed.timezone)} (
          {parsed.timezone})
        </p>
      )}
      {unparseable && (
        <p role="alert" className="text-xs text-destructive">
          Couldn't understand that. Try something like "Tomorrow 8pm" or
          "2026-12-25 09:00" ({browserTimeZone()} time).
        </p>
      )}
    </>
  )
}

const Control = ({ f }: { f: PublicField }) => {
  const common = {
    id: f.id,
    name: f.id,
    placeholder: f.placeholder ?? undefined,
    required: f.required,
  }
  switch (f.type) {
    case "short":
      return <Input {...common} type="text" maxLength={f.maxLength} />
    case "paragraph":
      return <Textarea {...common} maxLength={f.maxLength} />
    case "number":
      return <Input {...common} type="number" min={f.min} max={f.max} />
    case "url":
      return <Input {...common} type="url" />
    case "email":
      return <Input {...common} type="email" />
    case "radio":
      return <Choices f={f} kind="radio" />
    case "checkbox":
      return <Choices f={f} kind="checkbox" />
    case "switch":
      return <Switch id={f.id} name={f.id} />
    case "select":
    case "multi_select": {
      const multiple = f.type === "multi_select"
      return (
        <>
          <select
            id={f.id}
            name={f.id}
            required={f.required}
            multiple={multiple}
            defaultValue={multiple ? [] : ""}
            className={nativeSelect}
          >
            {!multiple && (
              <option value="" disabled>
                {f.placeholder || "Select…"}
              </option>
            )}
            {f.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
            {f.allowOther && <option value={OTHER_CHOICE}>Other</option>}
          </select>
          {f.allowOther && <OtherText f={f} />}
        </>
      )
    }
    case "date":
      return <Input {...common} type="date" />
    case "datetime":
      return <DateTimeControl f={f} />
    case "date_range":
      return (
        <div className="grid grid-cols-2 gap-2">
          <Input
            id={f.id}
            name={`${f.id}.start`}
            type="date"
            required={f.required}
            aria-label={`${f.label} start`}
          />
          <Input
            name={`${f.id}.end`}
            type="date"
            required={f.required}
            aria-label={`${f.label} end`}
          />
        </div>
      )
  }
}

const Thanks = () => (
  <PageWrapper className="flex max-w-2xl flex-col gap-2">
    <h1 className="text-2xl font-semibold">
      Thanks, your response was recorded
    </h1>
  </PageWrapper>
)

// Unchanged Fields keep their typed answers because their inputs stay mounted.
// A Field remounts (dropping its answer) when its type changes, or, for
// dropdowns, when its options change, since the browser would otherwise
// silently pick another option.
const fieldKey = (f: PublicField) =>
  f.type === "select" || f.type === "multi_select"
    ? `${f.id}:${f.type}:${f.allowOther}:${f.options.join("\u0000")}`
    : `${f.id}:${f.type}`

const NEW_REQUIRED = "This Field was added. Please answer it."

const PublicFormPage = ({
  form: initialForm,
  publicId,
}: {
  form: PublicForm
  publicId: string
}) => {
  const [form, setForm] = useState(initialForm)
  const [updated, setUpdated] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)
    setErrors({})
    try {
      const result = await submitForm({
        data: {
          publicId,
          answers: collectAnswers(form.fields, new FormData(e.currentTarget)),
          version: formVersion(form.fields),
        },
      })
      if (result.ok) setDone(true)
      else if (result.rateLimited)
        setFormError(
          "Too many submissions. Please wait a minute and try again."
        )
      else if (result.stale) {
        const { added } = diffFields(form.fields, result.form.fields)
        setUpdated(true)
        setErrors(
          Object.fromEntries(
            added.filter((f) => f.required).map((f) => [f.id, NEW_REQUIRED])
          )
        )
        setForm(result.form)
      } else setErrors(result.errors)
    } catch {
      setFormError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (done) return <Thanks />

  return (
    <PageWrapper className="flex max-w-2xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{form.title}</h1>
        {form.description && (
          <p className="text-sm text-muted-foreground">{form.description}</p>
        )}
      </header>
      {updated && (
        <p
          role="status"
          className="rounded-lg border border-input bg-muted px-3 py-2 text-sm"
        >
          This form was updated while you were filling it, so nothing was
          submitted. Your answers were kept where they still apply. Please
          review the Fields below and submit again.
        </p>
      )}
      <form className="flex flex-col gap-5" onSubmit={onSubmit}>
        {form.fields.map((f) => (
          <div key={fieldKey(f)} className="flex flex-col gap-1.5">
            <Label id={`${f.id}-label`} htmlFor={f.id}>
              {f.label}
              {f.required && <span className="text-destructive">*</span>}
            </Label>
            {f.helperText && (
              <p className="text-xs text-muted-foreground">{f.helperText}</p>
            )}
            <Control f={f} />
            {errors[f.id] && (
              <p role="alert" className="text-xs text-destructive">
                {errors[f.id]}
              </p>
            )}
          </div>
        ))}
        <div aria-hidden="true" className="absolute -left-[9999px]">
          <label>
            {HONEYPOT_FIELD}
            <input
              type="text"
              name={HONEYPOT_FIELD}
              tabIndex={-1}
              autoComplete="off"
            />
          </label>
        </div>
        {formError && (
          <p role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        )}
        <Button type="submit" disabled={submitting} className="self-start">
          {submitting ? "Submitting…" : "Submit"}
        </Button>
      </form>
    </PageWrapper>
  )
}

export default PublicFormPage
