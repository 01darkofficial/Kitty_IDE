
import { z } from "zod"

export const emailSetupSchema = z
    .object({
        email: z.string().trim().email("Enter a valid email address."),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters."),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    })

export type EmailSetupForm = z.infer<typeof emailSetupSchema>
