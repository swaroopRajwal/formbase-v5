import ConfirmationDialog from "@components/shared/confirmationDialog"
import authClient from "@lib/auth/authClient"
import { TOAST_TYPES } from "@lib/constants/toast"
import useGetCurrentUser from "@lib/hooks/useGetCurrentUser"
import { useNavigate, useRouter } from "@tanstack/react-router"
import { Button } from "@ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/card"
import { toast } from "@ui/toast"
import { useState } from "react"

const DashboardPage = () => {
  const user = useGetCurrentUser()

  const router = useRouter()
  const navigate = useNavigate()

  const [isLogoutConfirmationOpen, setIsLogoutConfirmationOpen] =
    useState(false)

  const handleLogout = async () => {
    await authClient
      .signOut()
      .then(async () => {
        ;(toast.add({
          type: TOAST_TYPES.success,
          title: "Logged out",
        }),
          await router.invalidate(),
          navigate({
            to: "/login",
          }))
      })
      .catch(() =>
        toast.add({
          type: TOAST_TYPES.error,
          title: "Something went wrong",
        })
      )
  }

  return (
    <>
      <Card className="max-w-sm w-full mx-auto">
        <CardHeader>
          <CardTitle>Protected Page</CardTitle>
          <CardTitle>Logged in as - {user.name}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-end">
          <Button onClick={() => setIsLogoutConfirmationOpen(true)}>
            Sign Out
          </Button>
        </CardContent>
      </Card>
      <ConfirmationDialog
        open={isLogoutConfirmationOpen}
        onOpenChange={setIsLogoutConfirmationOpen}
        title="Are you sure you want to sign out?"
        description="You'll be redirected to the login page after signing out."
        confirmLabel="Sign Out"
        onConfirm={handleLogout}
      />
    </>
  )
}

export default DashboardPage
