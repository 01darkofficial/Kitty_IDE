"use client"
import { RefObject } from "react"

interface PreviewPanelProps {
    projectId: string;
    iframeRef: RefObject<HTMLIFrameElement | null>;
    hasRun: boolean;
}

export default function PreviewPanel({ projectId, iframeRef, hasRun }: PreviewPanelProps) {

    return (
        <div className="w-[40%] border-l border-zinc-800 bg-zinc-950 relative">

            {/* iframe ALWAYS exists */}
            <iframe
                ref={iframeRef}
                title="preview"
                sandbox="allow-scripts allow-same-origin"
                className="w-full h-full"
            />

            {/* overlay instead of conditional render */}
            {!hasRun && (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-500 bg-zinc-950">
                    Click "Run" to preview
                </div>
            )}

        </div>
    )
}