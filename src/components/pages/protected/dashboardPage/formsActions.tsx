import { Button } from "@ui/button"
import {
  IconDots,
  IconEdit,
  IconLink,
  IconListDetails,
  IconTrash,
} from "@tabler/icons-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "@ui/toast"
import { TOAST_TYPES } from "@lib/constants/toast"
import type { IFormsTableProps } from "./formsTable"

interface IFormsActionsProps {
  form: IFormsTableProps["forms"][number]
  setDeleteForm: (v: IFormsTableProps["forms"][number]) => void
}

const FormsActions: React.FC<IFormsActionsProps> = ({
  form,
  setDeleteForm,
}) => {
  const navigate = useNavigate()

  const handleEditClick = () => {
    navigate({
      to: "/forms/$formId",
      params: { formId: form.id },
    })
  }

  const handleSubmissionClick = () => {
    navigate({
      to: "/forms/$formId/submissions",
      params: { formId: form.id },
    })
  }

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/f/${form.publicId}`
      )
      toast.add({ type: TOAST_TYPES.success, title: "Link copied" })
    } catch {
      toast.add({ type: TOAST_TYPES.error, title: "Could not copy link" })
    }
  }

  const handleDeleteClick = () => setDeleteForm(form)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Form Actions" />
        }
      >
        <IconDots />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleEditClick}>
          <IconEdit />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSubmissionClick}>
          <IconListDetails />
          Submissions
        </DropdownMenuItem>
        {form.status === "published" && (
          <DropdownMenuItem onClick={handleCopyClick}>
            <IconLink />
            Copy Link
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          variant="destructive"
          onClick={handleDeleteClick}
          disabled
        >
          <IconTrash />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default FormsActions
