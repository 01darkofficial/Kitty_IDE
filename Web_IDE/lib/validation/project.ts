import { z } from "zod"

export const projectSchema = z.object({
    name: z
        .string()
        .min(3)
        .max(50)
        .regex(/^[a-zA-Z0-9-\s]+$/),

    template: z.enum([
        "empty",
        "browser_vanilla",
        "browser_canvas",
        "node_basic",
        "node_express",
        "vite_vanilla"
    ]),

    language: z.enum(["javascript", "typescript"]),

    visibility: z.enum(["private", "public"]),
})

export type ProjectInput = z.infer<typeof projectSchema>