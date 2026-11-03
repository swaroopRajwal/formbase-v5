import { getRouteApi } from "@tanstack/react-router"
import FormsTable from "./formsTable"

const routeApi = getRouteApi("/__protected/dashboard")

const DashboardPage = () => {
  const forms = routeApi.useLoaderData()

  return (
    <div>
      <FormsTable forms={forms} />
    </div>
  )
}

export default DashboardPage
