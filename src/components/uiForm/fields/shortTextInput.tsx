import { FormLabel } from "@components/shared/formLabel"
import type { ICommonFieldElementProps } from "@lib/types/shared.type"
import { Field, FieldDescription } from "@ui/field"
import { Input } from "@ui/input"
import { cn } from "cn"

const ShortTextInput: React.FC<ICommonFieldElementProps> = ({
  field,
  disabled,
}) => {
  return (
    <Field className={cn(disabled ? "pointer-events-none" : "")}>
      <FormLabel htmlFor={field.id} isRequired={field.required}>
        {field.label}
      </FormLabel>
      <Input id={field.id} placeholder={field.placeholder} />
      {field.helperText ? (
        <FieldDescription>{field.helperText}</FieldDescription>
      ) : (
        <></>
      )}
    </Field>
  )
}

export default ShortTextInput
