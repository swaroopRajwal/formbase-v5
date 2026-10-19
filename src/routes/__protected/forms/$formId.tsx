import PageWrapper from "@components/shared/pageWrapper"
import { getMyForm } from "@lib/forms/formFns"
import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/__protected/forms/$formId")({
  loader: ({ params }) => getMyForm({ data: { formId: params.formId } }),
  notFoundComponent: () => (
    <PageWrapper className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Form not found</h1>
      <Link to="/dashboard" className="text-sm underline">
        Back to forms
      </Link>
    </PageWrapper>
  ),
  component: RouteComponent,
})

// Placeholder until the field editor lands.
function RouteComponent() {
  const form = Route.useLoaderData()
  return (
    <PageWrapper className="flex flex-col gap-4">
      <Link to="/dashboard" className="text-sm underline">
        Back to forms
      </Link>
      <h1 className="text-2xl font-semibold">{form.title}</h1>
    </PageWrapper>
  )
}
