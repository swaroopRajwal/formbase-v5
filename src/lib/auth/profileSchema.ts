import { z } from "zod"

export const NAME_MAX_LENGTH = 50

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your name")
    .max(
      NAME_MAX_LENGTH,
      `Name must be ${NAME_MAX_LENGTH} characters or fewer`
    ),
})
export type ProfileValues = z.infer<typeof profileSchema>
