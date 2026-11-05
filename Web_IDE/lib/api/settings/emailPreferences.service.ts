import { supabase } from "@/lib/supabase/supabaseClient"

export type EmailPreferences = {
    securityAlerts: boolean
    productEmails: boolean
}

export const defaultEmailPreferences: EmailPreferences = {
    securityAlerts: true,
    productEmails: true,
}

/** Load persisted preferences for the currently signed-in user's profile row. */
export async function getEmailPreferences(userId: string): Promise<EmailPreferences> {
    const { data, error } = await supabase
        .from("users")
        .select("security_alerts, product_emails")
        .eq("id", userId)
        .maybeSingle()

    if (error) throw error
    if (!data) return defaultEmailPreferences

    return {
        securityAlerts: data.security_alerts ?? true,
        productEmails: data.product_emails ?? true,
    }
}

/** Persist one preference. RLS must restrict updates to auth.uid() = id. */
export async function updateEmailPreference<K extends keyof EmailPreferences>(
    userId: string,
    field: K,
    value: EmailPreferences[K],
): Promise<void> {
    const column = field === "securityAlerts" ? "security_alerts" : "product_emails"

    const { data, error } = await supabase
        .from("users")
        .update({ [column]: value })
        .eq("id", userId)
        .select("id")
        .maybeSingle()

    if (error) throw error
    if (!data) {
        throw new Error(
            "Email preferences were not saved. Check that the profile exists and the users table allows the signed-in user to update their own row.",
        )
    }
}
