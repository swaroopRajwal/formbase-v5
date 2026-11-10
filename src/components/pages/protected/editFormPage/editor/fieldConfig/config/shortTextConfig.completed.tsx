import { zodResolver } from "@hookform/resolvers/zod"
import type { ICommonFieldConfigProps } from "@lib/types/shared.type"
import { Field, FieldGroup, FieldLabel } from "@ui/field"
import { Input } from "@ui/input"
import { Switch } from "@ui/switch"
import { Controller, useForm } from "react-hook-form"
import z from "zod"

const formSchema = z.object({
  label: z.string(),
  helperText: z.string(),
  required: z.boolean(),
  placeholder: z.string(),
})

const ShortTextConfig: React.FC<ICommonFieldConfigProps> = ({ fieldData }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: fieldData.label,
      helperText: fieldData.helperText,
      required: fieldData.required,
      placeholder: fieldData.placeholder,
    },
  })

  return (
    <form>
      <FieldGroup>
        <Controller
          control={form.control}
          name="label"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Label</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
              />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="helperText"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Helper Text</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
              />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="placeholder"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Placeholder</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
              />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="required"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Required</FieldLabel>
              <Switch aria-invalid={fieldState.invalid} id={field.name} />
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  )
}

export default ShortTextConfig
