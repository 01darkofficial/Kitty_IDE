import Image from "next/image"
import { useRef } from "react"
import {
  AlertTriangle,
  Camera,
  Eye,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react"
import { SectionHeading } from "@/components/Settings/SectionHeading"
import type { ProfileFieldErrors, ProfileForm } from "@/types/settings"

const inputClass = "w-full rounded-xsm border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200/70"
const labelClass = "mb-1.5 block text-sm font-medium text-zinc-800"
const cardClass = "rounded-sm border border-zinc-200 bg-white"

type ProfileSettingsProps = {
  profile: ProfileForm
  onChange: (field: keyof ProfileForm, value: string) => void
  fieldErrors: ProfileFieldErrors
  avatarUrl: string | null
  avatarUploading: boolean
  avatarError: string
  onAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function ProfileSettings({
  profile,
  onChange,
  fieldErrors,
  avatarUrl,
  avatarUploading,
  avatarError,
  onAvatarChange,
}: ProfileSettingsProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <section className={`${cardClass} p-5 sm:p-6`}>
        <SectionHeading title="Profile information" description="This information represents you across Kitty IDE." />
        <div className="flex flex-col gap-5 border-b border-zinc-100 pb-6 sm:flex-row sm:items-center">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-2xl font-semibold text-zinc-500">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Profile avatar" fill sizes="80px" className="rounded-full object-cover" />
            ) : profile.name.trim() ? (
              profile.name.trim().charAt(0).toUpperCase()
            ) : (
              <UserRound size={28} strokeWidth={1.5} />
            )}
            <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onAvatarChange} />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              aria-label="Change profile picture"
              title={avatarUploading ? "Uploading avatar..." : "Change profile picture"}
              className="absolute -bottom-1 -right-1 z-20 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {avatarUploading ? <span className="text-xs">...</span> : <Camera size={14} />}
            </button>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium">Profile picture</p>
            <p className="mt-1 text-xs leading-5 text-zinc-500">Your avatar will appear beside your projects and profile.</p>
            <p className="mt-2 text-xs text-zinc-400">{avatarUploading ? "Uploading your profile picture..." : "JPG, PNG, or WebP. Maximum size: 2 MB."}</p>
            {avatarError && <p className="mt-2 text-sm text-red-500" role="alert">{avatarError}</p>}
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="display-name">Display name</label>
            <input
              id="display-name" type="text" value={profile.name} maxLength={80}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "display-name-error" : undefined}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="Enter your display name"
              className={`${inputClass} ${fieldErrors.name ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""}`}
            />
            <p className="mt-1.5 text-xs text-zinc-400">The name other users see.</p>
            {fieldErrors.name && <p id="display-name-error" className="mt-1.5 flex items-start gap-1.5 text-xs text-red-600" role="alert"><AlertTriangle size={13} className="mt-0.5 shrink-0" /><span>{fieldErrors.name}</span></p>}
          </div>

          <div>
            <label className={labelClass} htmlFor="username">Username</label>
            <div className="space-y-1.5">
              <div className={`flex overflow-hidden rounded-xsm border bg-white transition focus-within:ring-2 ${fieldErrors.username ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-100" : "border-zinc-200 focus-within:border-zinc-400 focus-within:ring-zinc-200/70"}`}>
                <span className={`flex items-center border-r px-3 text-sm ${fieldErrors.username ? "border-red-200 bg-red-50 text-red-400" : "border-zinc-200 bg-zinc-50 text-zinc-400"}`}>@</span>
                <input
                  id="username" aria-invalid={Boolean(fieldErrors.username)}
                  aria-describedby={fieldErrors.username ? "username-error" : undefined}
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-zinc-400"
                  placeholder="username" value={profile.username}
                  onChange={(e) => onChange("username", e.target.value.replace(/\s/g, ""))}
                />
              </div>
              {fieldErrors.username && <p id="username-error" className="flex items-start gap-1.5 text-xs text-red-600" role="alert"><AlertTriangle size={13} className="mt-0.5 shrink-0" /><span>{fieldErrors.username}</span></p>}
            </div>
            <p className="mt-1.5 text-xs text-zinc-400">Used to identify your profile.</p>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="profile-email">Email address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input id="profile-email" type="email" className={`${inputClass} bg-zinc-200 pl-9`} placeholder="you@example.com" value={profile.email} disabled />
            </div>
            <p className="mt-1.5 text-xs text-zinc-400">Account email changes require verification.</p>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="bio">Bio <span className="ml-2 font-normal text-zinc-400">Optional</span></label>
            <textarea
              id="bio" rows={3} maxLength={300} aria-invalid={Boolean(fieldErrors.bio)}
              aria-describedby={fieldErrors.bio ? "bio-error" : undefined}
              className={`${inputClass} resize-y ${fieldErrors.bio ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""}`}
              placeholder="A short introduction about yourself..." value={profile.bio}
              onChange={(e) => onChange("bio", e.target.value)}
            />
            <div className="mt-1.5 flex items-start justify-between gap-3">
              {fieldErrors.bio ? <p id="bio-error" className="flex items-start gap-1.5 text-xs text-red-600" role="alert"><AlertTriangle size={13} className="mt-0.5 shrink-0" /><span>{fieldErrors.bio}</span></p> : <span className="text-xs text-zinc-400">A short introduction about yourself.</span>}
              <p className={`shrink-0 text-right text-xs ${profile.bio.length >= 280 ? "text-amber-600" : "text-zinc-400"}`}>{profile.bio.length}/300</p>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="website">Website <span className="ml-2 font-normal text-zinc-400">Optional</span></label>
            <div className={`mt-1.5 flex overflow-hidden rounded-xsm border bg-white transition focus-within:ring-2 ${fieldErrors.website ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-100" : "border-zinc-200 focus-within:border-zinc-400 focus-within:ring-zinc-200/70"}`}>
              <input
                id="website" type="url" aria-invalid={Boolean(fieldErrors.website)}
                aria-describedby={fieldErrors.website ? "website-error" : undefined}
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-zinc-400"
                placeholder="https://your-website.com" value={profile.website}
                onChange={(e) => onChange("website", e.target.value)}
              />
            </div>
            {fieldErrors.website && <p id="website-error" className="mt-1.5 flex items-start gap-1.5 text-xs text-red-600" role="alert"><AlertTriangle size={13} className="mt-0.5 shrink-0" /><span>{fieldErrors.website}</span></p>}
          </div>
        </div>
      </section>

      <section className={`${cardClass} p-5 sm:p-6`}>
        <div className="flex items-center justify-between gap-3">
          <SectionHeading title="Profile visibility" description="Control how your profile is presented to other people." />
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${profile.visibility === "public" ? "bg-green-500" : "bg-zinc-400"}`} title={`Current visibility: ${profile.visibility}`} aria-label={`Current visibility: ${profile.visibility}`} />
        </div>
        <div className="space-y-3">
          <label className={`flex cursor-pointer items-start gap-3 rounded-xsm border p-4 transition ${profile.visibility === "private" ? "border-zinc-400 bg-zinc-50" : "border-zinc-200 hover:bg-zinc-50/70"}`}>
            <input type="radio" name="visibility" value="private" checked={profile.visibility === "private"} onChange={(e) => onChange("visibility", e.target.value)} className="mt-1 accent-zinc-900" />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-sm font-medium"><LockKeyhole size={15} />Private profile</span>
              <span className="mt-1 block text-xs leading-5 text-zinc-500">Keep your profile information visible only where needed for your account.</span>
            </span>
          </label>
          <label className={`flex cursor-pointer items-start gap-3 rounded-xsm border p-4 transition ${profile.visibility === "public" ? "border-zinc-400 bg-zinc-50" : "border-zinc-200 hover:bg-zinc-50/70"}`}>
            <input type="radio" name="visibility" value="public" checked={profile.visibility === "public"} onChange={(e) => onChange("visibility", e.target.value)} className="mt-1 accent-zinc-900" />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-sm font-medium"><Eye size={15} />Public profile</span>
              <span className="mt-1 block text-xs leading-5 text-zinc-500">Allow others to view your public profile details. Enforcing public visibility in profile queries/RLS is a separate backend task.</span>
            </span>
          </label>
        </div>
      </section>
    </>
  )
}
