import { Folder } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
    name: string
    lastOpened: string
    onClick?: () => void
}

export default function ProjectCard({
    name,
    lastOpened,
    onClick,
}: Props) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center text-center",
                "w-36 h-36",
                "bg-neutral-900 border border-neutral-800",
                "rounded-xl",
                "hover:bg-neutral-800 hover:border-neutral-700",
                "hover:scale-[1.02]",
                "transition-all"
            )}
        >
            <Folder
                size={36}
                className="text-neutral-300 mb-3"
            />

            <span className="text-sm font-medium text-neutral-200">
                {name}
            </span>

            <span className="text-xs text-neutral-500 mt-1">
                {lastOpened}
            </span>

        </button>
    )
}