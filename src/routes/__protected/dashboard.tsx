import DashboardPage from "@components/pages/protected/dashboardPage"
import Navbar from "@components/shared/navbar"
import PageWrapper from "@components/shared/pageWrapper"
import { getAllForms } from "@src/serverFunctions/forms.api"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/__protected/dashboard")({
  loader: () => getAllForms(),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageWrapper className="flex flex-col gap-6" header={<Navbar />}>
      <DashboardPage />
    </PageWrapper>
  )
}
