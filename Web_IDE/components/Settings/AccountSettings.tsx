import { useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  KeyRound,
  Laptop,
  Link2,
  LoaderCircle,
  LogOut,
  Mail,
} from "lucide-react"
import { FaGithub } from "react-icons/fa"

import { SectionHeading } from "@/components/Settings/SectionHeading"
import { Toggle } from "@/components/Settings/Toggle"
import type { OAuthProvider } from "@/lib/api/settings/identity.service"
import type { AccountForm } from "@/types/settings"

const inputClass =
  "w-full rounded-xsm border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200/70"
const labelClass = "mb-1.5 block text-sm font-medium text-zinc-800"
const cardClass = "rounded-sm border border-zinc-200 bg-white"

type AccountSettingsProps = {
  account: AccountForm
  onAccountChange: (field: keyof AccountForm, value: string | boolean) => void
  onPasswordChange: () => Promise<void>
  passwordSaving: boolean
  passwordMessage: string
  passwordError: string
  linkedProviders: string[]
  email: string
  onProviderConnect: (provider: OAuthProvider) => Promise<void>
  providerLoading: OAuthProvider | null
  providerError: string
  onEmailSetup: (password: string) => Promise<void>
  emailSetupSaving: boolean
  emailSetupMessage: string
  hasPasswordLogin: boolean
  onEmailPreferenceChange: (
    field: "securityAlerts" | "productEmails",
    value: boolean,
  ) => Promise<void>
  emailPreferencesSaving: boolean
  emailPreferencesMessage: string
  emailPreferencesError: string
  onDeleteAccount: () => Promise<void>
}

export function AccountSettings({
  account,
  onAccountChange,
  onPasswordChange,
  passwordSaving,
  passwordMessage,
  passwordError,
  linkedProviders,
  email,
  onProviderConnect,
  providerLoading,
  providerError,
  onEmailSetup,
  emailSetupSaving,
  emailSetupMessage,
  hasPasswordLogin,
  onEmailPreferenceChange,
  emailPreferencesSaving,
  emailPreferencesMessage,
  emailPreferencesError,
  onDeleteAccount,
}: AccountSettingsProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [deleteAccountSaving, setDeleteAccountSaving] = useState(false)
  const [deleteAccountError, setDeleteAccountError] = useState("")
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailForm, setEmailForm] = useState({
    password: "",
    confirmPassword: "",
  })
  const [emailFormError, setEmailFormError] = useState("")
  const [showEmailPassword, setShowEmailPassword] = useState(false)

  const providers = [
    { id: "email", label: "Email", description: "Email and password authentication" },
    { id: "google", label: "Google", description: "Sign in with your Google account" },
    { id: "github", label: "GitHub", description: "Sign in with your GitHub account" },
  ] as const

  const handleEmailFormSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    setEmailFormError("")

    if (!email) {
      setEmailFormError("Your account does not have a primary email address.")
      return
    }

    if (emailForm.password.length < 8) {
      setEmailFormError("Password must be at least 8 characters.")
      return
    }

    if (emailForm.password !== emailForm.confirmPassword) {
      setEmailFormError("Passwords do not match.")
      return
    }

    try {
      await onEmailSetup(emailForm.password)
      setEmailForm({ password: "", confirmPassword: "" })
      setShowEmailForm(false)
    } catch (error) {
      setEmailFormError(
        error instanceof Error
          ? error.message
          : "Could not set your password. Please try again.",
      )
    }
  }

  return (
    <>
      <section className={`${cardClass} p-5 sm:p-6`}>
        <SectionHeading
          title="Connected accounts"
          description="Manage the sign-in methods associated with your account."
        />

        <div className="divide-y divide-zinc-100">
          {providers.map((provider) => {
            const connected =
              provider.id === "email"
                ? linkedProviders.includes("email") || hasPasswordLogin
                : linkedProviders.includes(provider.id)

            return (
              <div
                key={provider.id}
                className="flex items-start justify-between gap-3 py-4 first:pt-0 last:pb-0 sm:items-center sm:gap-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xsm bg-zinc-100">
                    {provider.id === "email" ? (
                      <Mail size={17} className="text-zinc-700" />
                    ) : provider.id === "google" ? (
                      <span className="font-semibold text-zinc-700">G</span>
                    ) : (
                      <FaGithub size={17} className="text-zinc-700" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{provider.label}</p>
                    <p className="mt-1 break-all text-xs text-zinc-500">
                      {provider.id === "email"
                        ? email || "No primary email available"
                        : provider.description}
                    </p>
                  </div>
                </div>

                {connected ? (
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    <CheckCircle2 size={13} />
                    Connected
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (provider.id === "email") {
                        setShowEmailForm((current) => !current)
                        setEmailFormError("")
                        return
                      }
                      void onProviderConnect(provider.id)
                    }}
                    disabled={providerLoading !== null || (provider.id === "email" && !email)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xsm border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {providerLoading === provider.id ? (
                      <LoaderCircle size={14} className="animate-spin" />
                    ) : (
                      <Link2 size={14} />
                    )}
                    {provider.id === "email" ? "Set password" : "Connect"}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {showEmailForm && !hasPasswordLogin && (
          <form
            onSubmit={handleEmailFormSubmit}
            className="mt-4 space-y-4 rounded-xsm border border-zinc-200 bg-zinc-50 p-4"
          >
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">
                Set up email and password
              </h3>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Set a password for this account. Your primary email and connected OAuth providers will remain unchanged.
              </p>
            </div>

            <div>
              <label className={labelClass} htmlFor="connect-email">
                Account email
              </label>
              <input
                id="connect-email"
                type="email"
                value={email}
                readOnly
                className={`${inputClass} cursor-not-allowed bg-zinc-100`}
              />
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                You will use this email address and your password to sign in.
              </p>
            </div>

            <div>
              <label className={labelClass} htmlFor="connect-email-password">
                Password
              </label>
              <input
                id="connect-email-password"
                type={showEmailPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={emailForm.password}
                onChange={(event) =>
                  setEmailForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                className={inputClass}
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="confirm-email-password">
                Confirm password
              </label>
              <input
                id="confirm-email-password"
                type={showEmailPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={emailForm.confirmPassword}
                onChange={(event) =>
                  setEmailForm((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
                className={inputClass}
                placeholder="Re-enter your password"
              />
              <button
                type="button"
                onClick={() => setShowEmailPassword((current) => !current)}
                className="mt-2 text-xs font-medium text-zinc-600 hover:text-zinc-900"
              >
                {showEmailPassword ? "Hide passwords" : "Show passwords"}
              </button>
            </div>

            {emailFormError && (
              <p className="text-sm text-red-600" role="alert">
                {emailFormError}
              </p>
            )}
            {emailSetupMessage && (
              <p className="text-sm text-emerald-700" role="status">
                {emailSetupMessage}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowEmailForm(false)
                  setEmailFormError("")
                  setEmailForm({ password: "", confirmPassword: "" })
                }}
                className="rounded-xsm border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={emailSetupSaving}
                className="rounded-xsm bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {emailSetupSaving ? "Setting password..." : "Set password"}
              </button>
            </div>
          </form>
        )}

        {providerError && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {providerError}
          </p>
        )}
      </section>

      {hasPasswordLogin && (
        <section className={`${cardClass} p-5 sm:p-6`}>
          <SectionHeading
            title="Security"
            description="Manage how you authenticate and protect your account."
          />
          <div className="divide-y divide-zinc-100">
              <div className="flex items-start gap-3 py-4 first:pt-0 sm:items-center">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xsm bg-zinc-100">
                <Mail size={17} className="text-zinc-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Primary email address</p>
                <p className="mt-1 break-all text-xs leading-5 text-zinc-500">
                  {email || "No primary email available"}
                </p>
              </div>
              <p className="shrink-0 text-xs text-zinc-400">Read only</p>
            </div>

            <div className="flex items-start gap-3 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xsm bg-zinc-100">
                <KeyRound size={17} className="text-zinc-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Change password</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Choose a strong, unique password for your account.
                </p>
              </div>
            </div>

            <div className="grid gap-4 py-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="current-password">
                  Current password
                </label>
                <input
                  id="current-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={inputClass}
                  placeholder="Enter current password"
                  value={account.currentPassword}
                  onChange={(event) =>
                    onAccountChange("currentPassword", event.target.value)
                  }
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="new-password">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                    className={`${inputClass} pr-10`}
                    placeholder="Enter new password"
                    value={account.newPassword}
                    onChange={(event) =>
                      onAccountChange("newPassword", event.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide passwords" : "Show passwords"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {passwordError && (
              <p className="pb-3 text-sm text-red-600" role="alert">
                {passwordError}
              </p>
            )}
            {passwordMessage && (
              <p className="pb-3 text-sm text-emerald-700" role="status">
                {passwordMessage}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-4">
              <p className="text-xs text-zinc-400">
                Password updates are handled by Supabase Auth.
              </p>
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onAccountChange("currentPassword", "")
                    onAccountChange("newPassword", "")
                  }}
                  className="rounded-xsm border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Clear fields
                </button>
                <button
                  type="button"
                  onClick={() => void onPasswordChange()}
                  disabled={passwordSaving || account.newPassword.length < 8}
                  className="rounded-xsm bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {passwordSaving ? "Updating..." : "Update password"}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Two-factor authentication deferred for v1. Re-enable only after the full MFA login and server enforcement flows are implemented. */}

      <section className={`${cardClass} p-5 sm:p-6`}>
        <SectionHeading
          title="Email preferences"
          description="Choose which non-essential account emails you want to receive."
        />
        <div className="divide-y divide-zinc-100">
          <div className="flex items-center gap-4 py-4 first:pt-0">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Security alerts</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Emails about sign-ins and important security events. Critical service and account notices may still be sent.
              </p>
            </div>
            <Toggle
              label="Security alerts"
              enabled={account.securityAlerts}
              onChange={(value) => void onEmailPreferenceChange("securityAlerts", value)}
            />
          </div>
          <div className="flex items-center gap-4 py-4 last:pb-0">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Product updates</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Occasional updates about Kitty IDE features and improvements.
              </p>
            </div>
            <Toggle
              label="Product updates"
              enabled={account.productEmails}
              onChange={(value) => void onEmailPreferenceChange("productEmails", value)}
            />
          </div>
        </div>
        {emailPreferencesSaving && (
          <p className="mt-3 text-xs text-zinc-500" role="status">Saving email preferences…</p>
        )}
        {emailPreferencesError && (
          <p className="mt-3 text-sm text-red-600" role="alert">{emailPreferencesError}</p>
        )}
        {!emailPreferencesError && emailPreferencesMessage && !emailPreferencesSaving && (
          <p className="mt-3 text-sm text-emerald-700" role="status">{emailPreferencesMessage}</p>
        )}
      </section>

      <section className={`${cardClass} p-5 sm:p-6`}>
        <SectionHeading
          title="Sessions"
          description="Review the devices currently associated with your account."
        />
        <div className="flex items-start gap-3 rounded-xsm border border-zinc-200 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xsm bg-zinc-100">
            <Laptop size={19} className="text-zinc-700" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium">Current session</p>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                This device
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Detailed device information and per-session revocation are not available in this UI.
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-400">
              <Clock3 size={12} />
              Session details unavailable
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled
          className="mt-4 inline-flex cursor-not-allowed items-center gap-2 rounded-xsm border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-400"
        >
          <LogOut size={14} />
          Sign out other sessions
        </button>
        <p className="mt-2 text-xs text-zinc-400">
          Session revocation is not connected yet.
        </p>
      </section>

      <section className="rounded-sm border border-red-200 bg-white p-5 sm:p-6">
        <SectionHeading
          title="Danger zone"
          description="Actions here can permanently affect your account."
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-medium text-zinc-900">Delete account</p>
              <p className="mt-1 max-w-md text-xs leading-5 text-zinc-500">
                Permanently delete your account and associated personal data. This requires server-side safeguards and confirmation.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              setShowDeleteConfirmation((current) => !current)
            }
            className="w-full shrink-0 rounded-xsm border border-red-200 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-50 sm:w-auto"
          >
            {showDeleteConfirmation ? "Cancel" : "Delete account"}
          </button>
        </div>
        {showDeleteConfirmation && (
          <form
            className="mt-4 space-y-4 rounded-xsm border border-red-200 bg-red-50 p-4"
            onSubmit={async (event) => {
              event.preventDefault()
              setDeleteAccountError("")
              if (deleteConfirmation !== "DELETE") {
                setDeleteAccountError('Type DELETE exactly to confirm account deletion.')
                return
              }

              setDeleteAccountSaving(true)
              try {
                await onDeleteAccount()
              } catch (error) {
                setDeleteAccountError(
                  error instanceof Error
                    ? error.message
                    : "Account deletion failed. Please try again.",
                )
                setDeleteAccountSaving(false)
              }
            }}
          >
            <div>
              <p className="text-sm font-semibold text-red-900">
                Permanently delete your account?
              </p>
              <p className="mt-1 text-xs leading-5 text-red-800">
                This deletes your Kitty IDE account, profile, projects, and files stored in the database. This action cannot be undone.
              </p>
            </div>
            <div>
              <label htmlFor="delete-account-confirmation" className={labelClass}>
                Type <span className="font-bold">DELETE</span> to continue
              </label>
              <input
                id="delete-account-confirmation"
                autoComplete="off"
                spellCheck={false}
                value={deleteConfirmation}
                onChange={(event) => setDeleteConfirmation(event.target.value)}
                className={`${inputClass} border-red-200 focus:border-red-400 focus:ring-red-100`}
                disabled={deleteAccountSaving}
                required
              />
            </div>
            {deleteAccountError && (
              <p className="text-sm text-red-700" role="alert">
                {deleteAccountError}
              </p>
            )}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deleteAccountSaving}
                onClick={() => {
                  setShowDeleteConfirmation(false)
                  setDeleteConfirmation("")
                  setDeleteAccountError("")
                }}
                className="w-full rounded-xsm border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={deleteAccountSaving || deleteConfirmation !== "DELETE"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xsm bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {deleteAccountSaving && <LoaderCircle size={14} className="animate-spin" />}
                {deleteAccountSaving ? "Deleting account…" : "Permanently delete account"}
              </button>
            </div>
          </form>
        )}
      </section>
    </>
  )
}
