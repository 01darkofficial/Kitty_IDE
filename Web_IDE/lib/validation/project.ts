import { z } from "zod"

export const projectSchema = z.object({
    name: z
        .string()
        .min(3)
        .max(50)
        .regex(/^[a-zA-Z0-9-\s]+$/),

    runtime: z.enum([
        "static",
        "node",
    ]),

    visibility: z.enum(["private", "public"]).default("private"),
})

export type ProjectInput = z.infer<typeof projectSchema>