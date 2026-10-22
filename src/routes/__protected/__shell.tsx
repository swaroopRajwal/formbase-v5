import Navbar from "@components/shared/navbar"
import { Outlet, createFileRoute } from "@tanstack/react-router"

// Shared shell (navbar) for the Creator's home pages: /dashboard, /settings.
export const Route = createFileRoute("/__protected/__shell")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}
