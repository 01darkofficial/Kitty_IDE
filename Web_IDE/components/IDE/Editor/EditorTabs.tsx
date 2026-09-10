"use client"

import { cn } from "@/lib/utils"
import { FileNode } from "@/types/db"
import { X } from "lucide-react"

interface EditorTabsProps {
    tabs: FileNode[]
    activeFile: FileNode | null
    onSwitch: (file: FileNode) => void
    onClose: (fileId: string) => void
}

export default function EditorTabs({
    tabs,
    activeFile,
    onSwitch,
    onClose
}: EditorTabsProps) {

    if (!tabs.length) return null

    return (
        <div className="flex shrink-0 overflow-x-auto border-b border-zinc-800 bg-zinc-900 no-scrollbar">
            {tabs.map((file: FileNode) => {
                const active = activeFile?.id === file.id

                return (
                    <div
                        key={file.id}
                        className={cn(
                            "group flex shrink-0 items-center gap-2 border-r border-zinc-800 px-3 py-2 text-sm",
                            "cursor-pointer transition-colors duration-150",
                            active ? "bg-zinc-950 text-zinc-100"
                                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"

                        )}
                        onClick={() => onSwitch(file)}
                    >
                        <span className="max-w-40 truncate">
                            {file.name}
                        </span>

                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onClose(file.id)
                            }}
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}