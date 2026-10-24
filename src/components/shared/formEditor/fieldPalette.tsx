import { FIELD_TYPE_LABELS } from "@lib/forms/editorModel"
import { MAX_FIELDS_PER_FORM, type FieldType } from "@lib/forms/fieldSchemas"
import { useDraggable } from "@dnd-kit/core"
import { cn } from "cn"
import { paletteId } from "./dndIds"
import { FIELD_TYPE_GROUPS, FIELD_TYPE_META } from "./fieldTypeMeta"

type ItemProps = {
  type: FieldType
  disabled: boolean
  onAdd: (type: FieldType) => void
}

export const PaletteChip = ({ type }: { type: FieldType }) => {
  const { icon: Icon } = FIELD_TYPE_META[type]
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-popover px-3 py-2 text-sm font-medium shadow-lg">
      <Icon className="size-4" />
      {FIELD_TYPE_LABELS[type]}
    </div>
  )
}

const PaletteItem = ({ type, disabled, onAdd }: ItemProps) => {
  const { icon: Icon, description } = FIELD_TYPE_META[type]
  const { setNodeRef, listeners, isDragging } = useDraggable({
    id: paletteId(type),
    disabled,
  })

  return (
    // Pointer drag only: Enter / Space on the button adds the Field instead.
    <button
      ref={setNodeRef}
      type="button"
      disabled={disabled}
      onClick={() => onAdd(type)}
      onPointerDown={
        listeners?.onPointerDown as React.PointerEventHandler | undefined
      }
      className={cn(
        "flex w-full touch-none flex-col items-start gap-1 rounded-lg border bg-card p-3 text-left transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
        isDragging && "opacity-40"
      )}
    >
      <span className="flex items-center gap-2 text-sm font-medium">
        <Icon className="size-4 shrink-0" />
        {FIELD_TYPE_LABELS[type]}
      </span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </button>
  )
}

type Props = {
  atCap: boolean
  onAdd: (type: FieldType) => void
}

const FieldPalette = ({ atCap, onAdd }: Props) => (
  <div className="flex flex-col gap-3">
    {atCap && (
      <p className="text-xs text-muted-foreground">
        Max {MAX_FIELDS_PER_FORM} fields reached
      </p>
    )}
    <div className="grid grid-cols-2 gap-2">
      {FIELD_TYPE_GROUPS.flatMap((g) => g.types).map((t) => (
        <PaletteItem key={t} type={t} disabled={atCap} onAdd={onAdd} />
      ))}
    </div>
  </div>
)

export default FieldPalette
