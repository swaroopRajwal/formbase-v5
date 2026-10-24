import type { ReactNode } from "react"
import {
  Outlet,
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router"
import appStyles from "../styles/app.css?url"
import { getSessionUser } from "@lib/auth/getSessionUser"
import { Toaster } from "@ui/toast"
import { TooltipProvider } from "@ui/tooltip"

export const Route = createRootRouteWithContext()({
  beforeLoad: async () => ({ user: await getSessionUser() }),
  head: () => ({
    links: [
      {
        href: appStyles,
        rel: "stylesheet",
      },
    ],
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
  }),
  shellComponent: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body className="dark">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
        <Scripts />
      </body>
    </html>
  )
}
