import { FormLabel } from "@components/shared/formLabel"
import type { ICommonFieldElementProps } from "@lib/types/shared.type"
import { Field, FieldDescription } from "@ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select"
import { cn } from "cn"

// TODO: Replace Select with Combobox
const MultiSelectInput: React.FC<ICommonFieldElementProps> = ({
  field,
  disabled,
}) => {
  return (
    <Field className={cn(disabled ? "pointer-events-auto" : "")}>
      <FormLabel htmlFor={field.id} isRequired={field.required}>
        {field.label}
      </FormLabel>
      <Select multiple>
        <SelectTrigger id={field.id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectGroup>
            {field.options.map((i, index) => {
              const elementId = `${field.id}-${i}-${index}`
              return (
                <SelectItem key={elementId} value={i}>
                  {i}
                </SelectItem>
              )
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
      {field.helperText ? (
        <FieldDescription>{field.helperText}</FieldDescription>
      ) : (
        <></>
      )}
    </Field>
  )
}

export default MultiSelectInput
