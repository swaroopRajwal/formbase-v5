import SubmissionsPage from "@components/pages/protected/submissionsPage"
import Navbar from "@components/shared/navbar"
import PageWrapper from "@components/shared/pageWrapper"
import { getMyFormSubmissions } from "@src/serverFunctions/submissions.api"
import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/__protected/forms/$formId_/submissions")(
  {
    loader: ({ params }) =>
      getMyFormSubmissions({ data: { formId: params.formId } }),
    notFoundComponent: () => (
      <PageWrapper className="flex flex-col gap-4" header={<Navbar />}>
        <h1 className="text-2xl font-semibold">Form not found</h1>
        <Link to="/dashboard" className="text-sm underline">
          Back to forms
        </Link>
      </PageWrapper>
    ),
    component: RouteComponent,
  }
)

function RouteComponent() {
  return (
    <PageWrapper header={<Navbar />}>
      <SubmissionsPage />
    </PageWrapper>
  )
}
