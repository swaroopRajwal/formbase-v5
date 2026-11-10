import type { ICommonFieldElementProps } from "@lib/types/shared.type"
import { Field, FieldLabel, FieldDescription } from "@ui/field"
import { Switch } from "@ui/switch"
import { cn } from "cn"

const SwitchInput: React.FC<ICommonFieldElementProps> = ({
  field,
  disabled,
}) => {
  return (
    // data-invalid for error
    <Field className={cn(disabled ? "pointer-events-none" : "")}>
      <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
      {/* set aria-invalid for error */}
      <Switch id="switch-terms" />
      {field.helperText ? (
        <FieldDescription>{field.helperText}</FieldDescription>
      ) : (
        <></>
      )}
    </Field>
  )
}

export default SwitchInput
