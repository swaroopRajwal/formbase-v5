import * as React from "react"
import { toast } from "@components/ui/toast"
import { Button } from "@components/ui/button"
import { Spinner } from "@components/ui/spinner"
import { TOAST_TYPES } from "@lib/constants/toast"
import GoogleIcon from "../googleIcon"
import authClient from "@lib/auth/authClient"

export function GoogleButton({ disabled }: { disabled?: boolean }) {
  const [pending, setPending] = React.useState(false)

  async function onClick() {
    setPending(true)
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    })
    // On success the browser is redirected to Google, so we only land here on failure.
    if (error) {
      console.log(error)
      setPending(false)
      toast.add({
        type: TOAST_TYPES.error,
        description: "Couldn't start Google sign in, please try again",
      })
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="w-full"
      disabled={disabled || pending}
      onClick={onClick}
    >
      {pending ? <Spinner /> : <GoogleIcon />}
      Continue with Google
    </Button>
  )
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <div className="h-px flex-1 bg-border" />
      or
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}
