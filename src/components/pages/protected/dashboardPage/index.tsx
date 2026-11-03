import { getRouteApi, useNavigate } from "@tanstack/react-router"
import FormsTable from "./formsTable"
import { IconPlus } from "@tabler/icons-react"
import { Button } from "@ui/button"
import { useState } from "react"
import { TOAST_TYPES } from "@lib/constants/toast"
import { toast } from "@ui/toast"
import { createBlankForm } from "@src/serverFunctions/forms.api"

const routeApi = getRouteApi("/__protected/dashboard")

const DashboardPage = () => {
  const forms = routeApi.useLoaderData()

  const navigate = useNavigate()

  const [isCreating, setIsCreating] = useState(false)

  const handleCreateForm = async () => {
    if (isCreating) return
    setIsCreating(true)
    try {
      const created = await createBlankForm()
      await navigate({ to: "/forms/$formId", params: { formId: created.id } })
    } catch {
      toast.add({ type: TOAST_TYPES.error, title: "Could not create form" })
      setIsCreating(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My forms</h2>
        <Button onClick={handleCreateForm} disabled={isCreating}>
          <IconPlus />
          New form
        </Button>
      </div>
      <FormsTable forms={forms} />
    </div>
  )
}

export default DashboardPage
