type Props = {
    title: string
    versions: string[]
    selected: string
    onSelect: (version: string) => void
    prefix: string
}

export default function VersionSelector({
    title,
    versions,
    selected,
    onSelect,
    prefix,
}: Props) {

    return (
        <div>

            <label className="text-sm text-zinc-500 mb-3 block">
                {title}
            </label>

            <div className="grid grid-cols-3 gap-3">

                {
                    versions.map((version) => (
                        <button
                            key={version}
                            onClick={() => onSelect(version)}
                            className={`rounded-xl border px-4 py-4 transition-all ${selected === version
                                ? "border-zinc-500 bg-zinc-800 text-zinc-100"
                                : "border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:border-zinc-700"
                                }`}
                        >
                            {prefix} {version}
                        </button>
                    ))
                }

            </div>

        </div>
    )
}