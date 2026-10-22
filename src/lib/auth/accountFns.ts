import db from "@database"
import { account } from "@database/schema"
import { auth } from "@lib/auth"
import { redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { eq } from "drizzle-orm"

export type SignInMethod = "google" | "password"

// Read-only facts for the Account settings page: sign-in methods come from the
// linked accounts, "member since" from the user's createdAt.
export const getAccountInfo = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() })
    if (!session) throw redirect({ to: "/login" })

    const linked = await db
      .select({ providerId: account.providerId })
      .from(account)
      .where(eq(account.userId, session.user.id))

    const providers = new Set(linked.map((a) => a.providerId))
    const signInMethods: SignInMethod[] = []
    if (providers.has("google")) signInMethods.push("google")
    if (providers.has("credential")) signInMethods.push("password")

    return {
      signInMethods,
      createdAt: session.user.createdAt.toISOString(),
    }
  }
)
