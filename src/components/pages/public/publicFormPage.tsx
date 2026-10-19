import PageWrapper from "@components/shared/pageWrapper"
import { collectAnswers } from "@lib/forms/collectAnswers"
import { submitForm } from "@lib/forms/formFns"
import type { PublicField, PublicForm } from "@lib/forms/publicForm"
import { OTHER_CHOICE, otherTextKey } from "@lib/forms/submission"
import { Button } from "@ui/button"
import { Input } from "@ui/input"
import { Label } from "@ui/label"
import { Switch } from "@ui/switch"
import { Textarea } from "@ui/textarea"
import { useState, type FormEvent } from "react"

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
      return (
        <Input
          {...common}
          type="text"
          placeholder={f.placeholder ?? "e.g. Tomorrow 8pm"}
        />
      )
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

const PublicFormPage = ({
  form,
  publicId,
}: {
  form: PublicForm
  publicId: string
}) => {
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
        },
      })
      if (result.ok) setDone(true)
      else setErrors(result.errors)
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
      <form className="flex flex-col gap-5" onSubmit={onSubmit}>
        {form.fields.map((f) => (
          <div key={f.id} className="flex flex-col gap-1.5">
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
