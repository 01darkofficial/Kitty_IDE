type ToggleProps = {
  enabled: boolean
  onChange: (value: boolean) => void
  label: string
}

export function Toggle({ enabled, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${enabled ? "bg-zinc-900" : "bg-zinc-300"
        }`}
    >
      <span
        className={`pointer-events-none absolute left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${enabled ? "translate-x-4" : "translate-x-0"
          }`}
      />
    </button>
  )
}