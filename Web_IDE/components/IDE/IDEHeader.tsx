"use client"

import Link from "next/link"
import Image from "next/image"
import { PanelLeft, SquareTerminal, MonitorPlay, ExternalLink } from "lucide-react"
import WorkspaceButton from "./WorkspaceButton"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { Project } from "@/types/db"
import { useMediaQuery } from "@/hooks/ide/useMediaQuery"

interface IDEHeaderProps {
    project: Project
    onOpenPreview: () => void
}

export default function IDEHeader({ project, onOpenPreview }: IDEHeaderProps) {

    const {
        explorerOpen,
        terminalOpen,
        previewOpen,

        toggleExplorer,
        toggleTerminal,
        togglePreview,

        mobileWorkspace,

        setMobileWorkspace,
        setExplorerOpen
    } = useWorkspaceStore()

    const isMobile = useMediaQuery("(max-width: 767px), (pointer: coarse) and (max-height: 500px)")
    const explorerActive = explorerOpen
    const terminalActive = isMobile ? mobileWorkspace === "terminal" : terminalOpen
    const previewActive = isMobile ? mobileWorkspace === "preview" : previewOpen

    function toggleExplorerFunc() {
        if (isMobile) {
            setExplorerOpen(!explorerOpen)
        } else {
            toggleExplorer()
        }
    }
    function togglePreviewFunc() {
        if (isMobile) {
            setMobileWorkspace(mobileWorkspace === "preview" ? "editor" : "preview")
        } else {
            togglePreview()
        }
    }
    function toggleTerminalFunc() {
        if (isMobile) {
            setMobileWorkspace(mobileWorkspace === "terminal" ? "editor" : "terminal")
        } else {
            toggleTerminal()
        }
    }

    return (
        <header className="flex h-12 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 lg:px-6">
            <div className="flex w-1/3 items-center gap-2">
                <Link href={"/app"} target="_blank" rel="noopener noreferrer">
                    <Image src="/logo.jpg" alt="Kitty IDE"
                        width={34}
                        height={34}
                        className="rounded"
                    />

                </Link>
                <h3 className="text-md font-bold">Kitty IDE</h3>
            </div>

            <div className="flex w-1/3 justify-center">
                <h1 className="max-w-full truncate px-4 text-sm font-semibold text-zinc-100">
                    {project.name}
                </h1>
            </div>

            <div className="flex w-1/3 justify-end items-center gap-2">
                <WorkspaceButton
                    title="Explorer"
                    active={explorerActive}
                    onClick={toggleExplorerFunc}
                >
                    <PanelLeft size={18} />
                </WorkspaceButton>

                {project.runtime === "node" && (
                    <WorkspaceButton
                        title="Terminal"
                        active={terminalActive}
                        onClick={toggleTerminalFunc}
                    >
                        <SquareTerminal size={18} />
                    </WorkspaceButton>
                )}

                {project.runtime === "static" && (
                    <>
                        <WorkspaceButton
                            title="Preview"
                            active={previewActive}
                            onClick={togglePreviewFunc}
                        >
                            <MonitorPlay size={18} />
                        </WorkspaceButton>
                        <WorkspaceButton
                            title="Open Preview in New Tab"
                            onClick={onOpenPreview}
                        >
                            <ExternalLink size={18} />
                        </WorkspaceButton>
                    </>
                )}
            </div>
        </header>
    )
}