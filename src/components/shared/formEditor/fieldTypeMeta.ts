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
  short: { icon: IconTextCaption, description: "Single-line text answer" },
  paragraph: { icon: IconAlignLeft, description: "Multi-line text answer" },
  number: { icon: IconNumber, description: "Numeric answer" },
  url: { icon: IconLink, description: "Web address answer" },
  email: { icon: IconMail, description: "Email address answer" },
  radio: { icon: IconCircleDot, description: "Pick exactly one option" },
  checkbox: { icon: IconSquareCheck, description: "Pick one or more options" },
  switch: { icon: IconToggleRight, description: "On/off answer" },
  select: { icon: IconSelector, description: "Dropdown, pick one option" },
  multi_select: {
    icon: IconListCheck,
    description: "Dropdown, pick many options",
  },
  date: { icon: IconCalendar, description: "A single calendar date" },
  datetime: {
    icon: IconCalendarTime,
    description: "Date and time, typed naturally",
  },
  date_range: { icon: IconCalendarStats, description: "Start and end dates" },
}

export const FIELD_TYPE_GROUPS: { label: string; types: FieldType[] }[] = [
  { label: "Text", types: ["short", "paragraph", "number", "url", "email"] },
  {
    label: "Choice",
    types: ["radio", "checkbox", "switch", "select", "multi_select"],
  },
  { label: "Date & time", types: ["date", "datetime", "date_range"] },
]
