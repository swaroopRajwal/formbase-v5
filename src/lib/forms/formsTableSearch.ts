import { z } from "zod"

export const SORT_KEYS = [
  "title",
  "createdAt",
  "updatedAt",
  "fields",
  "submissions",
] as const
export const PAGE_SIZES = [10, 25, 50] as const
export const STATUS_FILTERS = ["all", "published", "unpublished"] as const

export type SortKey = (typeof SORT_KEYS)[number]
export type SortDir = "asc" | "desc"
export type StatusFilter = (typeof STATUS_FILTERS)[number]

export const DEFAULT_SORT: SortKey = "updatedAt"
export const DEFAULT_DIR: SortDir = "desc"

// Invalid values fall back to their defaults rather than failing the route.
export const formsTableSearchSchema = z.object({
  sort: z.enum(SORT_KEYS).catch(DEFAULT_SORT).default(DEFAULT_SORT),
  dir: z.enum(["asc", "desc"]).catch(DEFAULT_DIR).default(DEFAULT_DIR),
  page: z.coerce.number().int().min(1).catch(1).default(1),
  pageSize: z.coerce
    .number()
    .pipe(z.union([z.literal(10), z.literal(25), z.literal(50)]))
    .catch(10)
    .default(10),
  q: z.string().trim().max(100).catch("").default(""),
  status: z.enum(STATUS_FILTERS).catch("all").default("all"),
})

export type FormsTableSearch = z.infer<typeof formsTableSearchSchema>

export const pageCount = (total: number, pageSize: number) =>
  Math.max(1, Math.ceil(total / pageSize))

type SortState = Pick<FormsTableSearch, "sort" | "dir">

// Header click cycle: ascending, then descending, then back to the default
// sort. When the column is already the default sort, the cycle starts at
// ascending.
export const nextSort = (current: SortState, column: SortKey): SortState => {
  if (current.sort !== column) return { sort: column, dir: "asc" }
  if (current.dir === "asc") return { sort: column, dir: "desc" }
  // Descending on the default column is already the default state.
  return column === DEFAULT_SORT
    ? { sort: column, dir: "asc" }
    : { sort: DEFAULT_SORT, dir: DEFAULT_DIR }
}
