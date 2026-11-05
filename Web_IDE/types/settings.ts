export type SettingsSection = "profile" | "account"

export type ProfileForm = {
    name: string
    username: string
    email: string
    bio: string
    website: string
    visibility: "public" | "private"
}

export type ProfileFieldErrors = Partial<
    Record<"name" | "username" | "website" | "bio", string>
>

export type AccountForm = {
    productEmails: boolean
    securityAlerts: boolean
    twoFactor: boolean
    currentPassword: string
    newPassword: string
}
