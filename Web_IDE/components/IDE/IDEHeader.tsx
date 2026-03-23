"use client"

import { Project } from "@/types/db"

interface IDEHeaderProps {
    project: Project
    previewUrl?: string
}

export default function IDEHeader({
    project,
    previewUrl
}: IDEHeaderProps) {

    return (

        <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-4">

            <div className="font-semibold">
                {project.name}
            </div>

            {/* Preview link only for static projects */}

            {previewUrl && (

                <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded"
                >
                    Open Preview ↗
                </a>

            )}

        </div>

    )
}