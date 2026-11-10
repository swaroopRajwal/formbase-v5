import { FormLabel } from "@components/shared/formLabel"
import type { ICommonFieldElementProps } from "@lib/types/shared.type"
import { Field, FieldDescription } from "@ui/field"
import { Input } from "@ui/input"
import { cn } from "cn"

const TimeInput: React.FC<ICommonFieldElementProps> = ({ field, disabled }) => {
  return (
    <Field className={cn(disabled ? "pointer-events-none" : "")}>
      <FormLabel htmlFor={field.id} isRequired={field.required}>
        {field.label}
      </FormLabel>
      <Input
        step={1}
        type="time"
        id={field.id}
        placeholder={field.placeholder}
        defaultValue="10:30:00"
        className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
      />
      {field.helperText ? (
        <FieldDescription>{field.helperText}</FieldDescription>
      ) : (
        <></>
      )}
    </Field>
  )
}

export default TimeInput
