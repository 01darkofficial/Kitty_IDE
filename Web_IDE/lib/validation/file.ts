import { z } from "zod"

export const updateFileSchema = z.object({

    id: z
        .string()
        .uuid("Invalid file id"),

    content: z
        .string()
        .max(2_000_000, "File too large")

})

export type UpdateFileInput = z.infer<typeof updateFileSchema>

export const createNodeSchema = z.object({
    name: z.string().min(1),
    type: z.enum(["file", "folder"]),
    parent_id: z.string().uuid().nullable().optional(),
    content: z.string().optional()
})