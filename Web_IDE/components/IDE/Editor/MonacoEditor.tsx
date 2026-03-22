"use client"

import { getLanguage } from "@/lib/editor/getLanguage"
import { useFileStore } from "@/store/fileStore"
import dynamic from "next/dynamic"

const Editor = dynamic(
    () => import("@monaco-editor/react"),
    { ssr: false }
)

export default function MonacoEditor({ file, onChange }: any) {

    const updateFileContent = useFileStore((s) => s.updateFileContent)
    const activeFile = useFileStore((s) => s.activeFile)

    if (!file) {
        return (
            <div className="flex-1 flex items-center justify-center text-zinc-500 bg-zinc-950">
                Open a file to start editing
            </div>
        )
    }

    const language = getLanguage(file.name)

    return (
        <div className="flex-1">
            <Editor
                key={file.id}
                height="100%"
                theme="vs-dark"
                language={language}
                value={activeFile?.content || ""}
                onChange={(value) => {
                    updateFileContent(activeFile!.id, value ?? "")
                    onChange(value ?? "")
                }}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14
                }}
            />
        </div>
    )
}