import AccountSettingsPage from "@components/pages/protected/accountSettingsPage"
import Navbar from "@components/shared/navbar"
import PageWrapper from "@components/shared/pageWrapper"
import { getAccountInfo } from "@lib/auth/accountFns"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/__protected/settings")({
  loader: () => getAccountInfo(),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageWrapper className="flex flex-col gap-6" header={<Navbar />}>
      <AccountSettingsPage />
    </PageWrapper>
  )
}
