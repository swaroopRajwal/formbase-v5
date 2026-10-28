import ConfirmationDialog from "@components/shared/confirmationDialog"
import { TOAST_TYPES } from "@lib/constants/toast"
import {
  PAGE_SIZES,
  STATUS_FILTERS,
  nextSort,
  pageCount,
  type FormsTableSearch,
  type SortKey,
  type StatusFilter,
} from "@lib/forms/formsTableSearch"
import { deleteForm, type listMyForms } from "@lib/forms/formFns"
import {
  IconArrowDown,
  IconArrowUp,
  IconArrowsSort,
  IconCopy,
  IconDots,
  IconEdit,
  IconListDetails,
  IconTrash,
} from "@tabler/icons-react"
import {
  getRouteApi,
  useNavigate,
  useRouter,
  useRouterState,
} from "@tanstack/react-router"
import {
  createColumnHelper,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"
import { Badge } from "@ui/badge"
import { Button } from "@ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/table"
import { toast } from "@ui/toast"
import { Input } from "@ui/input"
import { cn } from "cn"
import { useEffect, useState } from "react"

type FormRow = Awaited<ReturnType<typeof listMyForms>>["rows"][number]

const routeApi = getRouteApi("/__protected/__shell/dashboard")

const features = tableFeatures({ rowSortingFeature, rowPaginationFeature })
const helper = createColumnHelper<typeof features, FormRow>()

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })

const copyPublicLink = async (publicId: string) => {
  try {
    await navigator.clipboard.writeText(
      `${window.location.origin}/f/${publicId}`
    )
    toast.add({ type: TOAST_TYPES.success, title: "Link copied" })
  } catch {
    toast.add({ type: TOAST_TYPES.error, title: "Could not copy link" })
  }
}

const RowActions = ({ row }: { row: FormRow }) => {
  const navigate = useNavigate()
  const router = useRouter()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" aria-label="Form actions" />
          }
        >
          <IconDots />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() =>
              navigate({ to: "/forms/$formId", params: { formId: row.id } })
            }
          >
            <IconEdit />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              navigate({
                to: "/forms/$formId/submissions",
                params: { formId: row.id },
              })
            }
          >
            <IconListDetails />
            View submissions
          </DropdownMenuItem>
          {row.status === "published" && row.publicId && (
            <DropdownMenuItem
              onClick={() => copyPublicLink(row.publicId || "")}
            >
              <IconCopy />
              Copy public link
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setConfirmingDelete(true)}
          >
            <IconTrash />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmationDialog
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        title="Delete this form?"
        description={`"${row.title}" and all of its submissions will be permanently deleted. This can't be undone.`}
        confirmLabel="Delete form"
        destructive
        onConfirm={async () => {
          await deleteForm({ data: { formId: row.id } })
          await router.invalidate()
          toast.add({ type: TOAST_TYPES.success, title: "Form deleted" })
        }}
      />
    </>
  )
}

const columns = helper.columns([
  helper.accessor("title", {
    id: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-medium">{row.original.title}</span>
        <Badge
          variant={row.original.status === "published" ? "success" : "warning"}
        >
          {row.original.status === "published" ? "Published" : "Unpublished"}
        </Badge>
      </div>
    ),
  }),
  helper.accessor((r) => r.createdAt, {
    id: "createdAt",
    header: "Created",
    cell: ({ getValue }) => formatDate(getValue()),
  }),
  helper.accessor((r) => r.updatedAt, {
    id: "updatedAt",
    header: "Last updated",
    cell: ({ getValue }) => formatDate(getValue()),
  }),
  helper.accessor("fieldCount", { id: "fields", header: "Fields" }),
  helper.accessor("submissionCount", {
    id: "submissions",
    header: "Submissions",
  }),
  helper.display({
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      // Keeps menu clicks from also opening the editor.
      <div onClick={(e) => e.stopPropagation()}>
        <RowActions row={row.original} />
      </div>
    ),
  }),
])

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: "All statuses",
  published: "Published",
  unpublished: "Unpublished",
}

const SEARCH_DEBOUNCE_MS = 300

const FilterBar = ({
  search,
  update,
}: {
  search: FormsTableSearch
  update: (next: Partial<FormsTableSearch>) => unknown
}) => {
  const [text, setText] = useState(search.q)

  // Follows the URL when it changes elsewhere (Back, Clear filters).
  useEffect(() => setText(search.q), [search.q])

  useEffect(() => {
    const q = text.trim()
    if (q === search.q) return
    const timer = setTimeout(() => update({ q, page: 1 }), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [text, search.q, update])

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        type="search"
        aria-label="Search forms by title"
        placeholder="Search by title"
        className="max-w-xs"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Select
        value={search.status}
        onValueChange={(v) => update({ status: v as StatusFilter, page: 1 })}
      >
        <SelectTrigger aria-label="Filter by status" className="w-40">
          <SelectValue>{(v: StatusFilter) => STATUS_LABELS[v]}</SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {STATUS_FILTERS.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

const SortIcon = ({ dir }: { dir: false | "asc" | "desc" }) =>
  dir === "asc" ? (
    <IconArrowUp className="size-4" />
  ) : dir === "desc" ? (
    <IconArrowDown className="size-4" />
  ) : (
    <IconArrowsSort className="size-4 text-muted-foreground" />
  )

const FormsTable = () => {
  const { rows, total } = routeApi.useLoaderData()
  const search = routeApi.useSearch()
  const navigate = useNavigate({ from: "/dashboard" })
  const isLoading = useRouterState({ select: (s) => s.status === "pending" })

  const table = useTable({
    features,
    columns,
    data: rows,
    getRowId: (r) => r.id,
    manualSorting: true,
    manualPagination: true,
    rowCount: total,
    state: {
      sorting: [{ id: search.sort, desc: search.dir === "desc" }],
      pagination: { pageIndex: search.page - 1, pageSize: search.pageSize },
    },
  })

  const update = (next: Partial<FormsTableSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...next }) })

  const pages = pageCount(total, search.pageSize)

  return (
    <div className="flex flex-col gap-4">
      <FilterBar search={search} update={update} />
      {total === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border py-10">
          <p className="text-muted-foreground">No forms match your filters</p>
          <Button
            variant="outline"
            onClick={() => update({ q: "", status: "all", page: 1 })}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "rounded-lg border transition-opacity",
            isLoading && "opacity-50"
          )}
        >
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => {
                    const id = header.column.id
                    const sortable = id !== "actions"
                    const dir = search.sort === id && search.dir
                    return (
                      <TableHead
                        key={header.id}
                        aria-sort={
                          dir === "asc"
                            ? "ascending"
                            : dir === "desc"
                              ? "descending"
                              : undefined
                        }
                      >
                        {sortable ? (
                          <button
                            type="button"
                            className="flex items-center gap-1"
                            onClick={() =>
                              update({
                                ...nextSort(search, id as SortKey),
                                page: 1,
                              })
                            }
                          >
                            <table.FlexRender header={header} />
                            <SortIcon dir={dir} />
                          </button>
                        ) : (
                          <table.FlexRender header={header} />
                        )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() =>
                    navigate({
                      to: "/forms/$formId",
                      params: { formId: row.original.id },
                    })
                  }
                >
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {pages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Select
            value={String(search.pageSize)}
            onValueChange={(v) =>
              update({
                pageSize: Number(v) as FormsTableSearch["pageSize"],
                page: 1,
              })
            }
          >
            <SelectTrigger size="sm" aria-label="Rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} per page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {search.page} of {pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={search.page <= 1}
              onClick={() => update({ page: search.page - 1 })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={search.page >= pages}
              onClick={() => update({ page: search.page + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default FormsTable
