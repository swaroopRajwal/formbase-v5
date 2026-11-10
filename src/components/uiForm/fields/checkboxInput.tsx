import { FormLegend } from "@components/shared/formLegend"
import type { ICommonFieldElementProps } from "@lib/types/shared.type"
import { Checkbox } from "@ui/checkbox"
import {
  FieldSet,
  FieldDescription,
  FieldLabel,
  FieldGroup,
  Field,
} from "@ui/field"
import { cn } from "cn"

const CheckboxInput: React.FC<ICommonFieldElementProps> = ({
  field,
  disabled,
}) => {
  return (
    <FieldSet className={cn(disabled ? "pointer-events-none" : "")}>
      <FormLegend isRequired={field.required}>{field.label}</FormLegend>
      <FieldGroup className="gap-3">
        {field.options.map((i, index) => {
          const elementId = `${field.id}-${i}-${index}`
          return (
            <Field orientation="horizontal" key={elementId}>
              <Checkbox id={elementId} name={i} />
              <FieldLabel htmlFor={elementId} className="font-normal">
                {i}
              </FieldLabel>
            </Field>
          )
        })}
      </FieldGroup>
      {field.helperText ? (
        <FieldDescription>{field.helperText}</FieldDescription>
      ) : (
        <></>
      )}
    </FieldSet>
  )
}

export default CheckboxInput
