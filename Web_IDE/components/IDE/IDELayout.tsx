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
import { useAutoSave } from "@/hooks/ide/useAutoSave"
import { useNodeKeepAlive } from "@/hooks/ide/useNodeKeepAlive"

interface IDELayoutProps {
    project: Project
    files: FileNode[]
}

export default function IDELayout({ project, files: initialFiles }: IDELayoutProps) {

    const files = useFileStore((s) => s.files)
    const setFiles = useFileStore((s) => s.setFiles)
    const activeFile = useFileStore((s) => s.activeFile)
    const setActiveFile = useFileStore((s) => s.setActiveFile)
    const setSelectedNodeId = useExplorerStore(s => s.setSelectedNode)
    const setActiveContainerId = useExplorerStore(s => s.setActiveContainer)

    const iframeRef = useRef<HTMLIFrameElement>(null)

    useEffect(() => {
        setFiles(initialFiles)
    }, [initialFiles])

    // Hooks
    useProjectWebSocket(project.id)
    useAutoSave(project.id, project.runtime, iframeRef)
    useNodeKeepAlive(project.id, project.runtime)

    const { tabs, openFile, closeTab, switchTab } = useFileTabs(project.id)
    const { handleCreateInline, handleNodeAction } = useFileActions(project)

    function selectRoot() {
        setSelectedNodeId(null)
        setActiveContainerId(null)
    }

    function updateFileContent(content: string) {
        if (!activeFile) return
        const updated = files.map((f: any) =>
            f.id === activeFile.id ? { ...f, content } : f
        )
        setFiles(updated)
        setActiveFile({ ...activeFile, content }, project.id)
    }

    function renameFile(fileId: string, newName: string) {
        console.log(fileId, newName)
    }

    return (
        <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100">

            <IDEHeader
                project={project}
                previewUrl={
                    project.runtime === "static"
                        ? `/preview/${project.id}/index.html`
                        : undefined
                }
            />

            <div className="flex flex-1 overflow-hidden">

                <ExplorerPanel
                    files={files}
                    onSelect={openFile}
                    onAction={handleNodeAction}
                    onCreateInline={handleCreateInline}
                    onSelectRoot={selectRoot}
                    onRenameSubmit={renameFile}
                />

                <div className="flex flex-col flex-1">

                    <EditorTabs
                        tabs={tabs}
                        activeFile={activeFile}
                        onSwitch={switchTab}
                        onClose={closeTab}
                    />

                    <div className="flex flex-1 overflow-hidden">

                        <MonacoEditor
                            file={activeFile}
                            onChange={updateFileContent}
                        />

                        {project.runtime === "static" && (
                            <PreviewPanel
                                projectId={project.id}
                                iframeRef={iframeRef}
                            />
                        )}

                    </div>

                    {project.runtime === "node" && (
                        <TerminalPanel projectId={project.id} />
                    )}

                </div>

            </div>

        </div>
    )
}