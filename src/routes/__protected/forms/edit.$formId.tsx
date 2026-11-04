import EditFormPage from "@components/pages/protected/editFormPage"
import Navbar from "@components/shared/navbar"
import PageWrapper from "@components/shared/pageWrapper"
import { getMyFormWithFields } from "@src/serverFunctions/forms.api"
import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/__protected/forms/edit/$formId")({
  loader: ({ params }) =>
    getMyFormWithFields({ data: { formId: params.formId } }),
  notFoundComponent: () => (
    <PageWrapper className="flex flex-col gap-4" header={<Navbar />}>
      <h1 className="text-2xl font-semibold">Form not found</h1>
      <Link to="/dashboard" className="text-sm underline">
        Back to forms
      </Link>
    </PageWrapper>
  ),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageWrapper>
      <EditFormPage />
    </PageWrapper>
  )
}
