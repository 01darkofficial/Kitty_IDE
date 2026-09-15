"use client"

import { RefObject, useEffect } from "react"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { useFileStore } from "@/store/fileStore"

interface PreviewPanelProps {
    projectId: string
    iframeRef: RefObject<HTMLIFrameElement | null>
}

export default function PreviewPanel({ projectId, iframeRef }: PreviewPanelProps) {

    const isResizing = useWorkspaceStore((s) => s.isResizing)
    const previewLoaded = useFileStore((s) => s.previewLoaded)
    const setEditorFiles = useFileStore((s) => s.setEditorFiles)

    useEffect(() => {

        if (previewLoaded) return

        async function loadPreview() {

            // Getting all files for preview
            const res = await fetch(`/api/projects/${projectId}/preview`)

            if (!res.ok) {
                console.error("Failed to load preview files")
                return
            }

            const data = await res.json()

            // All files cache for client
            setEditorFiles(data.files)

            // All files cache for server to preview/render
            await fetch(`/api/projects/${projectId}/previewCache`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    files: data.files,
                }),
            })

            iframeRef.current!.src = `/preview/${projectId}/index.html?ts=${Date.now()}`
        }

        loadPreview()

    }, [projectId, previewLoaded, setEditorFiles])

    return (
        <div className="relative h-full w-full shrink-0 overflow-hidden border-zinc-800 bg-zinc-900">
            <iframe
                ref={iframeRef}
                title="preview"
                sandbox="allow-scripts allow-same-origin"
                className={`h-full w-full ${isResizing ? "pointer-events-none" : ""}`}
            />
        </div>
    )
}