import { zodResolver } from "@hookform/resolvers/zod"
import { TOAST_TYPES } from "@lib/constants/toast"
import authClient from "@lib/auth/authClient"
import { getInitials } from "@lib/auth/getInitials"
import type { SignInMethod } from "@lib/auth/accountFns"
import { profileSchema, type ProfileValues } from "@lib/auth/profileSchema"
import useGetCurrentUser from "@lib/hooks/useGetCurrentUser"
import { getRouteApi, useRouter } from "@tanstack/react-router"
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar"
import { Button } from "@ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@ui/field"
import { Input } from "@ui/input"
import { Spinner } from "@ui/spinner"
import { toast } from "@ui/toast"
import { useForm } from "react-hook-form"

const routeApi = getRouteApi("/__protected/__shell/settings")

const SIGN_IN_METHOD_LABELS: Record<SignInMethod, string> = {
  google: "Google",
  password: "Email & password",
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

const ReadOnlyRow = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="flex flex-col gap-1">
    <dt className="text-sm text-muted-foreground">{label}</dt>
    <dd>{children}</dd>
  </div>
)

const AccountSettingsPage = () => {
  const { signInMethods, createdAt } = routeApi.useLoaderData()
  const user = useGetCurrentUser()
  const router = useRouter()

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name },
  })
  const { errors, isSubmitting } = form.formState

  const onSubmit = async (values: ProfileValues) => {
    try {
      const { error } = await authClient.updateUser({ name: values.name })
      if (error) throw new Error(error.message)
    } catch {
      toast.add({ type: TOAST_TYPES.error, title: "Could not save your name" })
      return
    }
    await router.invalidate()
    form.reset({ name: values.name })
    toast.add({ type: TOAST_TYPES.success, title: "Name updated" })
  }

  return (
    <section className="flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Account settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  {...form.register("name")}
                />
                <FieldError errors={[errors.name]} />
              </Field>
              <Button
                type="submit"
                className="self-start"
                disabled={isSubmitting || !form.formState.isDirty}
              >
                {isSubmitting && <Spinner />}
                Save
              </Button>
            </FieldGroup>
          </form>
          <dl className="flex flex-col gap-4">
            <ReadOnlyRow label="Profile picture">
              <Avatar size="lg">
                {user.image && <AvatarImage src={user.image} alt={user.name} />}
                <AvatarFallback>
                  {getInitials(user.name, user.email)}
                </AvatarFallback>
              </Avatar>
            </ReadOnlyRow>
            <ReadOnlyRow label="Email">{user.email}</ReadOnlyRow>
            <ReadOnlyRow label="Sign-in method">
              {signInMethods.length > 0
                ? signInMethods.map((m) => SIGN_IN_METHOD_LABELS[m]).join(", ")
                : "—"}
            </ReadOnlyRow>
            <ReadOnlyRow label="Member since">
              {formatDate(createdAt)}
            </ReadOnlyRow>
          </dl>
        </CardContent>
      </Card>
    </section>
  )
}

export default AccountSettingsPage
