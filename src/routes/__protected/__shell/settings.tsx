import AccountSettingsPage from "@components/pages/protected/accountSettingsPage"
import PageWrapper from "@components/shared/pageWrapper"
import { getAccountInfo } from "@lib/auth/accountFns"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/__protected/__shell/settings")({
  loader: () => getAccountInfo(),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageWrapper className="flex flex-col gap-6">
      <AccountSettingsPage />
    </PageWrapper>
  )
}
