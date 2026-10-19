import PageWrapper from "@components/shared/pageWrapper"
import type { PublicField, PublicForm } from "@lib/forms/publicForm"
import { Input } from "@ui/input"
import { Label } from "@ui/label"
import { Switch } from "@ui/switch"
import { Textarea } from "@ui/textarea"

const nativeSelect =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"

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
        <input type={kind} name={f.id} value="__other" />
        Other
      </label>
    )}
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
          {f.allowOther && <option value="__other">Other</option>}
        </select>
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

const PublicFormPage = ({ form }: { form: PublicForm }) => (
  <PageWrapper className="flex max-w-2xl flex-col gap-6">
    <header className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold">{form.title}</h1>
      {form.description && (
        <p className="text-sm text-muted-foreground">{form.description}</p>
      )}
    </header>
    {/* Submitting is a later ticket; stop the native GET submit meanwhile. */}
    <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
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
        </div>
      ))}
    </form>
  </PageWrapper>
)

export default PublicFormPage
