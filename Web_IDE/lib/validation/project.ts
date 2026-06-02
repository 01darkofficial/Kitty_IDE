import { z } from "zod"

export const projectSchema = z.discriminatedUnion(
    "runtime",
    [
        z.object({
            name: z
                .string()
                .min(3)
                .max(50)
                .regex(/^[a-zA-Z0-9-\s]+$/),

            runtime: z.literal("static"),

            visibility: z
                .enum(["private", "public"])
                .default("private"),
        }),

        z.object({
            name: z
                .string()
                .min(3)
                .max(50)
                .regex(/^[a-zA-Z0-9-\s]+$/),

            runtime: z.literal("node"),

            runtime_env: z.object({
                node: z.string(),
                pnpm: z.string()
            }),

            visibility: z
                .enum(["private", "public"])
                .default("private"),
        })
    ]
)

export type ProjectInput = z.infer<typeof projectSchema>