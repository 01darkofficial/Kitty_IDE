"use client"

import { RefObject, useEffect } from "react"
import { useWorkspaceStore } from "@/store/workspaceStore"

interface PreviewPanelProps {
    projectId: string
    iframeRef: RefObject<HTMLIFrameElement | null>
}

export default function PreviewPanel({ projectId, iframeRef }: PreviewPanelProps) {

    const isResizing = useWorkspaceStore((s) => s.isResizing)

    useEffect(() => {
        if (!iframeRef.current) return
        iframeRef.current.src = `/preview/${projectId}/index.html?ts=${Date.now()}`
    }, [projectId])

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