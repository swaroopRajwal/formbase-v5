import { FormLabel } from "@components/shared/formLabel"
import type { ICommonFieldElementProps } from "@lib/types/shared.type"
import { formatDate } from "@lib/utils"
import { IconCalendar } from "@tabler/icons-react"
import { Button } from "@ui/button"
import { Calendar } from "@ui/calendar"
import { Field, FieldDescription } from "@ui/field"
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover"
import { cn } from "cn"
import { addDays } from "date-fns"
import { useState } from "react"
import type { DateRange } from "react-day-picker"

const DateRangeInput: React.FC<ICommonFieldElementProps> = ({
  field,
  disabled,
}) => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 20),
    to: addDays(new Date(new Date().getFullYear(), 0, 20), 20),
  })

  return (
    <Field className={cn(disabled ? "pointer-events-none" : "")}>
      <FormLabel htmlFor={field.id} isRequired={field.required}>
        {field.label}
      </FormLabel>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              id="date-picker-range"
              className="justify-start px-2.5 font-normal"
            >
              <IconCalendar data-icon="inline-start" />
              {date?.from ? (
                date.to ? (
                  <>
                    {}
                    {formatDate(date.from)} - {formatDate(date.to)}
                  </>
                ) : (
                  formatDate(date.from)
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
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

export default DateRangeInput
