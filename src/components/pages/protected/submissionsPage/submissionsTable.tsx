import { formatDate } from "@lib/utils"
import type { getMyFormSubmissions } from "@src/serverFunctions/submissions.api"
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/table"
import SubmissionDrawer from "./submissionDrawer"

export interface ISubmissionsTableProps {
  submissions: Awaited<ReturnType<typeof getMyFormSubmissions>>["submissions"]
}

const features = tableFeatures({})
const colHelper = createColumnHelper<
  typeof features,
  ISubmissionsTableProps["submissions"][number]
>()

const cols = colHelper.columns([
  colHelper.accessor("createdAt", {
    id: "createdAt",
    header: "Submitted at",
    cell: ({ row }) => formatDate(row.original.createdAt),
  }),
  // colHelper.accessor("updatedAt", {
  //   id: "updatedAt",
  //   header: "Last Updated",
  //   cell: ({ row }) => formatDate(row.original.updatedAt),
  // }),
  // colHelper.accessor("fieldCount", {
  //   id: "fieldCount",
  //   header: "Fields",
  // }),
  // colHelper.accessor("submissionCount", {
  //   id: "submissionCount",
  //   header: "Submissions",
  // }),
])

const SubmissionsTable: React.FC<ISubmissionsTableProps> = ({
  submissions,
}) => {
  const table = useTable({
    columns: [
      ...cols,
      colHelper.display({
        id: "view",
        header: "",
        cell: ({ row }) => <SubmissionDrawer submission={row.original} />,
      }),
    ],
    data: submissions,
    features,
  })

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
    </div>
  )
}

export default SubmissionsTable
