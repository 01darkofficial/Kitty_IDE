import { cn } from "@/lib/utils"

type Props = {
    icon: React.ElementType
    label: string
    onClick?: () => void
}

export default function QuickActionCard({
    icon: Icon,
    label,
    onClick,
}: Props) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center",
                "w-32 h-32",
                "bg-neutral-900 border border-neutral-800",
                "rounded-xl",
                "hover:bg-neutral-800 hover:border-neutral-700",
                "transition-all"
            )}
        >
            <Icon
                size={32}
                className="text-neutral-300 mb-3"
            />

            <span className="text-sm text-neutral-200">
                {label}
            </span>

        </button>
    )
}