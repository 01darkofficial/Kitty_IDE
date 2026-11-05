"use client"

import { useCallback, useEffect, useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { profileSchema } from "@/lib/validation/profile"
import { updateDisplayName, updatePassword, updateProfileRecord } from "@/lib/api/settings/profile.service"
import { uploadAndSaveAvatar } from "@/lib/api/settings/avatar.service"
import { SettingsLayout } from "@/components/Settings/SettingsLayout"
import { ProfileSettings } from "@/components/Settings/ProfileSettings"
import { AccountSettings } from "@/components/Settings/AccountSettings"
import type { AccountForm, ProfileFieldErrors, ProfileForm, SettingsSection } from "@/types/settings"
import {
    addEmailPassword,
    getLinkedProviders,
    linkOAuthProvider,
    type OAuthProvider,
} from "@/lib/api/settings/identity.service"
import {
    defaultEmailPreferences,
    getEmailPreferences,
    updateEmailPreference as saveEmailPreference,
} from "@/lib/api/settings/emailPreferences.service"
import { supabase } from "@/lib/supabase/supabaseClient"


const initialProfile: ProfileForm = {
    name: "",
    username: "",
    email: "",
    bio: "",
    website: "",
    visibility: "private",
}

const initialAccount: AccountForm = {
    productEmails: true,
    securityAlerts: true,
    twoFactor: false,
    currentPassword: "",
    newPassword: "",
}

export default function SettingsPage() {
    const [section, setSection] = useState<SettingsSection>("profile")
    const [profile, setProfile] = useState<ProfileForm>(initialProfile)
    const [savedProfile, setSavedProfile] = useState<ProfileForm>(initialProfile)
    const [account, setAccount] = useState<AccountForm>(initialAccount)
    const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({})
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [saveError, setSaveError] = useState("")
    const [avatarUploading, setAvatarUploading] = useState(false)
    const [avatarError, setAvatarError] = useState("")
    const [passwordSaving, setPasswordSaving] = useState(false)
    const [passwordMessage, setPasswordMessage] = useState("")
    const [passwordError, setPasswordError] = useState("")

    const authUser = useAuthStore((state) => state.user)
    const authProfile = useAuthStore((state) => state.profile)
    const authLoading = useAuthStore((state) => state.loading)
    const clearAuth = useAuthStore((state) => state.clearAuth)


    const [linkedProviders, setLinkedProviders] = useState<string[]>([])
    const [providerLoading, setProviderLoading] = useState<OAuthProvider | null>(null)
    const [providerError, setProviderError] = useState("")
    const [emailSetupSaving, setEmailSetupSaving] = useState(false)
    const [emailSetupMessage, setEmailSetupMessage] = useState("")
    const [hasPasswordLogin, setHasPasswordLogin] = useState(false)
    const [emailPreferencesSaving, setEmailPreferencesSaving] = useState(false)
    const [emailPreferencesMessage, setEmailPreferencesMessage] = useState("")
    const [emailPreferencesError, setEmailPreferencesError] = useState("")

    const hasUnsavedChanges =
        profile.name !== savedProfile.name ||
        profile.username !== savedProfile.username ||
        profile.bio !== savedProfile.bio ||
        profile.website !== savedProfile.website ||
        profile.visibility !== savedProfile.visibility

    useEffect(() => {
        if (!authUser) return

        let cancelled = false

        getLinkedProviders()
            .then((providers) => {
                if (!cancelled) setLinkedProviders(providers)
            })
            .catch((error) => {
                if (!cancelled) {
                    setProviderError(
                        error instanceof Error
                            ? error.message
                            : "Could not load connected accounts."
                    )
                }
            })

        return () => {
            cancelled = true
        }
    }, [authUser?.id])

    useEffect(() => {
        if (!authUser?.id) {
            setAccount((current) => ({
                ...current,
                ...defaultEmailPreferences,
            }))
            setHasPasswordLogin(false)
            return
        }

        setHasPasswordLogin(authUser.user_metadata?.has_password_login === true)
        let cancelled = false

        getEmailPreferences(authUser.id)
            .then((preferences) => {
                if (!cancelled) {
                    setAccount((current) => ({ ...current, ...preferences }))
                }
            })
            .catch((error) => {
                console.error("Failed to load email preferences:", error)
                if (!cancelled) {
                    setEmailPreferencesError("Could not load email preferences. Please refresh and try again.")
                }
            })

        return () => {
            cancelled = true
        }
    }, [authUser?.id, authUser?.user_metadata?.has_password_login])

    useEffect(() => {
        if (authLoading || !authUser || !authProfile) return

        const values: ProfileForm = {
            name: authUser.user_metadata?.full_name ??
                authUser.user_metadata?.name ??
                authProfile.username,
            username: authProfile.username ?? "",
            email: authUser.email ?? "",
            bio: authProfile.bio ?? "",
            website: authProfile.website ?? "",
            visibility: authProfile.visibility ?? "private",
        }

        setProfile(values)
        setSavedProfile(values)
    }, [authLoading, authUser, authProfile])

    const updateProfileField = useCallback((field: keyof ProfileForm, value: string) => {
        setProfile((current) => ({ ...current, [field]: value }))
        setSaved(false)
        setSaveError("")
        setFieldErrors((current) => ({ ...current, [field]: undefined }))
    }, [])

    const updateAccountField = useCallback((field: keyof AccountForm, value: string | boolean) => {
        setAccount((current) => ({ ...current, [field]: value }))
        setPasswordMessage("")
        setPasswordError("")
    }, [])

    const handleEmailPreferenceChange = async (
        field: "securityAlerts" | "productEmails",
        value: boolean,
    ) => {
        if (!authUser?.id) {
            setEmailPreferencesError("You must be signed in to update email preferences.")
            return
        }

        const previousValue = account[field]
        setAccount((current) => ({ ...current, [field]: value }))
        setEmailPreferencesSaving(true)
        setEmailPreferencesError("")
        setEmailPreferencesMessage("")

        try {
            await saveEmailPreference(authUser.id, field, value)
            setEmailPreferencesMessage("Email preferences saved.")
        } catch (error) {
            console.error("Failed to save email preference:", error)
            setAccount((current) => ({ ...current, [field]: previousValue }))
            setEmailPreferencesError(
                error instanceof Error
                    ? error.message
                    : "Could not save email preferences. Please try again.",
            )
        } finally {
            setEmailPreferencesSaving(false)
        }
    }

    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ""
        if (!file) return

        if (!authUser || !authProfile) {
            setAvatarError("You must be signed in to upload an avatar.")
            return
        }

        setAvatarUploading(true)
        setAvatarError("")

        try {
            const result = await uploadAndSaveAvatar(authUser.id, file, authProfile.avatar_url)
            useAuthStore.getState().setAuth(authUser, {
                ...authProfile,
                ...result.profile,
            })
            if (result.cleanupWarning) setAvatarError(result.cleanupWarning)
        } catch (error) {
            console.error("Avatar upload failed:", error)
            setAvatarError(error instanceof Error ? error.message : "Avatar upload failed. Please try again.")
        } finally {
            setAvatarUploading(false)
        }
    }

    const handleSave = async () => {
        if (!authUser || !authProfile) {
            setSaveError("You must be signed in to update your profile.")
            return
        }

        const result = profileSchema.safeParse({
            name: profile.name,
            username: profile.username,
            website: profile.website,
            bio: profile.bio,
            visibility: profile.visibility,
        })

        if (!result.success) {
            const errors: ProfileFieldErrors = {}
            for (const issue of result.error.issues) {
                const field = issue.path[0]
                if (
                    (field === "name" || field === "username" || field === "website" || field === "bio") &&
                    !errors[field]
                ) {
                    errors[field] = issue.message
                }
            }
            setFieldErrors(errors)
            setSaveError("")
            setSaved(false)
            return
        }

        setFieldErrors({})
        setSaveError("")
        setSaved(false)
        setSaving(true)

        const { name, ...profileValues } = result.data

        try {
            const record = await updateProfileRecord(authUser.id, profileValues)
            let updatedUser = authUser

            try {
                updatedUser = await updateDisplayName(name)
            } catch (error) {
                throw new Error(
                    `Profile fields were saved, but display name update failed: ${error instanceof Error ? error.message : "Unknown error"
                    }`
                )
            }

            useAuthStore.getState().setAuth(updatedUser, {
                ...authProfile,
                ...record,
            })

            const nextProfile: ProfileForm = {
                ...profile,
                name,
                username: record.username,
                bio: record.bio,
                website: record.website,
                visibility: record.visibility,
            }
            setProfile(nextProfile)
            setSavedProfile(nextProfile)
            setSaved(true)
        } catch (error) {
            console.error("Failed to save profile:", error)
            setSaveError(error instanceof Error ? error.message : "Failed to save profile. Please try again.")
        } finally {
            setSaving(false)
        }
    }

    const handlePasswordChange = async () => {
        setPasswordError("")
        setPasswordMessage("")

        const currentPassword = account.currentPassword
        const newPassword = account.newPassword

        if (!currentPassword) {
            setPasswordError("Enter your current password.")
            return
        }

        if (!newPassword) {
            setPasswordError("Enter a new password.")
            return
        }

        if (newPassword.length < 8) {
            setPasswordError("Your new password must be at least 8 characters.")
            return
        }

        if (currentPassword === newPassword) {
            setPasswordError("Your new password must differ from your current password.")
            return
        }

        setPasswordSaving(true)

        try {
            await updatePassword(newPassword)

            setPasswordMessage("Password updated successfully.")
            setAccount((current) => ({
                ...current,
                currentPassword: "",
                newPassword: "",
            }))
        } catch (error) {
            console.error("Password update failed:", error)

            setPasswordError(
                error instanceof Error
                    ? error.message
                    : "Password update failed. Please try again."
            )
        } finally {
            setPasswordSaving(false)
        }
    }

    const handleProviderConnect = async (provider: OAuthProvider) => {
        setProviderError("")
        setProviderLoading(provider)

        try {
            await linkOAuthProvider(provider)
            // Supabase redirects to the OAuth provider.
        } catch (error) {
            setProviderError(
                error instanceof Error
                    ? error.message
                    : `Could not connect ${provider}.`
            )
            setProviderLoading(null)
        }
    }

    const handleEmailSetup = async (password: string) => {
        setEmailSetupSaving(true)
        setPasswordError("")
        setEmailSetupMessage("")

        try {
            const updatedUser = await addEmailPassword(password)
            setHasPasswordLogin(updatedUser?.user_metadata?.has_password_login === true)
            setEmailSetupMessage("Password set successfully.")
            setAccount((current) => ({ ...current, newPassword: "" }))
            const providers = await getLinkedProviders()
            setLinkedProviders(providers)
        } catch (error) {
            console.error("Could not set password:", error)
            setPasswordError(
                error instanceof Error
                    ? error.message
                    : "Could not set password authentication.",
            )
            throw error
        } finally {
            setEmailSetupSaving(false)
        }
    }

    const handleDeleteAccount = async () => {
        const response = await fetch("/api/auth/user", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        })

        if (!response.ok) {
            const body = await response.json().catch(() => null)
            throw new Error(body?.error ?? "Account deletion failed. Please try again.")
        }

        // The server has already deleted the account. Clear this browser's local auth state.
        await supabase.auth.signOut({ scope: "local" }).catch(() => ({ error: null }))
        clearAuth()
        window.location.assign("/")
    }


    return (
        <SettingsLayout
            section={section}
            onSectionChange={(nextSection) => {
                setSection(nextSection)
                setSaved(false)
                setSaveError("")
            }}
            onSave={() => void handleSave()}
            saving={saving}
            saved={saved}
            saveError={saveError}
            hasUnsavedChanges={hasUnsavedChanges}
        >
            {section === "profile" ? (
                <ProfileSettings
                    profile={profile}
                    onChange={updateProfileField}
                    fieldErrors={fieldErrors}
                    avatarUrl={authProfile?.avatar_url ?? null}
                    avatarUploading={avatarUploading}
                    avatarError={avatarError}
                    onAvatarChange={handleAvatarChange}
                />
            ) : (
                <AccountSettings
                    account={account}
                    onAccountChange={updateAccountField}
                    onPasswordChange={handlePasswordChange}
                    passwordSaving={passwordSaving}
                    passwordMessage={passwordMessage}
                    passwordError={passwordError}
                    linkedProviders={linkedProviders}
                    email={authUser?.email ?? ""}
                    onProviderConnect={handleProviderConnect}
                    providerLoading={providerLoading}
                    providerError={providerError}
                    onEmailSetup={handleEmailSetup}
                    emailSetupSaving={emailSetupSaving}
                    emailSetupMessage={emailSetupMessage}
                    hasPasswordLogin={hasPasswordLogin}
                    onEmailPreferenceChange={handleEmailPreferenceChange}
                    emailPreferencesSaving={emailPreferencesSaving}
                    emailPreferencesMessage={emailPreferencesMessage}
                    emailPreferencesError={emailPreferencesError}
                    onDeleteAccount={handleDeleteAccount}

                />
            )}
        </SettingsLayout>
    )
}
