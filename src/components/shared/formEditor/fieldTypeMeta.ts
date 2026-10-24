import type { FieldType } from "@lib/forms/fieldSchemas"
import {
  IconAlignLeft,
  IconCalendar,
  IconCalendarStats,
  IconCalendarTime,
  IconCircleDot,
  IconLink,
  IconListCheck,
  IconMail,
  IconNumber,
  IconSelector,
  IconSquareCheck,
  IconTextCaption,
  IconToggleRight,
  type Icon,
} from "@tabler/icons-react"

export const FIELD_TYPE_META: Record<
  FieldType,
  { icon: Icon; description: string }
> = {
  short: { icon: IconTextCaption, description: "Single line of text" },
  paragraph: { icon: IconAlignLeft, description: "Longer, multi-line text" },
  number: { icon: IconNumber, description: "Numeric values" },
  url: { icon: IconLink, description: "Collect a website URL" },
  email: { icon: IconMail, description: "Collect an email address" },
  radio: { icon: IconCircleDot, description: "Choose one option" },
  checkbox: { icon: IconSquareCheck, description: "Select multiple options" },
  switch: { icon: IconToggleRight, description: "Toggle on or off" },
  select: { icon: IconSelector, description: "Pick one from a dropdown" },
  multi_select: {
    icon: IconListCheck,
    description: "Pick several from a list",
  },
  date: { icon: IconCalendar, description: "Pick a single date" },
  datetime: {
    icon: IconCalendarTime,
    description: "Pick a date and time",
  },
  date_range: {
    icon: IconCalendarStats,
    description: "Pick a start and end date",
  },
}

export const FIELD_TYPE_GROUPS: { label: string; types: FieldType[] }[] = [
  { label: "Text", types: ["short", "paragraph", "number", "url", "email"] },
  {
    label: "Choice",
    types: ["radio", "checkbox", "switch", "select", "multi_select"],
  },
  { label: "Date & time", types: ["date", "datetime", "date_range"] },
]
