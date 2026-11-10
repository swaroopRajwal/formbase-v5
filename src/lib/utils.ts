import { format } from "date-fns"

export { cn } from "cn"

export const formatDate = (date: Date) => {
  return format(date, "dd MMM, yyyy")
}
