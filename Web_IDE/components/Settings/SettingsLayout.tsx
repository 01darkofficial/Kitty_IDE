import type { ReactNode } from "react"
import type { SettingsSection } from "@/types/settings"
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  RotateCcw,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react"

type SettingsLayoutProps = {
  section: SettingsSection
  onSectionChange: (section: SettingsSection) => void
  onSave: () => void
  saving: boolean
  saved: boolean
  saveError: string
  hasUnsavedChanges: boolean
  children: ReactNode
}

export function SettingsLayout({
  section,
  onSectionChange,
  onSave,
  saving,
  saved,
  saveError,
  hasUnsavedChanges,
  children,
}: SettingsLayoutProps) {
  const navigation = [
    { id: "profile" as const, label: "Profile", description: "Your public identity", icon: UserRound },
    { id: "account" as const, label: "Account", description: "Security and preferences", icon: ShieldCheck },
  ]

  return (
    <div className="min-h-full bg-[#f5f5f3] text-zinc-900">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-20 sm:px-6 lg:px-8 lg:pb-10 lg:pt-10">
        <header className="mb-8 border-b border-zinc-200 pb-7">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Settings</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                Manage your personal information, account security, and communication preferences.
              </p>
            </div>
            {section === "profile" && (
              <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:items-start">
                <button
                  type="button"
                  onClick={onSave}
                  disabled={!hasUnsavedChanges || saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xsm bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-zinc-900 sm:w-auto"
                >
                  {saving ? <RotateCcw size={15} className="animate-spin" /> : <Save size={15} />}
                  {saving ? "Saving..." : "Save changes"}
                </button>
                {saveError && (
                  <div className="flex max-w-lg items-start gap-2.5 rounded-xsm border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700" role="alert">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
                    <p className="leading-5">{saveError}</p>
                  </div>
                )}
                {saved && !saveError && (
                  <p className="flex items-center gap-2 text-sm text-emerald-700" role="status">
                    <CheckCircle2 size={14} /> Changes saved successfully.
                  </p>
                )}
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-6">
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Preferences</p>
            <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Settings sections">
              {navigation.map((item) => {
                const Icon = item.icon
                const active = section === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSectionChange(item.id)}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-w-0 flex-1 items-center gap-2 rounded-xsm px-3 py-3 text-left transition sm:gap-3 lg:flex-none ${active ? "bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-200" : "text-zinc-500 hover:bg-white/70 hover:text-zinc-800"
                      }`}
                  >
                    <Icon size={18} strokeWidth={1.8} className={active ? "text-zinc-900" : "text-zinc-400"} />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{item.label}</span>
                      <span className="mt-0.5 hidden text-xs text-zinc-400 sm:block">{item.description}</span>
                    </span>
                  </button>
                )
              })}
            </nav>
            <div className="mt-8 hidden rounded-xsm border border-zinc-200 bg-white p-4 lg:block">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100">
                <Info size={16} className="text-zinc-600" />
              </div>
              <p className="mt-3 text-sm font-medium">Need help?</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">Having trouble with your account or workspace?</p>
              <button type="button" className="mt-3 text-xs font-medium text-zinc-800 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-800">
                Contact support
              </button>
            </div>
          </aside>

          <main className="min-w-0 space-y-6">
            {children}
            <footer className="flex flex-col justify-between gap-2 border-t border-zinc-200 pt-5 sm:flex-row sm:items-center">
              <p className="text-xs text-zinc-400">Kitty IDE · Settings</p>
              <p className="text-xs text-zinc-400">Some account controls are not connected yet</p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  )
}
