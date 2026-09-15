"use client"

import { useEffect, useRef } from "react"
import IDEHeader from "./IDEHeader"
import ExplorerPanel from "./Explorer/ExplorerPanel"
import EditorTabs from "./Editor/EditorTabs"
import MonacoEditor from "./Editor/MonacoEditor"
import PreviewPanel from "./Preview/PreviewPanel"
import TerminalPanel from "./Terminal/TerminalPanel"
import { useFileStore } from "@/store/fileStore"
import { useExplorerStore } from "@/store/explorerStore"
import { FileNode, Project } from "@/types/db"
import { useProjectWebSocket } from "@/hooks/ide/useProjectWS"
import { useFileTabs } from "@/hooks/ide/useFileTabs"
import { useFileActions } from "@/hooks/ide/useFileActions"
import { useManualSave, useDebouncedSave } from "@/hooks/ide/useFileSave"
import { useNodeKeepAlive } from "@/hooks/ide/useNodeKeepAlive"
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useMediaQuery } from "@/hooks/ide/useMediaQuery"
import ResizeHandle from "./ResizeHandle";
import { cn } from "@/lib/utils"
import { updateServerPreviewCache } from "@/lib/apiClient/projects/preview"

interface IDELayoutProps {
    project: Project
    files: FileNode[]
}

export default function IDELayout({ project, files: initialFiles }: IDELayoutProps) {

    const files = useFileStore((s) => s.files)
    const setFiles = useFileStore((s) => s.setFiles)

    const activeFileId = useFileStore((s) => s.activeFileId)
    const editorFiles = useFileStore((s) => s.editorFiles)

    const updateFileContentInStore = useFileStore((s) => s.updateFileContent)

    const activeFileMeta = activeFileId
        ? files.find((f) => f.id === activeFileId)
        : null

    const activeEditorFile = activeFileId
        ? editorFiles[activeFileId]
        : null

    const activeFile =
        activeFileMeta && activeEditorFile
            ? {
                ...activeFileMeta,
                ...activeEditorFile,
            }
            : null
    const setSelectedNodeId = useExplorerStore(s => s.setSelectedNode)
    const setActiveContainerId = useExplorerStore(s => s.setActiveContainer)
    const {
        explorerOpen,
        explorerWidth,
        explorerMinWidth,
        explorerMaxWidth,
        setExplorerOpen,
        setExplorerWidth,

        terminalOpen,
        terminalHeight,
        terminalMinHeight,
        terminalMaxHeight,
        setTerminalOpen,
        setTerminalHeight,

        previewOpen,
        previewWidth,
        previewMinWidth,
        previewMaxWidth,
        setPreviewOpen,
        setPreviewWidth,

        mobileWorkspace,

        setIsResizing,
        setMobileWorkspace,
    } = useWorkspaceStore()

    const iframeRef = useRef<HTMLIFrameElement>(null)

    const isMobile = useMediaQuery("(max-width: 767px), (pointer: coarse) and (max-height: 500px)")
    const isDesktop = useMediaQuery("(min-width: 1024px)")

    const isResizing = useWorkspaceStore((s) => s.isResizing)

    useEffect(() => {
        setFiles(initialFiles)
    }, [initialFiles, setFiles])

    useEffect(() => {
        setExplorerOpen(true)

        if (isMobile) {
            setTerminalOpen(false)
            setPreviewOpen(false)
            setMobileWorkspace("editor")
        } else {
            setTerminalOpen(project.runtime === "node")
            setPreviewOpen(project.runtime === "static")
        }
    }, [
        isMobile,
        project.id,
        project.runtime,
        setExplorerOpen,
        setTerminalOpen,
        setPreviewOpen,
        setMobileWorkspace,
    ])

    useProjectWebSocket(project.id)
    useManualSave(project.id)
    useDebouncedSave(project.id)
    useNodeKeepAlive(project.id, project.runtime)

    const { tabs, openFile, closeTab, switchTab } = useFileTabs(project.id)
    const { handleCreateInline, handleNodeAction } = useFileActions(project)

    function selectRoot() {
        setSelectedNodeId(null)
        setActiveContainerId(null)
    }

    function handleEditorChange(content: string) {
        if (!activeFileId) return

        updateFileContentInStore(activeFileId, content)
        updateServerPreviewCache(project.id, activeFileId, content).then(() => {
            iframeRef.current?.contentWindow?.location.reload()
        }).catch(console.error)
    }

    function renameFile(fileId: string, newName: string) {
        console.log(fileId, newName)
    }

    function startExplorerResize() {
        if (!isDesktop) return

        setIsResizing(true)

        function onMove(e: MouseEvent) {
            setExplorerWidth(Math.min(Math.max(e.clientX, explorerMinWidth), explorerMaxWidth))
        }

        function onUp() {
            setIsResizing(false);
            window.removeEventListener("mousemove", onMove)
            window.removeEventListener("mouseup", onUp)
        }

        window.addEventListener("mousemove", onMove)
        window.addEventListener("mouseup", onUp)
    }

    function startPreviewResize() {
        if (!isDesktop) return

        setIsResizing(true)

        function onMove(e: MouseEvent) {
            const width = window.innerWidth - e.clientX

            setPreviewWidth(Math.min(Math.max(width, previewMinWidth), previewMaxWidth))
        }

        function onUp() {
            setIsResizing(false)
            window.removeEventListener("mousemove", onMove)
            window.removeEventListener("mouseup", onUp)
        }

        window.addEventListener("mousemove", onMove)
        window.addEventListener("mouseup", onUp)
    }

    function startTerminalResize() {
        if (!isDesktop) return

        setIsResizing(true)

        function onMove(e: MouseEvent) {
            const height = window.innerHeight - e.clientY
            setTerminalHeight(Math.min(Math.max(height, terminalMinHeight), terminalMaxHeight))
        }

        function onUp() {
            setIsResizing(false)

            window.removeEventListener("mousemove", onMove)
            window.removeEventListener("mouseup", onUp)
        }

        window.addEventListener("mousemove", onMove)
        window.addEventListener("mouseup", onUp)
    }

    function openPreview() {
        window.open(`/preview/${project.id}/index.html?ts=${Date.now()}`, "_blank")
    }

    const showEditorWorkspace = !isMobile || mobileWorkspace === "editor";
    const showTerminalWorkspace = isMobile && mobileWorkspace === "terminal";
    const showPreviewWorkspace = isMobile && mobileWorkspace === "preview";

    return (
        <div className={cn(
            "flex h-dvh flex-col overflow-hidden text-zinc-100",
            isResizing ? "select-none cursor-col-resize" : ""
        )} >
            <IDEHeader project={project} onOpenPreview={openPreview} />

            <div className="flex min-h-0 flex-1 overflow-hidden">
                <div
                    className={cn(
                        "shrink-0 overflow-hidden transition-[width] ease-out",
                        isResizing ? "duration-0" : "duration-150")
                    }
                    style={{
                        width: explorerOpen ? explorerWidth : 0,
                    }}
                >
                    <ExplorerPanel
                        files={files}
                        onSelect={openFile}
                        onAction={handleNodeAction}
                        onCreateInline={handleCreateInline}
                        onSelectRoot={selectRoot}
                        onRenameSubmit={renameFile}
                    />
                </div>


                {explorerOpen && isDesktop && (
                    <ResizeHandle direction="vertical" onMouseDown={startExplorerResize} />
                )}

                <div className={cn("flex min-w-0 min-h-0 flex-1",
                    isResizing ? "select-none cursor-col-resize" : "")}>
                    {showEditorWorkspace && (
                        <div className={cn(
                            "flex min-h-0 flex-1",
                            project.runtime === "node" && "flex-col"
                        )}>
                            <div className="flex min-h-0 flex-1 flex-col">
                                <EditorTabs
                                    tabs={tabs}
                                    activeFileId={activeFileId}
                                    onSwitch={switchTab}
                                    onClose={closeTab}
                                />

                                <div className="min-h-0 flex-1 overflow-hidden">
                                    <div className="flex h-full min-h-0 min-w-0 overflow-hidden">
                                        <MonacoEditor file={activeFile} onChange={handleEditorChange} />
                                    </div>
                                </div>
                            </div>

                            {project.runtime === "static" && previewOpen && isDesktop && (
                                <ResizeHandle direction="vertical" onMouseDown={startPreviewResize} />
                            )}

                            {project.runtime === "static" && (
                                <div
                                    className={cn(
                                        "shrink-0 overflow-hidden transition-[width] ease-out",
                                        isResizing ? "duration-0" : "duration-150"
                                    )}
                                    style={{ width: previewOpen ? previewWidth : 0 }}
                                >
                                    <PreviewPanel projectId={project.id} iframeRef={iframeRef} />
                                </div>
                            )}

                            {project.runtime === "node" && terminalOpen && isDesktop && (
                                <ResizeHandle direction="horizontal" onMouseDown={startTerminalResize} />
                            )}

                            {project.runtime === "node" && (
                                <div
                                    className={cn(
                                        "shrink-0 overflow-hidden transition-[height] ease-out",
                                        isResizing ? "duration-0" : "duration-150"
                                    )}
                                    style={{ height: terminalOpen ? terminalHeight : 0 }}
                                >
                                    <TerminalPanel projectId={project.id} />
                                </div>
                            )}
                        </div>
                    )}

                    {showTerminalWorkspace && project.runtime === "node" && (
                        <div className="min-h-0 flex-1">
                            <TerminalPanel projectId={project.id} />
                        </div>
                    )}

                    {showPreviewWorkspace && project.runtime === "static" && (
                        <div className="min-h-0 flex-1">
                            <PreviewPanel projectId={project.id} iframeRef={iframeRef} />
                        </div>
                    )}
                </div>
            </div>
        </div >
    )
}