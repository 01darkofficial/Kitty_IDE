"use client"

import { cn } from "@/lib/utils"

interface WorkspaceButtonProps {
    active?: boolean
    title: string
    onClick?: () => void
    children: React.ReactNode
}

export default function WorkspaceButton({
    active = false,
    title,
    onClick,
    children,
}: WorkspaceButtonProps) {
    return (
        <button
            title={title}
            onClick={onClick}
            className={cn(
                "flex h-9 w-9 items-center justify-center rounded-sm transition-all duration-200 cursor-pointer",
                active ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
            )}
        >
            {children}
        </button>
    );
}