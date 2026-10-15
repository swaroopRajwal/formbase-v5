import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

// Logged-in users never see the login / signup pages.
export const Route = createFileRoute("/__protected")({
  beforeLoad: ({ context }) => {
    if (!context.user) throw redirect({ to: "/" })
  },
  component: Outlet,
})
