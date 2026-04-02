"use client"

import { useState, useEffect, useRef } from "react"
import IDEHeader from "./IDEHeader"
import ExplorerPanel from "./Explorer/ExplorerPanel"
import EditorTabs from "./Editor/EditorTabs"
import MonacoEditor from "./Editor/MonacoEditor"
import PreviewPanel from "./Preview/PreviewPanel"
import TerminalPanel from "./Terminal/TerminalPanel"
import { createNode, deleteNodes, saveFile } from "@/lib/api/projects/files"
import { useFileStore } from "@/store/fileStore"
import { FileNode, Project } from "@/types/db"
import { useExplorerStore } from "@/store/explorerStore"
import { ExplorerAction } from "@/types/components/ide"

interface IDELayoutProps {
    project: Project
    files: FileNode[]
}

export default function IDELayout({
    project,
    files: initialFiles
}: IDELayoutProps) {

    /*
    ===============================
    FILE STORE
    ===============================
    */

    const files = useFileStore((s) => s.files)
    const setFiles = useFileStore((s) => s.setFiles)
    const activeFile = useFileStore((s) => s.activeFile)
    const setActiveFile = useFileStore((s) => s.setActiveFile)
    const setSelectedNodeId = useExplorerStore(s => s.setSelectedNode)
    const activeContainerId = useExplorerStore(s => s.activeContainerId)
    const setActiveContainerId = useExplorerStore(s => s.setActiveContainer)
    const creatingNode = useExplorerStore(s => s.creatingNode)
    const setCreatingNode = useExplorerStore(s => s.setCreatingNode)
    const clipboard = useExplorerStore(s => s.clipboard)
    const setClipboard = useExplorerStore(s => s.setClipboard)

    useEffect(() => {
        setFiles(initialFiles)
    }, [initialFiles])

    /*
    ===============================
    TABS
    ===============================
    */

    const [tabs, setTabs] = useState<FileNode[]>([])

    /*
    ===============================
    PREVIEW
    ===============================
    */

    const iframeRef = useRef<HTMLIFrameElement>(null)

    /*
    ===============================
    CREATE FILE
    ===============================
    */

    async function createFile(name: string) {
        if (!creatingNode) return

        const t0 = Date.now()

        const node: FileNode = await createNode(project.id,
            {
                id: crypto.randomUUID(),
                project_id: project.id,
                parent_id: creatingNode.parentId,
                name,
                type: "file",
                content: "",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }
        )

        console.log("Create file total time:", Date.now() - t0)
        setFiles([...files, node])
    }



    /*
    ===============================
    CREATE FOLDER
    ===============================
    */

    async function createFolder(name: string) {
        if (!creatingNode) return

        const t0 = Date.now()

        const node: FileNode = await createNode(project.id,
            {
                id: crypto.randomUUID(),
                project_id: project.id,
                parent_id: creatingNode.parentId,
                name,
                type: "folder",
                content: "",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }
        )

        console.log("Create folder total time:", Date.now() - t0)
        setFiles([...files, node])
    }

    /*
    ===============================
    INLINE CREATE HANDLER
    ===============================
    */

    async function handleCreateInline(name: string | null) {
        if (!creatingNode) {
            setCreatingNode(null)
            return
        }

        if (!name) {
            setCreatingNode(null)
            return
        }

        if (creatingNode.type === "file") {
            await createFile(name)
        } else {
            await createFolder(name)

        }
        setCreatingNode(null)
    }

    /*
    ===============================
    DELETE NODE
    ===============================
    */

    async function deleteNode(nodeId: string) {

        const idsToDelete = new Set<string>()

        function collect(id: string) {
            idsToDelete.add(id)

            files.filter(
                f => f.parent_id === id
            ).forEach(child =>
                collect(child.id)
            )
        }

        collect(nodeId)

        const ids = Array.from(idsToDelete)

        try {
            const t0 = Date.now()

            await deleteNodes(project.id, ids)

            console.log("Delete total time:", Date.now() - t0)

            /*
            Update local state
            */

            const updated = files.filter(f =>
                !idsToDelete.has(f.id)
            )

            setFiles(updated)

        } catch (err) {
            console.error("Delete failed:", err)
        }
    }

    /*
    ===============================
    PASTE NODE
    ===============================
    */

    function pasteNode(targetFolderId: string | null) {

        if (!clipboard.node) return

        if (clipboard.mode === "copy") {

            const cloned = {
                ...clipboard.node,
                id: crypto.randomUUID(),
                parent_id: targetFolderId
            }

            setFiles([...files, cloned])

        }

        if (clipboard.mode === "cut") {

            const updated = files.map(f =>

                f.id === clipboard.node!.id ? {
                    ...f,
                    parent_id: targetFolderId
                } : f

            )

            setFiles(updated)
            setClipboard({
                node: null,
                mode: null
            })
        }
    }

    /*
    ===============================
    CONTEXT ACTIONS
    ===============================
    */

    function handleNodeAction(
        action: ExplorerAction,
        node: FileNode | null
    ) {

        /*
        Prevent duplicate inline rows
        */

        if (
            creatingNode &&
            action.startsWith("new")
        ) return



        switch (action) {

            /*
            ROOT CREATION
            */

            case "new-file-root":

                setCreatingNode({
                    parentId: activeContainerId,
                    type: "file"
                })
                return

            case "new-folder-root":

                setCreatingNode({
                    parentId: activeContainerId,
                    type: "folder"
                })
                return

            /*
            Folder-based creation
            */

            case "new-file":

                if (!node) return

                setCreatingNode({
                    parentId: node.id,
                    type: "file"
                })
                return


            case "new-folder":

                if (!node) return

                setCreatingNode({
                    parentId: node.id,
                    type: "folder"
                })
                return

            /*
            DELETE
            */

            case "delete":

                if (!node) return

                deleteNode(node.id)
                return

            /*
            COPY
            */

            case "copy":

                if (!node) return

                setClipboard({
                    node,
                    mode: "copy"
                })
                return

            /*
            CUT
            */

            case "cut":

                if (!node) return

                setClipboard({
                    node,
                    mode: "cut"
                })
                return

            /*
            PASTE
            */

            case "paste":

                if (!node) return

                if (node.type === "folder") {
                    pasteNode(node.id)
                } else {
                    pasteNode(node.parent_id ?? null)
                }
                return
        }

    }

    /*
    ===============================
    SELECT ROOT
    ===============================
    */

    function selectRoot() {

        setSelectedNodeId(null)
        setActiveContainerId(null)

    }

    /*
    ===============================
    FILE OPEN
    ===============================
    */

    function openFile(file: FileNode) {

        setSelectedNodeId(file.id)

        if (file.type === "folder") {
            setActiveContainerId(file.id)
            return
        }

        /*
        File selected → container becomes its parent
        */

        setActiveContainerId(file.parent_id ?? null)

        const exists = tabs.find(t => t.id === file.id)

        if (!exists) {
            setTabs([
                ...tabs,
                file
            ])
        }

        setActiveFile(file, project.id)

    }

    // function handleFolderCollapse(
    //     folderId: string
    // ) {

    //     if (activeContainerId !== folderId
    //     ) return

    //     /*
    //     Move to parent folder
    //     */

    //     const node = files.find(f => f.id === folderId)
    //     setActiveContainerId(node?.parent_id ?? null)

    // }


    /*
    ===============================
    TAB CONTROL
    ===============================
    */

    function closeTab(fileId: string) {

        const newTabs = tabs.filter(t => t.id !== fileId)

        setTabs(newTabs)

        if (activeFile?.id === fileId) {
            setActiveFile(
                newTabs[newTabs.length - 1] || null,
                project.id
            )
        }
    }

    function switchTab(file: FileNode) {
        setActiveFile(file, project.id)

    }

    function renameFile(fileId: string, newName: string) {
        console.log(fileId, newName)
    }

    /*
    ===============================
    UPDATE FILE CONTENT
    ===============================
    */

    function updateFileContent(content: string) {

        if (!activeFile) return

        const updated = files.map((f: any) =>

            f.id === activeFile.id ? {
                ...f,
                content
            } : f
        )

        setFiles(updated)
        setActiveFile(
            { ...activeFile, content },
            project.id
        )
    }

    /*
    ===============================
    AUTO SAVE
    ===============================
    */

    useEffect(() => {

        const handler = (e: KeyboardEvent) => {

            if ((e.ctrlKey || e.metaKey) && e.key === "s") {

                e.preventDefault()

                if (!activeFile) return

                saveFile(activeFile)

                if (project.runtime === "static") {
                    if (iframeRef.current) {
                        iframeRef.current.src = `/preview/${project.id}/index.html?ts=${Date.now()}`
                    }
                }
            }
        }

        window.addEventListener(
            "keydown",
            handler
        )

        return () => window.removeEventListener("keydown", handler)

    }, [activeFile, project.runtime, project.id])

    /*
    ===============================
    NODE RUNTIME KEEP ALIVE
    ===============================
    */

    useEffect(() => {

        if (project.runtime !== "node") return

        const sendPing = () => {

            fetch("http://localhost:4000/ping",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        projectId: project.id
                    })
                }
            ).catch(() => { })
        }

        sendPing()

        const interval = setInterval(
            sendPing,
            10000
        )

        return () => clearInterval(interval)

    }, [project.id, project.runtime])

    /*
    ===============================
    RENDER
    ===============================
    */

    return (

        <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100">

            <IDEHeader
                project={project}
                previewUrl={
                    project.runtime === "static" ? `/preview/${project.id}/index.html` : undefined
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
                        <TerminalPanel
                            projectId={project.id}
                        />
                    )}

                </div>

            </div>

        </div>

    )
}