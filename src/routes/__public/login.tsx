import LoginPage from "@components/pages/public/loginPage"
import PageWrapper from "@components/shared/pageWrapper"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/__public/login")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageWrapper className="h-screen flex flex-col justify-center items-center">
      <LoginPage />
    </PageWrapper>
  )
}
