import PageWrapper from "@components/shared/pageWrapper"
import { createFileRoute } from "@tanstack/react-router"

// Placeholder so the navbar's Settings link resolves; content lands in issue 02.
export const Route = createFileRoute("/__protected/__shell/settings")({
  component: () => (
    <PageWrapper>
      <h1 className="text-2xl font-semibold">Account settings</h1>
    </PageWrapper>
  ),
})
