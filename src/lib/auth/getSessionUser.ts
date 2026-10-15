import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "./index.ts"
import type { ISessionUser } from "@lib/types/user.type.ts"

// Resolved once per navigation in the root route's beforeLoad.
export const getSessionUser = createServerFn({ method: "GET" }).handler(
  async (): Promise<ISessionUser | null> => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() })
    if (!session) return null
    const { id, name, email, image } = session.user
    return { id, name, email, image: image ?? null }
  }
)
