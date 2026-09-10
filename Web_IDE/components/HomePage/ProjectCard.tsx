import { ArrowRight, Folder } from "lucide-react"
import { cn } from "@/lib/utils"

type ProjectCardProps = {
    name: string
    updatedAt: string
    onClick: () => void
}

export default function ProjectCard({ name, updatedAt, onClick }: ProjectCardProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "group w-full rounded-sm border border-outline bg-surface p-5 text-left",
                "transition-colors duration-150 cursor-pointer",
                "hover:bg-surface-hover"
            )}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xsm bg-canvas border border-outline">
                        <Folder
                            size={20}
                            className="text-foreground-muted"
                        />
                    </div>

                    <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-foreground">
                            {name}
                        </h3>

                        <p className="mt-1 wrap-break-words text-xs text-foreground-subtle">
                            Updated {updatedAt}
                        </p>
                    </div>
                </div>

                <ArrowRight
                    size={18}
                    className="ml-4 shrink-0 text-foreground-subtle transition-transform duration-200 group-hover:translate-x-1"
                />
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-outline pt-4">
                <span className="text-xs text-foreground-muted">
                    Project
                </span>

                <span className="text-sm font-medium text-foreground">
                    Open
                </span>
            </div>
        </button>
    )
}