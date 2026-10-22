import ConfirmationDialog from "@components/shared/confirmationDialog"
import { CANVAS_ID, paletteType } from "@components/shared/formEditor/dndIds"
import EditorHeader from "@components/shared/formEditor/editorHeader"
import FieldCanvas, {
  FieldCardBody,
} from "@components/shared/formEditor/fieldCanvas"
import FieldConfigPanel, {
  FieldConfigEmpty,
} from "@components/shared/formEditor/fieldConfigPanel"
import FieldPalette, {
  PaletteChip,
} from "@components/shared/formEditor/fieldPalette"
import SettingsDialog from "@components/shared/formEditor/settingsDialog"
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { TOAST_TYPES } from "@lib/constants/toast"
import {
  blankField,
  dropIndexFor,
  editorResolver,
  invalidFieldIndexes,
  selectionAfterRemove,
  validateEditor,
  type EditorValues,
} from "@lib/forms/editorModel"
import { rowToEditorField } from "@lib/forms/fieldRows"
import { MAX_FIELDS_PER_FORM, type FieldType } from "@lib/forms/fieldSchemas"
import {
  changeFormStatus,
  getMyFormWithFields,
  saveForm,
} from "@lib/forms/formFns"
import type { LifecycleAction } from "@lib/forms/lifecycle"
import { getRouteApi, useBlocker, useRouter } from "@tanstack/react-router"
import { toast } from "@ui/toast"
import { cn } from "cn"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  FormProvider,
  useFieldArray,
  useForm,
  type FieldErrors,
  type Resolver,
} from "react-hook-form"

const routeApi = getRouteApi("/__protected/forms/$formId")

type LoadedForm = Awaited<ReturnType<typeof getMyFormWithFields>>

const toValues = (f: LoadedForm): EditorValues => ({
  title: f.title,
  description: f.description,
  fields: f.fields.map(rowToEditorField),
})

// Palette drags resolve against the card under the pointer (or the empty
// canvas); reordering drags only consider cards.
const collisionDetection: CollisionDetection = (args) => {
  if (paletteType(args.active.id)) {
    const within = pointerWithin(args)
    const cards = within.filter((c) => c.id !== CANVAS_ID)
    return cards.length ? cards : within
  }
  return closestCenter({
    ...args,
    droppableContainers: args.droppableContainers.filter(
      (c) => c.id !== CANVAS_ID
    ),
  })
}

const FormEditorPage = () => {
  const loaded = routeApi.useLoaderData()
  const router = useRouter()
  const [changingStatus, setChangingStatus] = useState(false)

  const onChangeStatus = async (action: LifecycleAction) => {
    setChangingStatus(true)
    try {
      await changeFormStatus({ data: { formId: loaded.id, action } })
      await router.invalidate()
      // Buttons are disabled while dirty, so resetting never loses edits.
      form.reset(
        toValues(await getMyFormWithFields({ data: { formId: loaded.id } }))
      )
    } catch (e) {
      toast.add({
        type: TOAST_TYPES.error,
        title: e instanceof Error ? e.message : "Could not change form status",
      })
    } finally {
      setChangingStatus(false)
    }
  }

  const form = useForm<EditorValues>({
    resolver: editorResolver as unknown as Resolver<EditorValues>,
    defaultValues: toValues(loaded),
  })
  const { errors, isSubmitting, isDirty } = form.formState
  const { fields, insert, remove, move } = useFieldArray({
    control: form.control,
    name: "fields",
    keyName: "_key",
  })
  const keys = fields.map((f) => f._key)

  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [drawer, setDrawer] = useState<"palette" | "config" | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const atCap = fields.length >= MAX_FIELDS_PER_FORM
  const selectedIndex = selectedKey ? keys.indexOf(selectedKey) : -1

  // Newly inserted Fields get new keys, so select by index once they render.
  const pendingSelect = useRef<number | null>(null)
  useEffect(() => {
    if (pendingSelect.current === null) return
    const key = keys[pendingSelect.current]
    pendingSelect.current = null
    if (key) setSelectedKey(key)
  })

  useEffect(() => {
    if (!selectedKey) return
    document
      .querySelector(`[data-field-index="${keys.indexOf(selectedKey)}"]`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" })
    // Only when the selection changes, not on every reorder.
  }, [selectedKey])

  const addField = useCallback(
    (type: FieldType, at: number = fields.length) => {
      if (fields.length >= MAX_FIELDS_PER_FORM) return
      pendingSelect.current = at
      insert(at, blankField(type))
      setDrawer(null)
    },
    [fields.length, insert]
  )

  const removeField = (index: number) => {
    const removed = form.getValues(`fields.${index}`)
    if (keys[index] === selectedKey)
      setSelectedKey(selectionAfterRemove(keys, index))
    remove(index)
    toast.add({
      type: TOAST_TYPES.info,
      title: "Field removed",
      actionProps: {
        children: "Undo",
        onClick: () => {
          pendingSelect.current = index
          insert(index, removed)
        },
      },
    })
  }

  const onSubmit = async (values: EditorValues) => {
    const result = validateEditor(values)
    if (!result.ok) return
    try {
      await saveForm({ data: { ...result.data, formId: loaded.id } })
      // Reload so newly created Fields pick up their ids.
      const fresh = await getMyFormWithFields({ data: { formId: loaded.id } })
      form.reset(toValues(fresh))
      toast.add({ type: TOAST_TYPES.success, title: "Form saved" })
    } catch (e) {
      toast.add({
        type: TOAST_TYPES.error,
        title: e instanceof Error ? e.message : "Could not save form",
      })
    }
  }

  const onInvalid = (errs: FieldErrors<EditorValues>) => {
    const invalid = invalidFieldIndexes(errs.fields)
    const count =
      invalid.length + (errs.title ? 1 : 0) + (errs.description ? 1 : 0)
    if (invalid.length) {
      setSelectedKey(keys[invalid[0]!] ?? null)
      setDrawer("config")
    } else if (errs.description && !errs.title) {
      setSettingsOpen(true)
    }
    toast.add({
      type: TOAST_TYPES.error,
      title: `Fix ${count || "the"} error${count === 1 ? "" : "s"} to save`,
    })
  }

  const submit = form.handleSubmit(onSubmit, onInvalid)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        void submit()
      } else if (e.key === "Escape" && !e.defaultPrevented) {
        const el = e.target as HTMLElement
        if (!/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) setSelectedKey(null)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  })

  // Warn before leaving with unsaved edits (in-app navigation and tab close).
  const blocker = useBlocker({
    shouldBlockFn: () => isDirty,
    enableBeforeUnload: isDirty,
    withResolver: true,
  })
  const leaving = useRef(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const dropIndexFromEvent = (e: DragMoveEvent | DragEndEvent) => {
    const { over, activatorEvent, delta } = e
    if (!over) return null
    if (over.id === CANVAS_ID) return fields.length
    const overIndex = keys.indexOf(String(over.id))
    if (overIndex < 0) return null
    const pointerY = (activatorEvent as PointerEvent).clientY + delta.y
    return dropIndexFor(overIndex, pointerY, over.rect.top, over.rect.height)
  }

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id))

  const onDragMove = (e: DragMoveEvent) => {
    if (!paletteType(e.active.id)) return
    const next = atCap ? null : dropIndexFromEvent(e)
    setDropIndex((prev) => (prev === next ? prev : next))
  }

  const onDragEnd = (e: DragEndEvent) => {
    const type = paletteType(e.active.id)
    if (type) {
      const at = dropIndexFromEvent(e)
      if (at !== null) addField(type, at)
    } else if (e.over && e.active.id !== e.over.id) {
      const from = keys.indexOf(String(e.active.id))
      const to = keys.indexOf(String(e.over.id))
      if (from >= 0 && to >= 0) move(from, to)
    }
    clearDrag()
  }

  const clearDrag = () => {
    setActiveId(null)
    setDropIndex(null)
  }

  const activePalette = activeId ? paletteType(activeId) : null
  const activeIndex = activeId && !activePalette ? keys.indexOf(activeId) : -1

  return (
    <FormProvider {...form}>
      <form
        className="flex h-screen flex-col overflow-hidden"
        onSubmit={submit}
        noValidate
      >
        <EditorHeader
          formId={loaded.id}
          status={loaded.status}
          publicId={loaded.publicId}
          changingStatus={changingStatus}
          onChangeStatus={onChangeStatus}
          fieldCount={fields.length}
          dirty={isDirty}
          saving={isSubmitting}
          onOpenSettings={() => setSettingsOpen(true)}
          onTogglePalette={() =>
            setDrawer((d) => (d === "palette" ? null : "palette"))
          }
        />

        <DndContext
          id="form-editor-dnd"
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={onDragStart}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
          onDragCancel={clearDrag}
        >
          <div className="relative flex min-h-0 flex-1">
            <aside
              className={cn(
                "w-72 shrink-0 overflow-y-auto border-r bg-background",
                drawer === "palette"
                  ? "absolute inset-y-0 left-0 z-10 shadow-xl lg:static lg:shadow-none"
                  : "hidden lg:block"
              )}
            >
              <FieldPalette atCap={atCap} onAdd={(t) => addField(t)} />
            </aside>

            <main className="min-w-0 flex-1 overflow-y-auto bg-muted/30">
              <FieldCanvas
                keys={keys}
                selectedKey={selectedKey}
                dropIndex={dropIndex}
                fieldsError={[errors.fields?.root ?? errors.fields]}
                onSelect={(k) => {
                  setSelectedKey(k)
                  if (k) setDrawer("config")
                  else setDrawer(null)
                }}
                onRemove={removeField}
              />
            </main>

            <aside
              className={cn(
                "w-80 shrink-0 overflow-y-auto border-l bg-background",
                drawer === "config"
                  ? "absolute inset-y-0 right-0 z-10 shadow-xl lg:static lg:shadow-none"
                  : "hidden lg:block"
              )}
            >
              {selectedIndex >= 0 ? (
                <FieldConfigPanel
                  key={`${selectedKey}:${selectedIndex}`}
                  index={selectedIndex}
                />
              ) : (
                <FieldConfigEmpty hasFields={fields.length > 0} />
              )}
            </aside>
          </div>

          <DragOverlay dropAnimation={null}>
            {activePalette && <PaletteChip type={activePalette} />}
            {activeIndex >= 0 && (
              <FieldCardBody
                index={activeIndex}
                selected={keys[activeIndex] === selectedKey}
                onRemove={() => {}}
              />
            )}
          </DragOverlay>
        </DndContext>

        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      </form>

      <ConfirmationDialog
        open={blocker.status === "blocked"}
        onOpenChange={(open) => {
          if (!open && blocker.status === "blocked" && !leaving.current)
            blocker.reset()
        }}
        title="Discard unsaved changes?"
        description="You have changes that haven't been saved. If you leave now, they'll be lost."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        destructive
        onConfirm={() => {
          leaving.current = true
          blocker.proceed?.()
        }}
      />
    </FormProvider>
  )
}

export default FormEditorPage
