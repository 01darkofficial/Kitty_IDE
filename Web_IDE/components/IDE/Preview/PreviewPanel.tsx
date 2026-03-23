"use client"

import { RefObject, useEffect } from "react"

interface PreviewPanelProps {
    projectId: string
    iframeRef: RefObject<HTMLIFrameElement | null>
}

export default function PreviewPanel({
    projectId,
    iframeRef
}: PreviewPanelProps) {

    /*
      Load preview automatically
      when panel mounts
    */

    useEffect(() => {

        if (!iframeRef.current) return

        iframeRef.current.src =
            `/preview/${projectId}/index.html?ts=${Date.now()}`

    }, [projectId])

    return (

        <div className="w-[40%] border-l border-zinc-800 bg-zinc-900 relative">

            <iframe
                ref={iframeRef}
                title="preview"
                sandbox="allow-scripts allow-same-origin"
                className="w-full h-full"
            />

        </div>

    )
}