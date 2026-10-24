import FormsTable from "@components/shared/formsTable"
import { TOAST_TYPES } from "@lib/constants/toast"
import { createBlankForm } from "@lib/forms/formFns"
import { IconPlus } from "@tabler/icons-react"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { Button } from "@ui/button"
import { toast } from "@ui/toast"
import { useState } from "react"

const routeApi = getRouteApi("/__protected/__shell/dashboard")

const DashboardPage = () => {
  const { hasAnyForms } = routeApi.useLoaderData()
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
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My forms</h2>
        <Button onClick={handleCreateForm} disabled={isCreating}>
          <IconPlus />
          New form
        </Button>
      </div>
      {hasAnyForms ? (
        <FormsTable />
      ) : (
        <p className="text-muted-foreground">
          You have no forms yet. Create one to get started.
        </p>
      )}
    </section>
  )
}

export default DashboardPage
