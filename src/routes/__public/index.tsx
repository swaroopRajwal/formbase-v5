import SignupPage from "@components/pages/public/signupPage"
import PageWrapper from "@components/shared/pageWrapper"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/__public/")({
  head: () => ({
    meta: [
      {
        title: "Signup",
      },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageWrapper className="h-screen flex flex-col justify-center items-center">
      <SignupPage />
    </PageWrapper>
  )
}
