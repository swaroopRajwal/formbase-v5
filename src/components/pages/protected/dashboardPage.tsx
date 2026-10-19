import { TOAST_TYPES } from "@lib/constants/toast"
import { createBlankForm } from "@lib/forms/formFns"
import { Link, getRouteApi, useNavigate } from "@tanstack/react-router"
import { Button } from "@ui/button"
import { toast } from "@ui/toast"
import { useState } from "react"

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
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My forms</h2>
        <Button onClick={handleCreateForm} disabled={isCreating}>
          New form
        </Button>
      </div>
      {forms.length === 0 ? (
        <p className="text-muted-foreground">
          You have no forms yet. Create one to get started.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {forms.map((f) => (
            <li key={f.id}>
              <Link
                to="/forms/$formId"
                params={{ formId: f.id }}
                className="flex items-center justify-between rounded-md border p-3 hover:bg-muted"
              >
                <span>{f.title}</span>
                <span className="text-sm capitalize text-muted-foreground">
                  {f.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default DashboardPage
