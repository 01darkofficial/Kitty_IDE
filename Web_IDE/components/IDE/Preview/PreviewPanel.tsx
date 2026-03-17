"use client"
import { RefObject } from "react"

interface PreviewPanelProps {
    projectId: string;
    iframeRef: RefObject<HTMLIFrameElement | null>;
}

export default function PreviewPanel({ projectId, iframeRef }: PreviewPanelProps) {

    return (
        <div className="w-[40%] border-l border-zinc-800 bg-zinc-950">

            <iframe
                ref={iframeRef}
                title="preview"
                sandbox="allow-scripts allow-same-origin"
                className="w-full h-full"
                src={`/preview/${projectId}/index.html`}
            />

        </div>
    )
}