
import { supabase } from "@/lib/supabase/supabaseClient"

export type OAuthProvider = "google" | "github"

export async function getLinkedProviders(): Promise<string[]> {
    const { data, error } = await supabase.auth.getUserIdentities()

    if (error) throw error

    return [
        ...new Set(
            data.identities.map((identity) => identity.provider)
        ),
    ]
}

export async function linkOAuthProvider(provider: OAuthProvider) {
    const { error } = await supabase.auth.linkIdentity({
        provider,
        options: {
            redirectTo: `${window.location.origin}/app/settings`,
        },
    })

    if (error) throw error
}

export async function addEmailPassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
        password,
        data: {
            has_password_login: true,
        },
    })

    if (error) throw error

    return data.user
}
