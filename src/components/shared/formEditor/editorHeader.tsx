import { TOAST_TYPES } from "@lib/constants/toast"
import { MAX_FIELDS_PER_FORM } from "@lib/forms/fieldSchemas"
import type { EditorValues } from "@lib/forms/editorModel"
import { availableAction, type LifecycleAction } from "@lib/forms/lifecycle"
import {
  IconArrowLeft,
  IconCheck,
  IconFileSpreadsheet,
  IconLink,
  IconSettings,
} from "@tabler/icons-react"
import { Link } from "@tanstack/react-router"
import { Button, buttonVariants } from "@ui/button"
import { Input } from "@ui/input"
import { Spinner } from "@ui/spinner"
import { toast } from "@ui/toast"
import { cn } from "cn"
import { useEffect, useRef, useState } from "react"
import { Controller, useFormContext } from "react-hook-form"
import AppTooltip from "../appTooltip"

const STATUS_STYLES: Record<string, string> = {
  unpublished: "bg-muted text-muted-foreground",
  published: "bg-emerald-500/15 text-emerald-500",
}

type Props = {
  formId: string
  status: "unpublished" | "published"
  publicId: string | null
  changingStatus: boolean
  onChangeStatus: (action: LifecycleAction) => void
  fieldCount: number
  dirty: boolean
  saving: boolean
  onOpenSettings: () => void
}

const EditorHeader = ({
  formId,
  status,
  publicId,
  changingStatus,
  onChangeStatus,
  fieldCount,
  dirty,
  saving,
  onOpenSettings,
}: Props) => {
  const { control, formState } = useFormContext<EditorValues>()
  const [copied, setCopied] = useState(false)
  const available = availableAction(status)
  const copyTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(copyTimer.current), [])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/f/${publicId}`
      )
    } catch {
      toast.add({ type: TOAST_TYPES.error, title: "Could not copy link" })
      return
    }
    setCopied(true)
    clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setCopied(false), 2000)
  }

  return (
    <header className="sticky top-0 z-20 border-b bg-background">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-2 px-6">
        <Link
          to="/dashboard"
          aria-label="Back to forms"
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <IconArrowLeft />
        </Link>

        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <Input
              {...field}
              aria-label="Form title"
              aria-invalid={!!formState.errors.title}
              placeholder="Untitled form"
              className="h-8 max-w-sm min-w-0 flex-1 border-transparent bg-transparent text-base font-medium hover:border-input"
            />
          )}
        />
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
            STATUS_STYLES[status]
          )}
        >
          {status}
        </span>

        <div className="ml-auto flex items-center gap-3">
          {dirty && (
            <span className="text-xs text-muted-foreground">
              Unsaved changes
            </span>
          )}
          <AppTooltip message="View Submissions">
            <Link
              to="/forms/$formId/submissions"
              params={{ formId }}
              className={buttonVariants({ variant: "outline", size: "icon" })}
              aria-label="View Submissions"
            >
              <IconFileSpreadsheet />
            </Link>
          </AppTooltip>
          {status === "published" && publicId && (
            <AppTooltip message="Copy Link">
              <Button
                size="icon"
                variant="outline"
                onClick={copyLink}
                aria-label="Copy Link"
              >
                {copied ? <IconCheck /> : <IconLink />}
              </Button>
            </AppTooltip>
          )}
          <AppTooltip message="Form Settings">
            <Button
              variant="outline"
              size="icon"
              aria-label="Form settings"
              onClick={onOpenSettings}
            >
              <IconSettings />
            </Button>
          </AppTooltip>
          <Button
            type="button"
            variant="outline"
            disabled={changingStatus || dirty}
            title={dirty ? "Save your changes first" : undefined}
            onClick={() => onChangeStatus(available.action)}
          >
            {changingStatus && <Spinner />}
            {available.label}
          </Button>
          <Button type="submit" disabled={!dirty || saving}>
            {saving && <Spinner />}
            Save
          </Button>
        </div>
      </div>
    </header>
  )
}

export default EditorHeader
