import { FormLabel } from "@components/shared/formLabel"
import type { ICommonFieldElementProps } from "@lib/types/shared.type"
import { Field, FieldDescription } from "@ui/field"
import { Input } from "@ui/input"
import { cn } from "cn"

const NumberInput: React.FC<ICommonFieldElementProps> = ({
  field,
  disabled,
}) => {
  return (
    <Field className={cn(disabled ? "pointer-events-auto" : "")}>
      <FormLabel htmlFor={field.id} isRequired={field.required}>
        {field.label}
      </FormLabel>
      <Input type="number" id={field.id} placeholder={field.placeholder} />
      {field.helperText ? (
        <FieldDescription>{field.helperText}</FieldDescription>
      ) : (
        <></>
      )}
    </Field>
  )
}

export default NumberInput
