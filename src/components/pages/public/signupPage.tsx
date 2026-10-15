import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate, useRouter } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@components/ui/field"
import { Input } from "@components/ui/input"
import { Spinner } from "@components/ui/spinner"
import authClient from "@lib/auth/authClient"
import { GoogleButton, OrDivider } from "@components/shared/auth/googleButton"
import { PasswordInput } from "@components/shared/passwordInput"
import type { ErrorType } from "@lib/types/shared.type"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card"

function isDuplicateEmail(error: ErrorType) {
  if (!error) return false
  const code = error.code ?? ""
  const message = (error.message ?? "").toLowerCase()
  return (
    code === "USER_ALREADY_EXISTS" ||
    code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" ||
    message.includes("already exists")
  )
}

function signupErrorMessage(error: ErrorType) {
  if (isDuplicateEmail(error))
    return "An account with this email already exists"
  return error?.message || "Something went wrong, please try again"
}

const schema = z.object({
  name: z.string().trim().min(1, "Enter your name"),
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})
type Values = z.infer<typeof schema>

const SignupPage = () => {
  const router = useRouter()
  const navigate = useNavigate()
  const [formError, setFormError] = React.useState<{
    message: string
    duplicate: boolean
  } | null>(null)
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  })
  const { errors, isSubmitting } = form.formState

  async function onSubmit(values: Values) {
    setFormError(null)
    const { error } = await authClient.signUp.email(values)
    if (error) {
      setFormError({
        message: signupErrorMessage(error),
        duplicate: isDuplicateEmail(error),
      })
      return
    }
    await router.invalidate()
    await navigate({ to: "/dashboard" })
  }

  return (
    <Card className="max-w-sm w-full mx-auto">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Start building forms</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <GoogleButton disabled={isSubmitting} />
        <OrDivider />
        <form method="post" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                autoComplete="name"
                placeholder="Your name"
                aria-invalid={!!errors.name}
                {...form.register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>
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
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                {...form.register("password")}
              />
              <FieldError errors={[errors.password]} />
            </Field>
            {formError && (
              <FieldError>
                {formError.message}
                {formError.duplicate && (
                  <>
                    {" "}
                    <Link to="/login" className="underline underline-offset-4">
                      Log in
                    </Link>
                  </>
                )}
              </FieldError>
            )}
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              Create account
            </Button>
          </FieldGroup>
        </form>
        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-foreground underline underline-offset-4"
          >
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

export default SignupPage
