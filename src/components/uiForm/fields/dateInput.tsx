import { FormLabel } from "@components/shared/formLabel"
import type { ICommonFieldElementProps } from "@lib/types/shared.type"
import { formatDate } from "@lib/utils"
import { Button } from "@ui/button"
import { Calendar } from "@ui/calendar"
import { Field, FieldDescription } from "@ui/field"
import { Input } from "@ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover"
import { cn } from "cn"
import { useState } from "react"

const DateInput: React.FC<ICommonFieldElementProps> = ({ field, disabled }) => {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)

  return (
    <Field className={cn(disabled ? "pointer-events-none" : "")}>
      <FormLabel htmlFor={field.id} isRequired={field.required}>
        {field.label}
      </FormLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              id="date"
              className="justify-start font-normal"
            >
              {date ? formatDate(date) : "Select date"}
            </Button>
          }
        />
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            defaultMonth={date}
            captionLayout="dropdown"
            endMonth={new Date(2127, 11)}
            onSelect={(v) => {
              setDate(v)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
      {field.helperText ? (
        <FieldDescription>{field.helperText}</FieldDescription>
      ) : (
        <></>
      )}
    </Field>
  )
}

export default DateInput
