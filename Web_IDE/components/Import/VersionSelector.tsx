"use client";

import { cn } from "@/lib/utils"

type VersionSelectorProps = {
    versions: string[]
    selected: string
    onSelect: (version: string) => void
    prefix: string
}

export default function VersionSelector({
    versions,
    selected,
    onSelect,
    prefix,
}: VersionSelectorProps) {
    return (
        <div className="grid grid-cols-3 gap-3">
            {versions.map((version) => {
                const active = selected === version;
                return (
                    <button
                        key={version}
                        type="button"
                        onClick={() => onSelect(version)}
                        className={cn(
                            "rounded-sm border p-4 transition-all duration-150",
                            active
                                ? "border-accent bg-surface-active text-foreground shadow-sm"
                                : "border-outline bg-surface text-foreground-muted hover:border-accent hover:bg-surface-hover  hover:text-foreground"
                        )}
                    >
                        <div className="text-sm font-medium">
                            {prefix} {version}
                        </div>

                        {version === versions[0] && (
                            <div className="mt-1 text-xs text-foreground-subtle">
                                Recommended
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}