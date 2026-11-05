import { supabase } from "@/lib/supabase/supabaseClient"
import { updateAvatarUrl, type SavedProfile } from "@/lib/api/settings/profile.service"

const AVATAR_BUCKET = "avatars"
const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const AVATAR_EXTENSIONS: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}

export function getOwnAvatarPath(
    avatarUrl: string | null | undefined,
    userId: string
): string | null {
    if (!avatarUrl) return null

    try {
        const url = new URL(avatarUrl)
        if (url.hostname !== "kiyolvnvwbqzgudimxoa.supabase.co") return null

        const prefix = "/storage/v1/object/public/avatars/"
        if (!url.pathname.startsWith(prefix)) return null

        const path = decodeURIComponent(url.pathname.slice(prefix.length))
        return path.startsWith(`${userId}/`) ? path : null
    } catch {
        return null
    }
}

export async function uploadAndSaveAvatar(
    userId: string,
    file: File,
    previousAvatarUrl: string | null | undefined
): Promise<{ avatarUrl: string; profile: SavedProfile; cleanupWarning?: string }> {
    const extension = AVATAR_EXTENSIONS[file.type]
    if (!extension) throw new Error("Choose a JPG, PNG, or WebP image.")
    if (file.size > MAX_AVATAR_BYTES) throw new Error("Image must be 2 MB or smaller.")

    const filePath = `${userId}/${Date.now()}.${extension}`
    const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(filePath, file, {
            contentType: file.type,
            cacheControl: "3600",
            upsert: false,
        })

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath)
    const avatarUrl = data.publicUrl

    let profile: SavedProfile
    try {
        profile = await updateAvatarUrl(userId, avatarUrl)
    } catch (error) {
        const { error: cleanupError } = await supabase.storage.from(AVATAR_BUCKET).remove([filePath])
        if (cleanupError) console.error("Avatar cleanup failed:", cleanupError)
        throw error
    }

    const previousPath = getOwnAvatarPath(previousAvatarUrl, userId)
    const newPath = getOwnAvatarPath(profile.avatar_url, userId)
    if (previousPath && previousPath !== newPath) {
        const { error } = await supabase.storage.from(AVATAR_BUCKET).remove([previousPath])
        if (error) {
            console.error("Old avatar cleanup failed:", error)
            return { avatarUrl, profile, cleanupWarning: "Avatar updated, but the previous image could not be removed." }
        }
    }

    return { avatarUrl, profile }
}
