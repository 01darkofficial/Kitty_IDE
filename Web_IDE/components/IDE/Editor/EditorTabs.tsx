"use client"

import { FileNode } from "@/types/db"
import { X } from "lucide-react"

export default function EditorTabs({
    tabs,
    activeFile,
    onSwitch,
    onClose
}: any) {

    if (!tabs.length) return null;

    return (
        <div className="flex items-center border-b border-zinc-800 bg-zinc-900">

            {tabs.map((file: FileNode) => {

                const active = activeFile?.id === file.id

                return (
                    <div
                        key={file.id}
                        className={`flex items-center gap-2 px-3 py-2 text-sm border-r border-zinc-800 cursor-pointer
              ${active ? "bg-zinc-950" : "bg-zinc-900 hover:bg-zinc-800"}`}
                        onClick={() => onSwitch(file)}
                    >

                        <span>{file.name}</span>

                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onClose(file.id)
                            }}
                            className="text-zinc-400 hover:text-white"
                        >
                            <X size={14} />
                        </button>

                    </div>
                )
            })}

        </div>
    )
}