import DashboardPage from "@components/pages/protected/dashboardPage"
import PageWrapper from "@components/shared/pageWrapper"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/__protected/dashboard")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageWrapper className="h-screen flex flex-col justify-center items-center">
      <DashboardPage />
    </PageWrapper>
  )
}
