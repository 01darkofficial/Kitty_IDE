"use client"

import { useState, useEffect, useRef } from "react"
import IDEHeader from "./IDEHeader"
import ExplorerPanel from "./Explorer/ExplorerPanel"
import EditorTabs from "./Editor/EditorTabs"
import MonacoEditor from "./Editor/MonacoEditor"
import PreviewPanel from "./Preview/PreviewPanel"
import { createNode, saveFile } from "@/lib/api/projects/files"
import { useFileStore } from "@/store/fileStore"
import CreateItemDialog from "./Explorer/CreateItemDialog"
import { FileNode } from "@/types/db"
import TerminalPanel from "./Terminal/TerminalPanel"

export default function IDELayout({ project, files: initialFiles }: any) {

    const files = useFileStore((s) => s.files)
    const setFiles = useFileStore((s) => s.setFiles)

    useEffect(() => {
        setFiles(initialFiles)
    }, [initialFiles])

    const [tabs, setTabs] = useState<FileNode[]>([])

    const activeFile = useFileStore((s) => s.activeFile)
    const setActiveFile = useFileStore((s) => s.setActiveFile)

    const [selectedFolder, setSelectedFolder] =
        useState<string | null>(null)

    const [selectedNodeId, setSelectedNodeId] =
        useState<string | null>(null)

    const [fileDialogOpen, setFileDialogOpen] =
        useState(false)

    const [folderDialogOpen, setFolderDialogOpen] =
        useState(false)

    const iframeRef =
        useRef<HTMLIFrameElement>(null)

    /*
      Create File
    */

    const createFile = async (name: string) => {

        const node: FileNode =
            await createNode(project.id, {
                id: crypto.randomUUID(),
                project_id: project.id,
                parent_id: selectedFolder,
                name,
                type: "file",
                content: "",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })

        setFiles([...files, node])
    }

    /*
      Create Folder
    */

    const createFolder = async (name: string) => {

        const node: FileNode =
            await createNode(project.id, {
                id: crypto.randomUUID(),
                project_id: project.id,
                parent_id: selectedFolder,
                name,
                type: "folder",
                content: "",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })

        setFiles([...files, node])
    }

    const loadFiles = () => {
        setFiles(initialFiles)
    }

    /*
      Auto-save on Ctrl+S
      Static runtime → refresh preview
    */

    useEffect(() => {

        const handler = (e: KeyboardEvent) => {

            if ((e.ctrlKey || e.metaKey) && e.key === "s") {

                e.preventDefault()

                if (!activeFile) return

                saveFile(activeFile)

                /*
                  Static → reload preview
                */

                if (project.runtime === "static") {

                    if (iframeRef.current) {

                        iframeRef.current.src =
                            `/preview/${project.id}/index.html?ts=${Date.now()}`

                    }

                }
            }
        }

        window.addEventListener("keydown", handler)

        return () =>
            window.removeEventListener("keydown", handler)

    }, [activeFile, project.runtime, project.id])

    /*
      Node Runtime Ping Loop
      Keeps container alive
    */

    useEffect(() => {

        if (project.runtime !== "node")
            return

        const sendPing = () => {

            fetch("http://localhost:4000/ping", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    projectId: project.id
                })
            }).catch(() => { })
        }

        sendPing()

        const interval =
            setInterval(sendPing, 10000)

        return () =>
            clearInterval(interval)

    }, [project.id, project.runtime])

    /*
      File Open Logic
    */

    function openFile(file: FileNode) {

        setSelectedNodeId(file.id)

        if (file.type === "folder") {

            setSelectedFolder(file.id)
            return
        }

        const exists =
            tabs.find(t => t.id === file.id)

        if (!exists) {
            setTabs([...tabs, file])
        }

        setActiveFile(file)
    }

    function closeTab(fileId: string) {

        const newTabs =
            tabs.filter(t => t.id !== fileId)

        setTabs(newTabs)

        if (activeFile?.id === fileId) {

            setActiveFile(
                newTabs[newTabs.length - 1] || null
            )
        }
    }

    function switchTab(file: any) {
        setActiveFile(file)
    }

    function updateFileContent(content: string) {

        if (!activeFile) return

        const updated =
            files.map((f: any) =>
                f.id === activeFile.id
                    ? { ...f, content }
                    : f
            )

        setFiles(updated)

        setActiveFile({
            ...activeFile,
            content
        })
    }

    /*
      Render
    */

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
                    selectedNodeId={selectedNodeId!}
                    onNewFile={() =>
                        setFileDialogOpen(true)
                    }
                    onNewFolder={() =>
                        setFolderDialogOpen(true)
                    }
                    onRefresh={loadFiles}
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

                        {/* Static → Preview */}
                        {project.runtime === "static" && (

                            <PreviewPanel
                                projectId={project.id}
                                iframeRef={iframeRef}
                            />

                        )}

                    </div>

                    {/* Node → Terminal */}
                    {project.runtime === "node" && (

                        <TerminalPanel
                            projectId={project.id}
                        />

                    )}

                </div>

            </div>

            <CreateItemDialog
                open={fileDialogOpen}
                onOpenChange={setFileDialogOpen}
                type="file"
                onCreate={createFile}
            />

            <CreateItemDialog
                open={folderDialogOpen}
                onOpenChange={setFolderDialogOpen}
                type="folder"
                onCreate={createFolder}
            />

        </div>
    )
}