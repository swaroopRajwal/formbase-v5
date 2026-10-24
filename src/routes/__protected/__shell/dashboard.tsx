import DashboardPage from "@components/pages/protected/dashboardPage"
import PageWrapper from "@components/shared/pageWrapper"
import { listMyForms } from "@lib/forms/formFns"
import { formsTableSearchSchema, pageCount } from "@lib/forms/formsTableSearch"
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/__protected/__shell/dashboard")({
  validateSearch: formsTableSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const result = await listMyForms({ data: deps })
    const lastPage = pageCount(result.total, deps.pageSize)
    // An out-of-range page (e.g. a stale URL) lands on the last page.
    if (deps.page > lastPage) {
      throw redirect({
        to: "/dashboard",
        search: { ...deps, page: lastPage },
        replace: true,
      })
    }
    return result
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageWrapper className="flex flex-col gap-6">
      <DashboardPage />
    </PageWrapper>
  )
}
