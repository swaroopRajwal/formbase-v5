import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate, useRouter } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@components/ui/field"
import { Input } from "@components/ui/input"
import { Spinner } from "@components/ui/spinner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card"
import authClient from "@lib/auth/authClient"
import { GoogleButton, OrDivider } from "@components/shared/auth/googleButton"
import { PasswordInput } from "@components/shared/passwordInput"

const schema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
})
type Values = z.infer<typeof schema>

const LoginPage = () => {
  const router = useRouter()
  const navigate = useNavigate()
  const [formError, setFormError] = React.useState<string | null>(null)
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  })
  const { errors, isSubmitting } = form.formState

  async function onSubmit(values: Values) {
    setFormError(null)
    const { error } = await authClient.signIn.email(values)
    if (error) {
      setFormError(error.message || "Something went wrong")
      return
    }
    await router.invalidate()
    await navigate({ to: "/dashboard" })
  }

  return (
    <Card className="max-w-sm w-full mx-auto">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Login to manage your forms</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <GoogleButton disabled={isSubmitting} />
        <OrDivider />
        <form method="post" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                {...form.register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...form.register("password")}
              />
              <FieldError errors={[errors.password]} />
            </Field>
            {formError && <FieldError>{formError}</FieldError>}
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              Log in
            </Button>
          </FieldGroup>
        </form>
        <p className="text-center text-xs text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/" className="text-foreground underline underline-offset-4">
            Create new account
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

export default LoginPage
