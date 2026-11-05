import { z } from "zod"

export const profileSchema = z.object({
    name: z.string().trim().min(1, "Display name is required.").max(80, "Display name must be 80 characters or fewer."),
    username: z.string().trim().min(3, "Username must be at least 3 characters.").max(30, "Username must be 30 characters or fewer.").regex(/^[a-zA-Z0-9_]+$/, "Use only letters, numbers, and underscores."),
    website: z.string().trim().refine((value) => {
        if (!value) return true
        try {
            const url = new URL(value)
            return ["http:", "https:"].includes(url.protocol) && url.hostname.includes(".") && !/\s/.test(value)
        } catch {
            return false
        }
    }, "Enter a valid website URL, including https://."),
    bio: z.string().trim().max(300, "Bio must be 300 characters or fewer."),
    visibility: z.enum(["public", "private"]),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
