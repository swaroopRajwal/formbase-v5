import DashboardPage from "@components/pages/protected/dashboardPage"
import PageWrapper from "@components/shared/pageWrapper"
import { listMyForms } from "@lib/forms/formFns"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/__protected/dashboard")({
  loader: () => listMyForms(),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageWrapper className="flex flex-col gap-6">
      <DashboardPage />
    </PageWrapper>
  )
}
