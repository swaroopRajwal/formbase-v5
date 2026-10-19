import type { FieldType } from "@lib/forms/fieldSchemas"

export const CANVAS_ID = "canvas"
const PALETTE_PREFIX = "palette:"

export const paletteId = (type: FieldType) => `${PALETTE_PREFIX}${type}`

export const paletteType = (id: string | number): FieldType | null =>
  typeof id === "string" && id.startsWith(PALETTE_PREFIX)
    ? (id.slice(PALETTE_PREFIX.length) as FieldType)
    : null
