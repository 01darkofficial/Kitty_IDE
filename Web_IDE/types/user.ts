export type Profile = {
    id: string
    username: string
    avatar_url: string | null
    bio: string
    website: string
    visibility: "public" | "private"
}