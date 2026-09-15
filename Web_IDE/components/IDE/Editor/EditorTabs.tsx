"use client"

import { cn } from "@/lib/utils"
import { useFileStore } from "@/store/fileStore"
import { FileNode } from "@/types/db"
import { X } from "lucide-react"

interface EditorTabsProps {
    tabs: FileNode[]
    activeFileId: String | null
    onSwitch: (file: FileNode) => void
    onClose: (fileId: string) => void
}

export default function EditorTabs({
    tabs,
    activeFileId,
    onSwitch,
    onClose
}: EditorTabsProps) {

    const editorFiles = useFileStore((s) => s.editorFiles)

    if (!tabs.length) return null

    return (
        <div className="flex shrink-0 overflow-x-auto border-b border-zinc-800 bg-zinc-900 no-scrollbar">
            {tabs.map((file) => {
                const active = activeFileId === file.id
                const dirty = editorFiles[file.id]?.dirty

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
                            className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-zinc-800"
                        >
                            {dirty ? (
                                <>
                                    <div className="h-2 w-2 rounded-full bg-zinc-300 transition-opacity group-hover:opacity-0" />
                                    <X
                                        size={14}
                                        className="absolute text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100"
                                    />
                                </>
                            ) : (
                                <X size={14} className="text-zinc-500 transition-colors group-hover:text-zinc-100" />
                            )}
                        </button>
                    </div>
                )
            })}
        </div>
    )
}