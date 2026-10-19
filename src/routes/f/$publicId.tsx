import PublicFormPage from "@components/pages/public/publicFormPage"
import PageWrapper from "@components/shared/pageWrapper"
import { getPublicForm } from "@lib/forms/formFns"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/f/$publicId")({
  loader: ({ params }) =>
    getPublicForm({ data: { publicId: params.publicId } }),
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData?.title ?? "Form" }],
  }),
  notFoundComponent: () => (
    <PageWrapper className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Form not found</h1>
      <p className="text-sm text-muted-foreground">
        This form doesn't exist or isn't available right now.
      </p>
    </PageWrapper>
  ),
  component: RouteComponent,
})

function RouteComponent() {
  const { publicId } = Route.useParams()
  return <PublicFormPage form={Route.useLoaderData()} publicId={publicId} />
}
