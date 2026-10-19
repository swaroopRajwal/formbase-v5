import type { EditorValues } from "@lib/forms/editorModel"
import { Button } from "@ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog"
import { Field, FieldError, FieldLabel } from "@ui/field"
import { Input } from "@ui/input"
import { Textarea } from "@ui/textarea"
import { Controller, useFormContext } from "react-hook-form"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Edits the same form values as the header; the header Save persists them.
const SettingsDialog = ({ open, onOpenChange }: Props) => {
  const { control, register, formState } = useFormContext<EditorValues>()
  const { errors } = formState

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Form settings</DialogTitle>
          <DialogDescription>
            Changes are saved with the rest of the form.
          </DialogDescription>
        </DialogHeader>
        <fieldset className="flex flex-col gap-4">
          <Field data-invalid={!!errors.title}>
            <FieldLabel htmlFor="settings-title">Title</FieldLabel>
            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <Input
                  id="settings-title"
                  aria-invalid={!!errors.title}
                  {...field}
                />
              )}
            />
            <FieldError errors={[errors.title]} />
          </Field>
          <Field data-invalid={!!errors.description}>
            <FieldLabel htmlFor="settings-description">Description</FieldLabel>
            <Textarea
              id="settings-description"
              rows={4}
              aria-invalid={!!errors.description}
              {...register("description")}
            />
            <FieldError errors={[errors.description]} />
          </Field>
        </fieldset>
        <DialogFooter>
          <DialogClose render={<Button />}>Done</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SettingsDialog
