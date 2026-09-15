"use client"

import { getLanguage } from "@/lib/editor/getLanguage"
import dynamic from "next/dynamic"

const Editor = dynamic(
    () => import("@monaco-editor/react"),
    { ssr: false }
)

interface MonacoEditorProps {
    file: {
        id: string
        name: string
        content: string
    } | null
    onChange: (content: string) => void
}

export default function MonacoEditor({ file, onChange }: MonacoEditorProps) {

    if (!file) {
        return (
            <div className="flex-1 flex items-center justify-center text-zinc-500 bg-zinc-950">
                Open a file to start editing
            </div>
        )
    }

    const language = getLanguage(file.name)

    return (
        <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
            <Editor
                height="100%"
                theme="vs-dark"
                language={language}
                value={file.content}
                onChange={(value) => onChange(value ?? "")}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14
                }}
            />
        </div>
    )
}