import dayjs from "dayjs"

export { cn } from "cn"

export const formatDate = (date: Date) => {
  return dayjs(date).format("DD MMM, YYYY")
}
