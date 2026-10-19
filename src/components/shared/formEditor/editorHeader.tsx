import { MAX_FIELDS_PER_FORM } from "@lib/forms/fieldSchemas"
import type { EditorValues } from "@lib/forms/editorModel"
import {
  IconArrowLeft,
  IconLayoutSidebar,
  IconSettings,
} from "@tabler/icons-react"
import { Link } from "@tanstack/react-router"
import { Button, buttonVariants } from "@ui/button"
import { Input } from "@ui/input"
import { Spinner } from "@ui/spinner"
import { cn } from "cn"
import { Controller, useFormContext } from "react-hook-form"

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-emerald-500/15 text-emerald-500",
  closed: "bg-amber-500/15 text-amber-500",
}

type Props = {
  status: string
  fieldCount: number
  readOnly: boolean
  dirty: boolean
  saving: boolean
  onOpenSettings: () => void
  onTogglePalette: () => void
}

const EditorHeader = ({
  status,
  fieldCount,
  readOnly,
  dirty,
  saving,
  onOpenSettings,
  onTogglePalette,
}: Props) => {
  const { control, formState } = useFormContext<EditorValues>()

  return (
    <header className="z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-3">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle fields panel"
        className="lg:hidden"
        onClick={onTogglePalette}
      >
        <IconLayoutSidebar />
      </Button>
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
            disabled={readOnly}
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
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Unsaved changes
          </span>
        )}
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {fieldCount} / {MAX_FIELDS_PER_FORM} fields
        </span>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Form settings"
          onClick={onOpenSettings}
        >
          <IconSettings />
        </Button>
        <Button type="submit" disabled={readOnly || !dirty || saving}>
          {saving && <Spinner />}
          Save
        </Button>
      </div>
    </header>
  )
}

export default EditorHeader
