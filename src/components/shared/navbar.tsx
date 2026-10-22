import ConfirmationDialog from "@components/shared/confirmationDialog"
import authClient from "@lib/auth/authClient"
import { getInitials } from "@lib/auth/getInitials"
import { TOAST_TYPES } from "@lib/constants/toast"
import useGetCurrentUser from "@lib/hooks/useGetCurrentUser"
import { IconLogout, IconSettings } from "@tabler/icons-react"
import { Link, useNavigate, useRouter } from "@tanstack/react-router"
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu"
import { toast } from "@ui/toast"
import { useState } from "react"

const Navbar = () => {
  const user = useGetCurrentUser()

  const router = useRouter()
  const navigate = useNavigate()

  const [isLogoutConfirmationOpen, setIsLogoutConfirmationOpen] =
    useState(false)

  const handleLogout = async () => {
    await authClient
      .signOut()
      .then(async () => {
        toast.add({ type: TOAST_TYPES.success, title: "Logged out" })
        await router.invalidate()
        await navigate({ to: "/login" })
      })
      .catch(() =>
        toast.add({ type: TOAST_TYPES.error, title: "Something went wrong" })
      )
  }

  return (
    <header className="border-b">
      <nav className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
        <Link to="/dashboard" className="text-lg font-semibold">
          Formbase
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="User menu"
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Avatar>
              {user.image && <AvatarImage src={user.image} alt={user.name} />}
              <AvatarFallback>
                {getInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex flex-col">
                <span className="font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link to="/settings" />}>
              <IconSettings />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                setIsLogoutConfirmationOpen(true)
              }}
            >
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
      <ConfirmationDialog
        open={isLogoutConfirmationOpen}
        onOpenChange={setIsLogoutConfirmationOpen}
        title="Are you sure you want to sign out?"
        description="You'll be redirected to the login page after signing out."
        confirmLabel="Sign Out"
        onConfirm={handleLogout}
      />
    </header>
  )
}

export default Navbar
