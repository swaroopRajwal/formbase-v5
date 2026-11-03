import { auth } from "@lib/auth"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { redirect } from "@tanstack/react-router"

export const getActiveUser = async () => {
  const session = await auth.api.getSession({ headers: getRequestHeaders() })
  if (!session) throw redirect({ to: "/login" })
  return session.user
}
