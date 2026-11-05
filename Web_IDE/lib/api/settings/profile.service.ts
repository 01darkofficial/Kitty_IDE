import { supabase } from "@/lib/supabase/supabaseClient"

export type SavedProfile = {
    id: string
    username: string
    avatar_url: string | null
    bio: string
    website: string
    visibility: "public" | "private"
}

export async function updateProfileRecord(
    userId: string,
    values: Pick<SavedProfile, "username" | "bio" | "website" | "visibility">
): Promise<SavedProfile> {
    const { data, error } = await supabase
        .from("users")
        .update(values)
        .eq("id", userId)
        .select("id, username, avatar_url, bio, website, visibility")
        .single()

    if (error) {
        if (error.code === "23505") {
            throw new Error("That username is already taken.")
        }
        throw error
    }

    return data as SavedProfile
}

export async function updateDisplayName(displayName: string) {
    const { data, error } = await supabase.auth.updateUser({
        data: { full_name: displayName },
    })

    if (error) throw error
    if (!data.user) throw new Error("Display name was saved, but the user session could not be refreshed.")

    return data.user
}

export async function updateAvatarUrl(userId: string, avatarUrl: string): Promise<SavedProfile> {
    const { data, error } = await supabase
        .from("users")
        .update({ avatar_url: avatarUrl })
        .eq("id", userId)
        .select("id, username, avatar_url, bio, website, visibility")
        .single()

    if (error) throw error
    return data as SavedProfile
}

export async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
}
