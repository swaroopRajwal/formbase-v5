import {
  FIELD_TYPE_LABELS,
  SETTINGS_BY_TYPE,
  type EditorValues,
  type FieldSetting,
} from "@lib/forms/editorModel"
import { MAX_OPTIONS_PER_FIELD } from "@lib/forms/fieldSchemas"
import { IconPlus, IconPointer, IconTrash, IconX } from "@tabler/icons-react"
import { Button } from "@ui/button"
import { Checkbox } from "@ui/checkbox"
import { Field, FieldError, FieldLabel } from "@ui/field"
import { Input } from "@ui/input"
import { Switch } from "@ui/switch"
import {
  useFieldArray,
  useFormContext,
  useWatch,
  type FieldError as RhfFieldError,
} from "react-hook-form"

export const FieldConfigEmpty = ({ hasFields }: { hasFields: boolean }) => (
  <div className="rounded-xl border bg-card p-4">
    <div className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed p-6 text-center">
      <IconPointer className="size-6 text-muted-foreground" />
      <p className="text-sm font-medium">No field selected</p>
      <p className="text-xs text-muted-foreground">
        {hasFields
          ? "Select a field to edit its settings."
          : "Add a field from the left, then select it to edit its settings."}
      </p>
    </div>
  </div>
)

const FieldConfigPanel = ({
  index,
  onRemove,
}: {
  index: number
  onRemove: () => void
}) => {
  const { control, register, formState } = useFormContext<EditorValues>()
  const errors = formState.errors.fields?.[index]
  const type = useWatch({ control, name: `fields.${index}.type` })
  const shows = (s: FieldSetting) => SETTINGS_BY_TYPE[type].includes(s)
  const id = (name: string) => `fields-${index}-${name}`

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold">{FIELD_TYPE_LABELS[type]}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Remove field"
          className="text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <IconTrash />
        </Button>
      </div>

      <Field data-invalid={!!errors?.label}>
        <FieldLabel htmlFor={id("label")}>Label</FieldLabel>
        <Input
          id={id("label")}
          aria-invalid={!!errors?.label}
          {...register(`fields.${index}.label`)}
        />
        <FieldError errors={[errors?.label]} />
      </Field>

      <Field data-invalid={!!errors?.helperText}>
        <FieldLabel htmlFor={id("helper")}>Helper text</FieldLabel>
        <Input
          id={id("helper")}
          aria-invalid={!!errors?.helperText}
          {...register(`fields.${index}.helperText`)}
        />
        <FieldError errors={[errors?.helperText]} />
      </Field>

      {shows("placeholder") && (
        <Field data-invalid={!!errors?.placeholder}>
          <FieldLabel htmlFor={id("placeholder")}>Placeholder</FieldLabel>
          <Input
            id={id("placeholder")}
            aria-invalid={!!errors?.placeholder}
            {...register(`fields.${index}.placeholder`)}
          />
          <FieldError errors={[errors?.placeholder]} />
        </Field>
      )}

      {shows("maxLength") && (
        <Field data-invalid={!!errors?.maxLength}>
          <FieldLabel htmlFor={id("maxLength")}>Max length</FieldLabel>
          <Input
            id={id("maxLength")}
            inputMode="numeric"
            aria-invalid={!!errors?.maxLength}
            {...register(`fields.${index}.maxLength`)}
          />
          <FieldError errors={[errors?.maxLength]} />
        </Field>
      )}

      {(shows("min") || shows("max")) && (
        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={!!errors?.min}>
            <FieldLabel htmlFor={id("min")}>Min</FieldLabel>
            <Input
              id={id("min")}
              inputMode="decimal"
              aria-invalid={!!errors?.min}
              {...register(`fields.${index}.min`)}
            />
            <FieldError errors={[errors?.min]} />
          </Field>
          <Field data-invalid={!!errors?.max}>
            <FieldLabel htmlFor={id("max")}>Max</FieldLabel>
            <Input
              id={id("max")}
              inputMode="decimal"
              aria-invalid={!!errors?.max}
              {...register(`fields.${index}.max`)}
            />
            <FieldError errors={[errors?.max]} />
          </Field>
        </div>
      )}

      {shows("options") && (
        <OptionsEditor
          index={index}
          error={errors?.options as RhfFieldError | undefined}
        />
      )}

      <div className="flex flex-wrap gap-6">
        <RequiredToggle index={index} />
        {shows("allowOther") && <AllowOtherToggle index={index} />}
      </div>
    </div>
  )
}

const RequiredToggle = ({ index }: { index: number }) => {
  const { control, setValue } = useFormContext<EditorValues>()
  const checked = useWatch({ control, name: `fields.${index}.required` })
  return (
    <Field orientation="horizontal" className="w-auto">
      <Switch
        id={`fields-${index}-required`}
        checked={checked}
        onCheckedChange={(v) =>
          setValue(`fields.${index}.required`, v, { shouldDirty: true })
        }
      />
      <FieldLabel htmlFor={`fields-${index}-required`}>Required</FieldLabel>
    </Field>
  )
}

const AllowOtherToggle = ({ index }: { index: number }) => {
  const { control, setValue } = useFormContext<EditorValues>()
  const checked = useWatch({ control, name: `fields.${index}.allowOther` })
  return (
    <Field orientation="horizontal" className="w-auto">
      <Checkbox
        id={`fields-${index}-allowOther`}
        checked={checked}
        onCheckedChange={(v) =>
          setValue(`fields.${index}.allowOther`, v, { shouldDirty: true })
        }
      />
      <FieldLabel htmlFor={`fields-${index}-allowOther`}>
        Allow "Other" answer
      </FieldLabel>
    </Field>
  )
}

const OptionsEditor = ({
  index,
  error,
}: {
  index: number
  error?: RhfFieldError
}) => {
  const { control, register, formState } = useFormContext<EditorValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: `fields.${index}.options`,
    keyName: "_key",
  })
  const optionErrors = formState.errors.fields?.[index]?.options

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">Options</span>
      {fields.map((opt, i) => {
        const optError = Array.isArray(optionErrors)
          ? optionErrors[i]?.value
          : undefined
        return (
          <Field key={opt._key} data-invalid={!!optError}>
            <div className="flex items-center gap-2">
              <Input
                aria-label={`Option ${i + 1}`}
                aria-invalid={!!optError}
                {...register(`fields.${index}.options.${i}.value`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove option ${i + 1}`}
                disabled={fields.length <= 1}
                onClick={() => remove(i)}
              >
                <IconX />
              </Button>
            </div>
            <FieldError errors={[optError]} />
          </Field>
        )
      })}
      <FieldError errors={[error]} />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        disabled={fields.length >= MAX_OPTIONS_PER_FIELD}
        onClick={() => append({ value: "" })}
      >
        <IconPlus /> Add option
      </Button>
    </div>
  )
}

export default FieldConfigPanel
