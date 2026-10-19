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
        "flex w-full touch-none items-center gap-3 rounded-lg border bg-card p-2.5 text-left transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
        isDragging && "opacity-40"
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-sm font-medium">{FIELD_TYPE_LABELS[type]}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </span>
    </button>
  )
}

type Props = {
  disabled: boolean
  atCap: boolean
  onAdd: (type: FieldType) => void
}

const FieldPalette = ({ disabled, atCap, onAdd }: Props) => (
  <div className="flex flex-col gap-5 p-4">
    <div className="flex flex-col gap-1">
      <h2 className="text-sm font-semibold">Fields</h2>
      <p className="text-xs text-muted-foreground">
        {atCap
          ? `Max ${MAX_FIELDS_PER_FORM} fields reached`
          : "Click or drag a field into your form"}
      </p>
    </div>
    {FIELD_TYPE_GROUPS.map((g) => (
      <div key={g.label} className="flex flex-col gap-2">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {g.label}
        </h3>
        {g.types.map((t) => (
          <PaletteItem
            key={t}
            type={t}
            disabled={disabled || atCap}
            onAdd={onAdd}
          />
        ))}
      </div>
    ))}
  </div>
)

export default FieldPalette
