import SubmissionsPage from "@components/pages/protected/submissionsPage"
import PageWrapper from "@components/shared/pageWrapper"
import { getMySubmissions } from "@lib/forms/formFns"
import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/__protected/forms/$formId_/submissions")(
  {
    loader: ({ params }) =>
      getMySubmissions({ data: { formId: params.formId } }),
    notFoundComponent: () => (
      <PageWrapper className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Form not found</h1>
        <Link to="/dashboard" className="text-sm underline">
          Back to forms
        </Link>
      </PageWrapper>
    ),
    component: () => (
      <PageWrapper className="flex flex-col gap-6 max-w-none">
        <SubmissionsPage />
      </PageWrapper>
    ),
  }
)
