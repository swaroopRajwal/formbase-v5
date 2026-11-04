import { getRouteApi } from "@tanstack/react-router"
import SubmissionsTable from "./submissionsTable"

const routeApi = getRouteApi("/__protected/forms/$formId_/submissions")

const SubmissionsPage = () => {
  const { form, submissions } = routeApi.useLoaderData()

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Submissions for - {form.title}</h2>
      <SubmissionsTable submissions={submissions} />
    </div>
  )
}

export default SubmissionsPage
