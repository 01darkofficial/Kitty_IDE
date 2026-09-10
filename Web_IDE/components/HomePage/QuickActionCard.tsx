import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
    icon: React.ElementType
    label: string
    description: string
    onClick: () => void
}

export default function QuickActionCard({ icon: Icon, label, description, onClick }: Props) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "group flex items-center justify-between",
                "rounded-sm border border-outline bg-surface",
                "px-5 py-4 cursor-pointer",
                "transition-all duration-200",
                "hover:bg-surface-hover"
            )}
        >
            <div className="flex min-w-0 w-full items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xsm bg-canvas border border-outline">
                    <Icon
                        size={20}
                        className="text-foreground-muted"
                    />
                </div>

                <div className="min-w-0 flex-1 text-left">
                    <h3 className="text-sm font-semibold text-foreground">
                        {label}
                    </h3>

                    <p className="mt-1 wrap-break-words text-xs text-foreground-subtle">
                        {description}
                    </p>
                </div>
            </div>

            <ArrowRight
                size={18}
                className=" ml-4 shrink-0 text-foreground-subtle transition-transform duration-150 group-hover:translate-x-1 sm:self-auto"
            />
        </button>
    )
}