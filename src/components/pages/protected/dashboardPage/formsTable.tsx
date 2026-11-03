import { formatDate } from "@lib/utils"
import { deleteForm, type getAllForms } from "@src/serverFunctions/forms.api"
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"
import { Badge } from "@ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/table"
import FormsActions from "./formsActions"
import { useState } from "react"
import ConfirmationDialog from "@components/shared/confirmationDialog"
import { toast } from "@ui/toast"
import { TOAST_TYPES } from "@lib/constants/toast"
import { useRouter } from "@tanstack/react-router"

export interface IFormsTableProps {
  forms: Awaited<ReturnType<typeof getAllForms>>
}

const features = tableFeatures({})
const colHelper = createColumnHelper<
  typeof features,
  IFormsTableProps["forms"][number]
>()

const cols = colHelper.columns([
  colHelper.accessor("title", {
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
  colHelper.accessor("createdAt", {
    id: "createdAt",
    header: "Created",
    cell: ({ row }) => formatDate(row.original.createdAt),
  }),
  colHelper.accessor("updatedAt", {
    id: "updatedAt",
    header: "Last Updated",
    cell: ({ row }) => formatDate(row.original.updatedAt),
  }),
  colHelper.accessor("fieldCount", {
    id: "fieldCount",
    header: "Fields",
  }),
  colHelper.accessor("submissionCount", {
    id: "submissionCount",
    header: "Submissions",
  }),
])

const FormsTable: React.FC<IFormsTableProps> = ({ forms }) => {
  const router = useRouter()

  const [deleteFormData, setDeleteFormData] = useState<
    IFormsTableProps["forms"][number] | null
  >(null)

  const table = useTable({
    columns: [
      ...cols,
      colHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <FormsActions form={row.original} setDeleteForm={setDeleteFormData} />
        ),
      }),
    ],
    data: forms,
    features,
  })

  const handleDelete = async () => {
    if (!deleteFormData) return

    try {
      await deleteForm({
        data: { formId: deleteFormData.id },
      })
      await router.invalidate()
      setDeleteFormData(null)
      toast.add({
        type: TOAST_TYPES.success,
        title: "Form deleted",
      })
    } catch (error) {
      toast.add({
        type: TOAST_TYPES.error,
        title: "Form delete failed",
        description: "Something went wrong",
      })
    }
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead key={header.id}>
                  <table.FlexRender header={header} />
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getAllCells().map((cell) => (
                <TableCell key={cell.id}>
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ConfirmationDialog
        open={!!deleteFormData?.id}
        onOpenChange={(v) => {
          if (!v) setDeleteFormData(null)
        }}
        title={`Delete ${deleteFormData?.title} form?`}
        description="All of the submissions will be deleted and this action cannot be undone."
        confirmLabel="Delete form"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default FormsTable
