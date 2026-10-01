"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef } from "react"
import type { Monaco } from "@monaco-editor/react"
import { getLanguage } from "@/lib/editor/getLanguage"
import { buildFileUri } from "@/lib/lsp/buildFileUri"
import { attachModel, detachModel } from "@/lib/lsp/bridge"
import { useFileStore } from "@/store/fileStore"

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

interface MonacoEditorProps {
    projectId: string
    runtime: string
    file: {
        id: string
        name: string
        content: string
    } | null
    onChange: (content: string) => void
}

export default function MonacoEditor({ projectId, runtime, file, onChange }: MonacoEditorProps) {

    const files = useFileStore((s) => s.files)

    const editorRef = useRef<any>(null)
    const monacoRef = useRef<Monaco | null>(null)

    function handleBeforeMount(monaco: Monaco) {
        if (runtime != "node") return

        monaco.languages.typescript.typescriptDefaults.setModeConfiguration({
            hovers: false,
        })

        monaco.languages.typescript.javascriptDefaults.setModeConfiguration({
            hovers: false,
        })

        monaco.typescript.typescriptDefaults.setModeConfiguration({
            hovers: false,
        })
    }

    function handleMount(editor: any, monaco: Monaco) {
        editorRef.current = editor
        monacoRef.current = monaco

        const model = editor.getModel()

        if (model) {
            attachModel(model, monaco)
        }

    }

    useEffect(() => {
        return () => {
            const model = editorRef.current?.getModel()

            if (model) {
                detachModel(model)
            }
        }
    }, [])

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
                path={buildFileUri(projectId, file.id, files)}
                height="100%"
                theme="vs-dark"
                language={language}
                value={file.content}
                beforeMount={handleBeforeMount}
                onMount={handleMount}
                onChange={(value) => onChange(value ?? "")}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    hover: { above: false as any },
                }}
            />
        </div>
    )
}
