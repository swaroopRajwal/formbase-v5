import { FormLegend } from "@components/shared/formLegend"
import type { ICommonFieldElementProps } from "@lib/types/shared.type"
import { Field, FieldDescription, FieldLabel, FieldSet } from "@ui/field"
import { RadioGroup, RadioGroupItem } from "@ui/radio-group"
import { cn } from "cn"

const RadioInput: React.FC<ICommonFieldElementProps> = ({
  field,
  disabled,
}) => {
  return (
    <FieldSet className={cn(disabled ? "pointer-events-none" : "")}>
      <FormLegend isRequired={field.required}>{field.label}</FormLegend>
      <RadioGroup>
        {field.options.map((i, index) => {
          const elementId = `${field.id}-${i}-${index}`
          return (
            // set data-invalid true to show red border etc for error state
            <Field key={elementId} orientation="horizontal">
              {/* set aria-invalid true for error */}
              <RadioGroupItem value={i} id={elementId} />
              <FieldLabel htmlFor={elementId} className="font-normal">
                {i}
              </FieldLabel>
            </Field>
          )
        })}
      </RadioGroup>
      {field.helperText ? (
        <FieldDescription>{field.helperText}</FieldDescription>
      ) : (
        <></>
      )}
    </FieldSet>
  )
}

export default RadioInput
