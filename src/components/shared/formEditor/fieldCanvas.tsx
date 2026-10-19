import type { EditorValues } from "@lib/forms/editorModel"
import { useDroppable } from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconAlertCircle,
  IconGripVertical,
  IconTrash,
} from "@tabler/icons-react"
import { Button } from "@ui/button"
import { FieldError } from "@ui/field"
import { cn } from "cn"
import { useFormContext, useWatch } from "react-hook-form"
import { CANVAS_ID } from "./dndIds"
import FieldPreview from "./fieldPreview"

const DropLine = () => (
  <div className="h-1 rounded-full bg-primary" aria-hidden />
)

type CardProps = {
  id: string
  index: number
  selected: boolean
  readOnly: boolean
  onSelect: () => void
  onRemove: () => void
}

/** The visual card; shared by the sortable item and the drag overlay. */
export const FieldCardBody = ({
  index,
  selected,
  readOnly,
  handleProps,
  onRemove,
}: Pick<CardProps, "index" | "selected" | "readOnly" | "onRemove"> & {
  handleProps?: React.ComponentProps<"button">
}) => {
  const { formState } = useFormContext<EditorValues>()
  const invalid = !!formState.errors.fields?.[index]

  return (
    <div
      className={cn(
        "group relative flex items-start gap-2 rounded-xl border bg-card p-4 transition-colors hover:border-foreground/30",
        selected &&
          "border-primary ring-2 ring-primary/30 hover:border-primary",
        invalid &&
          "border-destructive ring-destructive/20 hover:border-destructive"
      )}
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        disabled={readOnly}
        className="-ml-1 mt-0.5 flex size-6 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:invisible"
        onClick={(e) => e.stopPropagation()}
        {...handleProps}
      >
        <IconGripVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1">
        <FieldPreview index={index} />
        {invalid && (
          <span className="mt-2 flex items-center gap-1 text-xs text-destructive">
            <IconAlertCircle className="size-3.5" /> Needs attention
          </span>
        )}
      </div>
      {!readOnly && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Remove field"
          className="text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
        >
          <IconTrash />
        </Button>
      )}
    </div>
  )
}

const SortableCard = (props: CardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id, disabled: props.readOnly })

  return (
    <div
      ref={setNodeRef}
      data-field-index={props.index}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("outline-none", isDragging && "opacity-40")}
      tabIndex={0}
      aria-current={props.selected}
      onClick={props.onSelect}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && e.key === "Enter") props.onSelect()
      }}
    >
      <FieldCardBody {...props} handleProps={{ ...attributes, ...listeners }} />
    </div>
  )
}

type Props = {
  keys: string[]
  selectedKey: string | null
  readOnly: boolean
  /** Index a palette drag would insert at, or null when not dragging one. */
  dropIndex: number | null
  fieldsError: Parameters<typeof FieldError>[0]["errors"]
  onSelect: (key: string | null) => void
  onRemove: (index: number) => void
}

const FieldCanvas = ({
  keys,
  selectedKey,
  readOnly,
  dropIndex,
  fieldsError,
  onSelect,
  onRemove,
}: Props) => {
  const { control } = useFormContext<EditorValues>()
  const title = useWatch({ control, name: "title" })
  const description = useWatch({ control, name: "description" })
  const { setNodeRef } = useDroppable({ id: CANVAS_ID, disabled: readOnly })

  return (
    <div
      className="min-h-full px-4 py-8"
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest("[data-field-index]"))
          onSelect(null)
      }}
    >
      <div ref={setNodeRef} className="mx-auto flex max-w-2xl flex-col gap-3">
        <div className="mb-3 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">{title || "Untitled form"}</h1>
          {description.trim() && (
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        <SortableContext items={keys} strategy={verticalListSortingStrategy}>
          {keys.map((key, i) => (
            <div key={key} className="flex flex-col gap-3">
              {dropIndex === i && <DropLine />}
              <SortableCard
                id={key}
                index={i}
                selected={key === selectedKey}
                readOnly={readOnly}
                onSelect={() => onSelect(key)}
                onRemove={() => onRemove(i)}
              />
            </div>
          ))}
        </SortableContext>
        {dropIndex === keys.length && <DropLine />}

        {keys.length === 0 && dropIndex === null && (
          <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            No fields yet. Click or drag a field from the left to start.
          </div>
        )}
        <FieldError errors={fieldsError} />
      </div>
    </div>
  )
}

export default FieldCanvas
