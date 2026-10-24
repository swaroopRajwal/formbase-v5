import type { EditorField, EditorValues } from "@lib/forms/editorModel"
import { IconCalendar, IconChevronDown } from "@tabler/icons-react"
import { cn } from "cn"
import { useFormContext, useWatch } from "react-hook-form"

const box =
  "flex min-h-8 items-center justify-between gap-2 rounded-lg border border-input bg-background/50 px-2.5 text-sm text-muted-foreground"

const FakeInput = ({
  text,
  fallback,
  icon,
  tall,
}: {
  text: string
  fallback?: string
  icon?: React.ReactNode
  tall?: boolean
}) => (
  <div className={cn(box, tall && "min-h-20 items-start py-2")}>
    <span className={cn(!text && "opacity-60")}>{text || fallback}</span>
    {icon}
  </div>
)

const optionLabels = (f: EditorField) => f.options.map((o) => o.value.trim())

const Choices = ({
  f,
  shape,
}: {
  f: EditorField
  shape: "round" | "square"
}) => (
  <div className="flex flex-col gap-2">
    {[...optionLabels(f), ...(f.allowOther ? ["Other…"] : [])].map((o, i) => (
      <div key={i} className="flex items-center gap-2 text-sm">
        <span
          className={cn(
            "size-4 shrink-0 border border-input",
            shape === "round" ? "rounded-full" : "rounded-[4px]"
          )}
        />
        {o}
      </div>
    ))}
  </div>
)

const Control = ({ f }: { f: EditorField }) => {
  switch (f.type) {
    case "short":
    case "url":
    case "email":
    case "number":
      return <FakeInput text={f.placeholder} />
    case "paragraph":
      return <FakeInput text={f.placeholder} tall />
    case "radio":
      return <Choices f={f} shape="round" />
    case "checkbox":
      return <Choices f={f} shape="square" />
    case "switch":
      return (
        <span className="flex h-5 w-9 items-center rounded-full border border-input bg-muted px-0.5">
          <span className="size-4 rounded-full bg-muted-foreground/60" />
        </span>
      )
    case "select":
    case "multi_select":
      return (
        <FakeInput
          text={f.placeholder}
          fallback="Select…"
          icon={<IconChevronDown className="size-4" />}
        />
      )
    case "date":
    case "datetime":
      return (
        <FakeInput
          text={f.placeholder}
          icon={<IconCalendar className="size-4" />}
        />
      )
    case "date_range":
      return (
        <div className="grid grid-cols-2 gap-2">
          <FakeInput text="" fallback="Start date" />
          <FakeInput text="" fallback="End date" />
        </div>
      )
  }
}

/** Non-interactive, Respondent-style preview of the Field at `index`. */
const FieldPreview = ({ index }: { index: number }) => {
  const { control } = useFormContext<EditorValues>()
  // Undefined for a render while the Field is being removed.
  const f = useWatch({ control, name: `fields.${index}` }) as
    EditorField | undefined
  if (!f) return null

  return (
    <div className="pointer-events-none flex flex-col gap-2" aria-hidden>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">
          {f.label.trim() || (
            <span className="text-muted-foreground">Untitled field</span>
          )}
          {f.required && <span className="ml-0.5 text-destructive">*</span>}
        </span>
        {f.helperText.trim() && (
          <span className="text-xs text-muted-foreground">{f.helperText}</span>
        )}
      </div>
      <Control f={f} />
    </div>
  )
}

export default FieldPreview
